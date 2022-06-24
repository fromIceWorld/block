import { AttributeType, elementType } from '../../Enums/index';
import {
    CommentTNode,
    ElementTNode,
    TextTNode,
    TNode,
} from './interface/index';
interface Configuration {
    interpolationSyntax: [string, string];
    addAttributeMark?: string;
    addEventMark?: string;
    structureMark?: string;
    referenceMark?: string;
}
let index = 0;
/**
 * 接收 tokenTree,将token解析成指令集。
 *
 * @param treeNode template 解析后生成的 tokenTree
 * @param configuration 配置参数
 */
class Instruction {
    treeNode: TNode[] = [];
    configuration: Configuration = {
        interpolationSyntax: ['{{', '}}'],
        addAttributeMark: '&',
        addEventMark: '@',
        structureMark: '*',
        referenceMark: '#',
    };
    createFn = ``;
    updateFn = ``;
    template?: Function;
    componentDef?: Function;
    elements: Array<Element> = new Array();
    attributes: Array<number | string | string[]>[] = new Array();
    instructionParams: Set<string> = new Set();
    constructor(addConfiguration: Configuration = {} as Configuration) {
        this.configuration = Object.assign(
            this.configuration,
            addConfiguration
        );
    }
    init(treeNode: TNode[]) {
        index = 0; // 初始化全局节点索引
        this.treeNode = treeNode;
        this.createFn = ``;
        this.updateFn = ``;
        this.elements = [];
        this.attributes = [];
        this.instructionParams.clear();
    }
    createFactory(treeNode: TNode[] = []) {
        this.init(treeNode);
        this.resolveTNodes(this.treeNode);
        this.createTemplateFn();
        this.createComponentDef();
    }
    createComponentDef() {
        let componentDef = (this.componentDef = new Function(
            ...Array.from(this.instructionParams),
            `
            let attributes = ${JSON.stringify(this.attributes)};
            return {
                attributes,
                template:${this.template}
            }
        `
        ));
        console.log(componentDef);
    }
    createTemplateFn() {
        this.template = new Function(
            'mode',
            'ctx',
            `
                if(mode & 1){ ${this.createFn}
                };
                if(mode & 2){ ${this.updateFn}
                };
            `
        );
    }
    resolveTNodes(elements: TNode[]) {
        for (let element of elements) {
            let { type } = element;
            switch (type) {
                case elementType.Element:
                    this.resolveElement(element as ElementTNode);
                    break;
                case elementType.Text:
                    this.resolveText(element as TextTNode);
                    break;
                case elementType.Comment:
                    this.resolveComment(element as CommentTNode);
                    break;
            }
        }
    }
    /**
     * 解析节点，生成对应指令集,
     * 此处解析嵌入视图[包含结构性指令 *for, *if]
     *
     * @param element 节点
     */
    resolveElement(element: ElementTNode) {
        this.instructionParams.add('elementStart');
        const { tagName, attributes, closed, children = [] } = element;
        // 嵌入式图

        this.createFn += `
                        elementStart('${tagName}', ${index});`;
        this.resolveAttributes(attributes);
        index++;
        this.resolveTNodes(children);
        this.closeElement(element);
    }
    closeElement(element: ElementTNode) {
        this.instructionParams.add('elementEnd');
        let { tagName } = element;
        this.createFn += `
                        elementEnd('${tagName}');`;
    }
    resolveText(element: TextTNode) {
        this.instructionParams.add('creatText');
        let hasInterpolation = false,
            [start, end] = this.configuration.interpolationSyntax,
            interpolationRegExp = new RegExp(
                `${start}\\s*[a-zA-Z][a-zA-Z0-9]*\\s*${end}`,
                'g'
            ),
            { content } = element;
        hasInterpolation = !!content.match(interpolationRegExp);
        let expression = content.replace(
            interpolationRegExp,
            (interpolation) => {
                return (
                    `' + ctx["` +
                    interpolation
                        .slice(start.length, interpolation.length - end.length)
                        .trim() +
                    `"] + '`
                );
            }
        );
        this.createFn += `
                        creatText(${index},'${expression}');`;
        if (hasInterpolation) {
            this.instructionParams.add('updateText');
            this.updateFn += `
                        updateText(${index},'${expression}');`;
        }
        index++;
    }
    resolveComment(element: CommentTNode) {
        this.instructionParams.add('createComment');
        let { content } = element;
        this.createFn += `
                        createComment(${index}, '${content}');`;
        index++;
    }
    resolveAttributes(attributes: string[]) {
        this.attributes[index] = new Array();
        let hasDynamicAtribute = false,
            { addAttributeMark, addEventMark, structureMark, referenceMark } =
                this.configuration;
        for (let i = 0; i < attributes.length; ) {
            if (attributes[i + 1] == '=') {
                let prefix = attributes[i][0];
                switch (prefix) {
                    case addAttributeMark:
                        hasDynamicAtribute = true;
                        this.addDynamicAttrubute(
                            attributes[i].slice(1),
                            attributes[i + 2]
                        );
                        break;
                    case structureMark:
                        hasDynamicAtribute = true;
                        this.addStructureAttrubute(
                            attributes[i].slice(1),
                            attributes[i + 2]
                        );
                        break;
                    case addEventMark:
                        this.addListener(
                            attributes[i].slice(1),
                            attributes[i + 2]
                        );
                        break;
                    default:
                        this.addStaticAttrubute(
                            attributes[i],
                            attributes[i + 2]
                        );
                        break;
                }
                i += 3;
            } else {
                let prefix = attributes[i][0];
                switch (prefix) {
                    case referenceMark:
                        this.addReference(attributes[i].slice(1));
                        break;
                    default:
                        this.addStaticAttrubute(
                            attributes[i],
                            attributes[i + 2]
                        );
                        break;
                }
                i++;
            }
            if (hasDynamicAtribute) {
                this.updateProperty();
            }
        }
    }
    addStaticAttrubute(key: string, value: string) {
        this.attributes[index].push(AttributeType.staticAttribute, key, value);
    }
    addReference(refKey: string) {
        this.attributes[index].push(AttributeType.reference, refKey, '');
    }
    addStructureAttrubute(key: string, value: string) {
        this.attributes[index].push(AttributeType.structure, key, value);
    }
    addDynamicAttrubute(dynamicKey: string, value: string) {
        this.instructionParams.add('updateProperty');
        let type: number,
            contextValue = [
                'context',
                `with(context){
                    return ${value}
                }`,
            ];
        switch (dynamicKey) {
            case 'style':
                type = AttributeType.dynamicStyle;
                break;
            case 'class':
                type = AttributeType.dynamicClass;
                break;
            default:
                type = AttributeType.dynamicAttrubute;
                break;
        }
        this.attributes[index].push(type, dynamicKey, contextValue);
    }
    updateProperty() {
        this.instructionParams.add('updateProperty');
        this.updateFn += `
                        updateProperty(${index});`;
    }
    addListener(eventName: string, callback: string) {
        this.instructionParams.add('listener');
        this.attributes[index].push(AttributeType.event, eventName, callback);
        let [fn, params] = callback.replace(/[()]/g, ' ').split(' ');
        this.createFn += `
                        listener('${eventName}',function($event){
                                            return ctx['${fn}'](${params});
                                        }, ${index});`;
    }
}
export { Instruction };
