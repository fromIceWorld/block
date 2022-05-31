import { AttributeType } from './Enums';
import { elementType } from './Enums/ElementType';
import {
    CommentTNode,
    ElementTNode,
    TextTNode,
    TNode,
} from './interface/index';
interface Configuration {
    interpolationSyntax?: [string, string];
    addAttributeMark?: string;
    addEventMark?: string;
}
let index = 0;
/**
 * @param treeNode 模板抽象数据
 * @param configuration 配置参数
 */
class Instruction {
    treeNode: TNode[];
    configuration: Configuration = {
        interpolationSyntax: ['{{', '}}'],
        addAttributeMark: '&',
        addEventMark: '@',
    };
    createFn = ``;
    updateFn = ``;
    template: Function;
    componentDef: Function;
    elements: Array<Element> = new Array();
    attributes: Array<number | string>[] = new Array();
    instructionParams: Set<string> = new Set();
    constructor(treeNode: TNode[] = [], addConfiguration: Configuration = {}) {
        this.treeNode = treeNode;
        this.configuration = Object.assign(
            this.configuration,
            addConfiguration
        );
    }
    createFactory() {
        this.resolveTNodes(this.treeNode);
        this.createTemplateFn();
        this.createComponentDef();
    }
    createComponentDef() {
        let componentDef = (this.componentDef = new Function(
            ...Array.from(this.instructionParams),
            'cacheInstructionIFrameStates',
            'componentType',
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
    resolveElement(element: ElementTNode) {
        this.instructionParams.add('elementStart');
        const { tagName, attributes, closed, children = [] } = element;
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
                        createComment(${index}, ${content});`;
        index++;
    }
    resolveAttributes(attributes: string[]) {
        this.attributes[index] = new Array();
        let hasDynamicAtribute = false,
            { addAttributeMark, addEventMark } = this.configuration;
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
                this.addStaticAttrubute(attributes[i], '');
                i++;
            }
        }
        if (hasDynamicAtribute) {
            this.updateProperty();
        }
    }
    addStaticAttrubute(key: string, value: string) {
        this.attributes[index].push(AttributeType.staticAttribute, key, value);
    }
    addDynamicAttrubute(dynamicKey: string, value: string) {
        this.instructionParams.add('propertyFn');
        this.instructionParams.add('updateProperty');
        let type: number,
            contextValue = `(context)=>{
                                                with(context){
                                                    return ${value}
                                                }
                                            }`;
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
        this.createFn += `
                        propertyFn(${index},${type},'${dynamicKey}',${contextValue});`;
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
                                        });`;
    }
}
let tree = [
    {
        tagName: 'div',
        type: 1,
        attributes: [
            'data-angular',
            'name',
            '=',
            'angular',
            '&style',
            '=',
            '{width: dataWidth}',
            '@change',
            '=',
            "go($event,'query')",
        ],
        children: [
            {
                content: '{{dataWidth}}子元素:【{{dataWidth}}】{{dataWidth}}',
                type: 3,
            },
            {
                tagName: 'div',
                type: 1,
                attributes: [
                    'style',
                    '=',
                    'width: 100px;height: 100px;background-color:#e5e0e1;',
                    '&style',
                    '=',
                    '{width: dataWidth}',
                    '&name',
                    '=',
                    'block',
                    '@click',
                    '=',
                    'emit($event,123)',
                ],
            },
        ],
    },
    {
        tagName: 'p',
        type: 1,
        attributes: [
            'class',
            '=',
            'forP bindClass2',
            '&class',
            '=',
            '{bindClass1: class1,bindClass2: class2}',
        ],
    },
    {
        tagName: 'app-child',
        type: 1,
        attributes: [],
    },
    {
        type: 8,
        content: ' 注释信息',
    },
];
// 临时数据 tree，无position
let instruction = (window['instruction'] = new Instruction(tree));
console.log(instruction);
