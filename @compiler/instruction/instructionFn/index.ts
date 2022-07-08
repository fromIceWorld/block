import { AttributeType, elementType } from '../../Enums/index';
import { TViewFns } from '../InstructionContext/index';
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
/**
 * 接收 tokenTree,将token解析成指令集。
 *
 * @param treeNode template 解析后生成的 tokenTree
 * @param configuration 配置参数
 */
class Instruction {
    treeNode: TNode[] = [];
    index: number = 0;
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
    attributes: Array<undefined | number | string | string[]>[] = new Array();
    embeddedViews: any[] = [];
    instructionParams: Set<string> = new Set();
    constructor(addConfiguration: Configuration = {} as Configuration) {
        this.configuration = Object.assign(
            this.configuration,
            addConfiguration
        );
    }
    init(treeNode: TNode[]) {
        this.index = 0; // 初始化全局节点索引
        this.treeNode = treeNode;
        this.createFn = ``;
        this.updateFn = ``;
        this.elements = [];
        this.attributes = [];
        this.instructionParams.clear();
    }
    /**
     * 只创造create，update 函数体
     * @param treeNode 节点树
     */
    createFunctionBody(treeNode: TNode[] = []) {
        this.init(treeNode);
        this.resolveTNodes(this.treeNode);
    }
    createFactory(treeNode: TNode[] = []) {
        this.createFunctionBody(treeNode);
        this.createTemplateFn();
        this.createComponentDef();
    }
    createComponentDef() {
        let componentDef = (this.componentDef = new Function(
            ...Array.from(this.instructionParams),
            `
            let embeddedViews = [${
                this.embeddedViews.length
                    ? this.embeddedViews
                          .map((obj) => {
                              let { attributes, template } = obj;
                              return `{
                                    attributes:${JSON.stringify(attributes)},
                                    template:${template.toString()}
                                  }`;
                          })
                          .join(',\n')
                    : '""'
            }];
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
        const {
            tagName,
            attributes,
            closed,
            children = [],
            isResolved,
        } = element;
        const structures = this.resolveStructure(element);
        // 嵌入式图
        if (!isResolved && structures.length) {
            this.attributes[this.index] = [
                AttributeType.structure,
                structures[1],
                [
                    'context',
                    `with(context){
                        return '${structures[2]}'
                }`,
                ],
            ];
            this.resolveEmbedded(element);
            this.resolveTNodes([element]);
            this.createFn += `
                        createEmbeddedViewEnd('template');`;
        } else {
            this.instructionParams.add('elementStart');
            this.createFn += `
                        elementStart('${tagName}', ${this.index});`;
            this.resolveAttributes(attributes);
            this.index++;
            this.resolveTNodes(children);
            this.closeElement(element);
        }
    }
    resolveStructure(element: ElementTNode): Array<string | number> {
        const { attributes } = element;
        let structures: Array<string | number> = [],
            { structureMark } = this.configuration;
        for (let i = attributes.length - 1; i > 1; ) {
            if (
                attributes[i - 1] == '=' &&
                attributes[i - 2].startsWith(structureMark!)
            ) {
                structures.push(
                    AttributeType.structure,
                    attributes[i - 2].slice(1),
                    attributes[i]
                );
                element.attributes.splice(i - 2, 3);
                i -= 3;
            } else {
                i--;
            }
        }
        return structures;
    }
    resolveEmbedded(element: ElementTNode) {
        this.instructionParams.add('createEmbeddedViewStart');
        this.instructionParams.add('createEmbeddedViewEnd');
        this.instructionParams.add('updateEmbeddedView');
        this.createFn += `
                        createEmbeddedViewStart('template', ${this.index}, embeddedViews[${this.embeddedViews.length}]);`;
        this.updateFn += `
                        updateEmbeddedView(${this.index}, embeddedViews[${this.embeddedViews.length}]);`;
        element.isResolved = true;
        let instructionIns = new Instruction();
        instructionIns.createFactory([element]);
        let paramsString = Array.from(instructionIns.instructionParams),
            paramsFns = paramsString.map((key) => TViewFns[key]);
        let componentDef = instructionIns.componentDef!(...paramsFns);
        this.embeddedViews.push(componentDef);
        console.log(componentDef);
        // 为嵌入视图生成新的view
        this.index++;
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
                        creatText(${this.index},'${expression}');`;
        if (hasInterpolation) {
            this.instructionParams.add('updateText');
            this.updateFn += `
                        updateText(${this.index},'${expression}');`;
        }
        this.index++;
    }
    resolveComment(element: CommentTNode) {
        this.instructionParams.add('createComment');
        let { content } = element;
        this.createFn += `
                        createComment(${this.index}, '${content}');`;
        this.index++;
    }
    resolveAttributes(attributes: string[]) {
        this.attributes[this.index] = [];
        let structures: string[] = [],
            attributesArray = new Array();
        let hasDynamicAtribute = false,
            { addAttributeMark, addEventMark, structureMark, referenceMark } =
                this.configuration;
        for (let i = 0; i < attributes.length; ) {
            let prefix = attributes[i][0];
            if (attributes[i + 1] == '=') {
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
                        structures.push(
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
                switch (prefix) {
                    case referenceMark:
                        this.addReference(attributes[i].slice(1));
                        break;
                    default:
                        this.addStaticAttrubute(attributes[i], '');
                        break;
                }
                i++;
            }
        }
        if (hasDynamicAtribute) {
            this.updateProperty();
        }
        return { structures, attributesArray };
    }
    addStaticAttrubute(key: string, value: string) {
        this.attributes[this.index].push(
            AttributeType.staticAttribute,
            key,
            value
        );
    }
    addReference(refKey: string) {
        this.attributes[this.index].push(
            AttributeType.reference,
            refKey,
            undefined
        );
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
        this.attributes[this.index].push(type, dynamicKey, contextValue);
    }
    updateProperty() {
        this.instructionParams.add('updateProperty');
        this.updateFn += `
                        updateProperty(${this.index});`;
    }
    addListener(eventName: string, callback: string) {
        this.instructionParams.add('listener');
        this.attributes[this.index].push(
            AttributeType.event,
            eventName,
            callback
        );
        let [fn, params] = callback.replace(/[()]/g, ' ').split(' ');
        this.createFn += `
                        listener('${eventName}',function($event){
                                            return ctx['${fn}'](${params});
                                        }, ${this.index});`;
    }
}
export { Instruction };
