import { copy } from '../../../common/copy';
import { ObjectInterface } from '../../../common/interface';
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
    attributes: Array<ObjectInterface<string | Array<string>>>[] = new Array();
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
        this.embeddedViews = [];
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
        console.log('渲染的def：', this.embeddedViews);
        console.log('渲染的def.map：');
        this.componentDef = new Function(
            ...Array.from(this.instructionParams),
            `
            let attributes = ${JSON.stringify(this.attributes)};
            return {
                embeddedViews:[${
                    this.embeddedViews.length
                        ? this.embeddedViews
                              .map((obj) => {
                                  let { embeddedViews, attributes, template } =
                                      obj;
                                  return `{
                        embeddedViews:[${
                            embeddedViews.length
                                ? embeddedViews
                                      .map((def) => {
                                          return `
                                          {
                                            embeddedViews: ${JSON.stringify(
                                                def.embeddedViews
                                            )},
                                            attributes: ${JSON.stringify(
                                                def.attributes
                                            )},
                                            template: ${def.template.toString()},
                                        }`;
                                      })
                                      .join(',\n')
                                : ''
                        }],
                        attributes:${JSON.stringify(attributes)},
                        template:${template.toString()}
                      }`;
                              })
                              .join(',\n')
                        : ''
                }],
                attributes,
                template:${this.template}
            }`
        );
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
            resolvedAttributes,
            children = [],
        } = element;
        if (!resolvedAttributes) {
            this.resolveAttributes(attributes);
            element.resolvedAttributes = this.attributes[this.index];
        } else {
            console.log(element.resolvedAttributes);
            this.attributes[this.index] = element.resolvedAttributes;
        }
        this.attemptUpdate();
        let [
            dynamicStyle,
            dynamicClasses,
            mergeAttributes,
            events,
            dynamicAttributes,
            references,
            structures,
        ] = element.resolvedAttributes;
        // 嵌入式图
        if (Object.keys(structures).length) {
            let copyEle = copy(element);
            copyEle.resolvedAttributes[AttributeType.structure] = {};

            Object.entries(structures).forEach(([key, value]) => {
                structures[key.slice(1)] = value;
                delete structures[key];
            });
            this.resolveEmbedded(copyEle);
            // 删除结构指令
            // this.resolveTNodes([element]);
            // this.instructionParams.add('updateProperty');
            // this.updateFn += `
            //             updateProperty(${this.index});`;
            this.createFn += `
                        embeddedViewEnd('template');`;
            this.index++;
        } else {
            this.instructionParams.add('elementStart');
            this.createFn += `
                        elementStart('${tagName}', ${this.index});`;
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
        this.instructionParams.add('embeddedViewStart');
        this.instructionParams.add('embeddedViewEnd');
        this.createFn += `
                        embeddedViewStart('template', ${this.index}, this.embeddedViews[${this.embeddedViews.length}]);`;
        let instructionIns = new Instruction();
        instructionIns.createFactory([element]);
        let paramsString = Array.from(instructionIns.instructionParams),
            paramsFns = paramsString.map((key) => TViewFns[key]),
            componentDef = instructionIns.componentDef!(...paramsFns);
        // 为嵌入视图生成新的view
        console.log('递归的指令', componentDef, componentDef.embeddedViews);
        this.embeddedViews.push(componentDef);
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
                `${start}\\s*[a-zA-Z0-9!.]*\\s*${end}`,
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
        this.attributes[this.index] = Array.from(
            new Array(AttributeType.length),
            () => Object.create(null)
        );
        let [
            dynamicStyle,
            dynamicClasses,
            mergeAttributes,
            events,
            dynamicAttributes,
            references,
            structures,
        ] = this.attributes[this.index];
        let { addAttributeMark, addEventMark, structureMark, referenceMark } =
            this.configuration;
        for (let i = 0; i < attributes.length; ) {
            let prefix = attributes[i][0];
            if (attributes[i + 1] == '=') {
                switch (prefix) {
                    case addAttributeMark:
                        let [styles, classes, , , attrs] =
                            this.extractDynamiceAttributes(
                                attributes[i].slice(1),
                                attributes[i + 2]
                            );
                        Object.assign(dynamicStyle, styles);
                        Object.assign(dynamicClasses, classes);
                        Object.assign(dynamicAttributes, attrs);
                        break;
                    case structureMark:
                        structures[attributes[i]] = [
                            'context',
                            `with(context){
                                return ${attributes[i + 2]}
                            }`,
                        ];
                        break;
                    case addEventMark:
                        events[attributes[i].slice(1)] = attributes[i + 2];
                        break;
                    default:
                        mergeAttributes[attributes[i]] = attributes[i + 2];
                        break;
                }
                i += 3;
            } else {
                switch (prefix) {
                    case referenceMark:
                        references[attributes[i]] = '';
                        break;
                    default:
                        mergeAttributes[attributes[i]] = '';
                        break;
                }
                i++;
            }
        }
    }
    attemptUpdate() {
        let [
            dynamicStyle,
            dynamicClasses,
            mergeAttributes,
            events,
            dynamicAttributes,
            references,
            structures,
        ] = this.attributes[this.index];
        if (
            Object.keys(dynamicStyle).length > 0 ||
            Object.keys(dynamicClasses).length > 0 ||
            Object.keys(dynamicAttributes).length > 0 ||
            Object.keys(structures).length > 0
        ) {
            this.updateProperty();
        }
    }
    extractDynamiceAttributes(dynamicKey: string, value: string) {
        let result: Array<ObjectInterface<string[]>> = [{}, {}, {}, {}, {}],
            contextValue = [
                'context',
                `with(context){
                    return ${value}
                }`,
            ];
        switch (dynamicKey) {
            case 'style':
                result[AttributeType.dynamicStyle][dynamicKey] = contextValue;
                break;
            case 'class':
                result[AttributeType.dynamicClass][dynamicKey] = contextValue;
                break;
            default:
                result[AttributeType.dynamicAttrubute][dynamicKey] =
                    contextValue;
                break;
        }
        return result;
    }
    updateProperty() {
        this.instructionParams.add('updateProperty');
        this.updateFn += `
                        updateProperty(${this.index});`;
    }
    addListener(eventName: string, callback: string) {
        this.instructionParams.add('listener');
        let [fn, params] = callback.replace(/[()]/g, ' ').split(' ');
        this.createFn += `
                        listener('${eventName}',function($event){
                                            return ctx['${fn}'](${params});
                                        }, ${this.index});`;
    }
}
export { Instruction };
