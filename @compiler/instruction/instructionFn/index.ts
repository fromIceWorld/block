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
    modelMark?: string;
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
        modelMark: '%',
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
                                      .map((def: any) => {
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
    /**
     * 递归解析各类节点生成指令集
     * @param elements 节点抽象属性
     */
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
    resolveModel(tagName: string, resolvedAttributes: Array<any>) {
        let [
            dynamicStyle,
            dynamicClasses,
            mergeAttributes,
            events,
            dynamicAttributes,
            references,
            structures,
            model,
        ] = resolvedAttributes;
        for (let [name, value] of Object.entries(model)) {
            let { type } = mergeAttributes,
                eventName = name;
            if (tagName == 'input') {
                this.instructionParams.add('listener');
                if (type == 'checkbox') {
                    this.createFn += `
                    listener('change',function($event){
                                        if($event.target.checked){
                                            ctx['${value}'].push($event.target.value)
                                        }else{
                                            ctx['${value}'].splice(ctx['${value}'].indexOf($event.target.value),1)
                                        }
                                        ctx.cd.detectChanges();
                                    }, ${this.index});`;
                } else if (type == 'radio') {
                    this.createFn += `
                    listener('change',function($event){
                                        ctx['${value}'] = $event.target.value;
                                        ctx.cd.detectChanges();
                                    }, ${this.index});`;
                } else {
                    eventName = name ? name : 'change';
                    this.createFn += `
                    listener('${eventName}',function($event){
                                        ctx['${value}'] = $event.target.value;
                                        ctx.cd.detectChanges();
                                    }, ${this.index});`;
                }
            } else if (tagName == 'textarea') {
                this.createFn += `
                        listener('change',function($event){
                                            ctx['${value}'] = $event.target.value;
                                            ctx.cd.detectChanges();
                                        }, ${this.index});`;
            } else if (tagName == 'select') {
                this.createFn += `
                        listener('change',function($event){
                                            ctx['${value}'] = $event.target.value;
                                            ctx.cd.detectChanges();
                                        }, ${this.index});`;
            }
            this.updateFn += `
                    updateProperty(${this.index});`;
        }
    }
    /**
     * 解析element节点，生成对应指令集,
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
            model,
        ] = element.resolvedAttributes;
        // 嵌入式图
        if (Object.keys(structures).length) {
            let copyEle = copy(element);
            // 过滤掉第一个结构性指令
            delete copyEle.resolvedAttributes[AttributeType.structure][
                Object.keys(
                    copyEle.resolvedAttributes[AttributeType.structure]
                )[0]
            ];
            Object.entries(structures).forEach(([key, value]) => {
                structures[key.slice(1)] = value;
                delete structures[key];
            });
            this.resolveEmbedded(copyEle);
            this.createFn += `
                        embeddedViewEnd('template');`;
            this.index++;
        } else {
            this.instructionParams.add('elementStart');
            this.createFn += `
                        elementStart('${tagName}', ${this.index});`;
            // 绑定事件
            Object.entries(events).forEach(([eventName, fn]) => {
                this.addListener(eventName, fn as string);
            });
            // 解析 % 模型
            this.resolveModel(tagName, element.resolvedAttributes);
            this.index++;
            this.resolveTNodes(children);
            this.closeElement(element);
        }
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
        // 为嵌入视图生成独立的view,以便在结构性指令渲染时有对应的 defination
        this.instructionParams = new Set(
            Array.from(this.instructionParams).concat(paramsString)
        );
        this.embeddedViews.push(componentDef);
    }
    closeElement(element: ElementTNode) {
        this.instructionParams.add('elementEnd');
        let { tagName } = element;
        this.createFn += `
                        elementEnd('${tagName}');`;
    }
    // TODO:插值字符串 使用token解析以代替with。
    /**
     * 插值语法字符串解析较复杂，暂时使用with语句代替
     * @param element 文本节点
     */
    resolveText(element: TextTNode) {
        this.attributes[this.index] = Array.from(
            new Array(AttributeType.length),
            () => Object.create(null)
        );
        this.instructionParams.add('creatText');
        let text = this.attributes[this.index][AttributeType.text],
            hasInterpolation = false,
            [start, end] = this.configuration.interpolationSyntax,
            interpolationRegExp = new RegExp(
                `${start}\\s*[a-zA-Z0-9!.'"\\[\\]]*\\s*${end}`,
                'g'
            ),
            { content } = element;
        hasInterpolation = !!content.match(interpolationRegExp);
        this.createFn += `
                        creatText(${this.index});`;
        if (hasInterpolation) {
            this.instructionParams.add('updateText');
            text['content'] = [
                'ctx',
                `with(ctx){
                    return '${content.replace(
                        interpolationRegExp,
                        (interpolation) => {
                            return (
                                "'+" +
                                interpolation
                                    .slice(
                                        start.length,
                                        interpolation.length - end.length
                                    )
                                    .trim() +
                                "+'"
                            );
                        }
                    )}'
                }
                `,
            ];
            this.updateFn += `
                        updateText(${this.index});`;
        } else {
            text['content'] = [
                'ctx',
                `return '${content}'
            `,
            ];
        }
        this.index++;
    }
    /**
     *
     * @param element 注释节点
     */
    resolveComment(element: CommentTNode) {
        this.instructionParams.add('createComment');
        let { content } = element;
        this.createFn += `
                        createComment(${this.index}, '${content}');`;
        this.index++;
    }
    /**
     * 将当前节点的属性解析后存储到 组件属性集合上
     * @param attributes 组件上所有节点的属性集合
     */
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
            model,
        ] = this.attributes[this.index];
        let {
            addAttributeMark,
            addEventMark,
            structureMark,
            referenceMark,
            modelMark,
        } = this.configuration;
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
                    case modelMark:
                        model[attributes[i].slice(1)] = attributes[i + 2];
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
    /**
     * 判断当前节点是否需要更新属性
     */
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
    /**
     * 将动态属性解析成纯函数，在更新时直接输入ctx获取最新属性
     * @param dynamicKey 属性key
     * @param value 属性value 的 函数体
     * @returns
     */
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
    /**
     * 属性的更新指令集
     */
    updateProperty() {
        this.instructionParams.add('updateProperty');
        this.updateFn += `
                        updateProperty(${this.index});`;
    }
    /**
     *添加事件的指令集
     * @param eventName 事件名称
     * @param callback 事件的回调函数
     */
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
