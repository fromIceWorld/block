import { resolveSelector } from '../../../common/index';
import { θd } from '../../../DocumentAPI/index';
import { AttributeType, elementType, TViewIndex } from '../../../Enums/index';
import { elementNode, textNode } from '../../../TNode/index';
import { TemplateView } from '../../../TView/TemplateView';

interface Attributes {
    [key: string]: Function;
}
interface finAttributes {
    [key: string]: any;
}

const offset = 20;
/**
 * 指令集运行栈，控制上下文的 TView
 */
let instructionIFrameStates: any = {
        currentTView: null,
    },
    elementStack: Array<Element | Text | Comment> = new Array();
function currentTView() {
    return instructionIFrameStates.currentTView;
}
function setCurrentTView(tView: TemplateView) {
    instructionIFrameStates.currentTView = tView;
}
function currentLView() {
    return currentTView()[TViewIndex.LView];
}
function pushContext(tView: TemplateView) {
    tView[TViewIndex.Parent] = currentTView();
    setCurrentTView(tView);
}
function popContext() {
    let tView = currentTView(),
        preTView = tView[TViewIndex.Parent]!;
    setCurrentTView(preTView);
}
/**
 * 建立真实DOM元素
 *
 * @param tagName 节点名称
 * @param index 节点索引
 */
function elementStart(tagName: string, index: number) {
    let LView = currentLView(),
        dom = θd.createElement(tagName);
    LView[offset + index] = dom;
    // 建立抽象节点
    let tNode = resolveNode(tagName, index);
    tNode.native = dom;
    // 添加静态属性
    addStaticAttributes(dom, tNode.attributes);
    linkParentChild(dom, index);
}
function addStaticAttributes(dom: Element, attributes: string[]) {
    let staticAttribute = attributes[AttributeType.staticAttribute];
    if (staticAttribute) {
        addStaticAttribute(dom, staticAttribute);
    }
}
function addStaticAttribute(dom: Element, attributes: any) {
    Object.keys(attributes).forEach((key) => {
        dom.setAttribute(key, attributes[key]);
    });
}
function elementEnd(tagName: string) {
    let TView = currentTView(),
        rootElements = TView[TViewIndex.RootElements];
    let elementStart = elementStack.pop() as Element;
    if (elementStart.localName == tagName) {
        if (elementStack.length == 0) {
            rootElements.push(elementStart);
        }
    }
}

/**
 * 当节点上有动态属性时，更新节点属性
 *
 * @param index 节点索引
 */
function updateProperty(index: number) {
    let TView = currentTView(),
        tNode = TView[index + offset];
    let { attributes, finAttributes } = tNode;
    let [
        dynamicStyle,
        dynamicClass,
        ,
        ,
        staticAttribute,
        dynamicAttrubute,
        event,
    ] = attributes;
    if (Object.keys(dynamicAttrubute).length > 0) {
        updateProp(index, dynamicAttrubute, finAttributes);
    }
    if (dynamicStyle.length > 0) {
        updateStyle(index, dynamicStyle, finAttributes);
    }
    if (dynamicClass.length > 0) {
        updateClass(index, dynamicClass, finAttributes);
    }
}
/**
 * 更新动态属性
 * @param index 节点索引
 * @param attributes 动态属性
 */
function updateProp(
    index: number,
    attributes: Attributes,
    finAttributes: finAttributes
) {
    let TView = currentTView(),
        LView = currentLView(),
        native = LView[index + offset],
        context = TView[TViewIndex.Context];
    Object.keys(attributes).forEach((key) => {
        let value = attributes[key](context);
        native.setAttribute(key, value);
        finAttributes[key] = value;
    });
}
/**
 * 更新动态属性[class]
 * @param index 节点索引
 * @param attributes 动态属性
 */
function updateClass(
    index: number,
    classes: Function[],
    finAttributes: finAttributes
) {
    let TView = currentTView(),
        LView = currentLView(),
        native = LView[index + offset],
        context = TView[TViewIndex.Context],
        result;
    let preClass = native.getAttribute('class') || '',
        preclassObj = Object.create({}),
        mergeClass: string[] = [];
    preClass &&
        preClass.split(/[ ]+/).map((cla: string) => {
            if (cla.trim()) {
                preclassObj[cla] = true;
            }
        });
    classes.forEach((fn) => {
        Object.assign(preclassObj, fn(context));
    });
    Object.keys(preclassObj).forEach((cla) => {
        if (preclassObj[cla]) {
            mergeClass.push(cla);
        }
    });
    result = mergeClass.join(' ');
    native.setAttribute('class', result);
    finAttributes['class'] = result;
}
/**
 * 更新节点style
 *
 * @param index 节点索引
 * @param styles 节点样式函数
 */
function updateStyle(
    index: number,
    fns: Function[],
    finAttributes: finAttributes
) {
    let TView = currentTView(),
        LView = currentLView(),
        native = LView[index + offset],
        styleMap = native.attributeStyleMap,
        context = TView[TViewIndex.Context],
        styleObj = Object.create({});
    fns.forEach((fn) => {
        Object.assign(styleObj, fn(context));
    });
    for (let key of Object.keys(styleObj)) {
        styleMap.set(key, styleObj[key]);
    }
    finAttributes['style'] = native.getAttribute('style');
}
/**
 * 创建文本节点
 *
 * @param index 节点索引
 * @param content 文本
 */
function creatText(index: number, content: string) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        text = θd.createTextNode(content);
    LView[offset + index] = text;
    TView[offset + index] = new textNode(content);
    // 解析 text,确定text的属性
    // resolveText()
    linkParentChild(text, index);
}
/**
 * 更新文本节点
 *
 * @param index 节点索引
 * @param content 节点文本
 */
function updateText(index: number, content: string) {
    let LView = currentLView(),
        element = LView[index + offset];
    element.textContent = content;
}

/**
 * 创建注释节点
 *
 * @param index 节点索引
 * @param content 内容
 */
function createComment(index: number, content: string) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        comment = θd.createComment(content);
    LView[offset + index] = comment;
    TView[offset + index] = new textNode(content);
    // 解析 text,确定text的属性
    // resolveText()
    linkParentChild(comment, index);
}
/**
 * 为节点添加事件
 *
 * @param eventName 事件名称
 * @param callback 回调函数
 * @param index 节点索引
 */
function listener(eventName: string, callback: Function, index: number) {
    let LView = currentLView(),
        el = LView[index + offset];
    el.addEventListener(eventName, callback);
}
/**
 *解析节点，判断节点上是否有特殊属性 [组件， 指令]
 *
 * @param tagName 节点名称
 * @param index 节点索引
 */
function resolveNode(tagName: string, index: number) {
    let TView = currentTView(),
        {
            dynamicStyle,
            dynamicClasses,
            attributes,
            events,
            dynamicAttributes,
        } = resolveAttributes(index);
    let tNode = new elementNode(
        tagName,
        dynamicStyle,
        dynamicClasses,
        attributes,
        events,
        dynamicAttributes
    );
    TView[offset + index] = tNode;
    resolveDirective(tagName, index);
    return tNode;
}
/**
 * 解析节点上的属性
 *
 * @param index 节点索引
 */
function resolveAttributes(index: number) {
    const { attributes } = currentTView()[TViewIndex.ComponentDef] as any;
    let dynamicStyle = [],
        dynamicClasses = [],
        mergeAttributes = Object.create({}),
        events = Object.create({}),
        dynamicAttributes = Object.create({});
    for (let i = 0; attributes[index] && i < attributes[index].length; ) {
        let type = attributes[index][i],
            key = attributes[index][i + 1],
            value = attributes[index][i + 2];
        switch (type) {
            case AttributeType.dynamicClass:
                dynamicClasses.push(value);
                break;
            case AttributeType.dynamicStyle:
                dynamicStyle.push(value);
                break;
            case AttributeType.event:
                events[key] ? events[key].push(value) : (events[key] = [value]);
                break;
            case AttributeType.staticAttribute:
                mergeAttributes[key] = value;
                break;
            default:
                dynamicAttributes[key] = value;
                break;
        }
        i += 3;
    }
    return {
        dynamicStyle,
        dynamicClasses,
        attributes: mergeAttributes,
        events,
        dynamicAttributes,
    };
}
// TODO: 动态属性匹配指令情况
/**
 * 解析节点上的组件/指令
 *
 * @param index 节点索引
 */
function resolveDirective(tagName: string, index: number) {
    let TView = currentTView(),
        native = TView[TViewIndex.LView][index + offset],
        TNode = TView[offset + index];
    let { classes, attributes, directives, component } = TNode;
    const Directives = TView[TViewIndex.Directives]();
    for (let dir of Directives) {
        let { selector } = dir as any;
        let [k, v] = resolveSelector(selector);
        if (k == tagName && v == null) {
            TView[TViewIndex.Children].push(index);
            component = dir;
            TNode['TView'] = new TemplateView(component, TNode, native, TView);
        } else {
            if (
                (k == 'class' && Object.keys(classes).join(' ') == v) ||
                attributes[AttributeType.staticAttribute][k] == v
            ) {
                directives.push(dir);
            }
        }
    }
}
function linkParentChild(el: Element | Text | Comment, index: number) {
    let TView = currentTView(),
        rootEleemnts = TView[TViewIndex.RootElements],
        { nodeType } = el;
    if (elementStack.length > 0) {
        let parent = elementStack[elementStack.length - 1] as Element;
        parent.append(el);
    } else {
        if (nodeType == elementType.Text) {
            rootEleemnts.push(el);
        }
    }
    if (nodeType == elementType.Element) {
        elementStack.push(el);
    }
}
function bootstrapView(rootComponent: { new (): any }) {
    let rootTView = ((window as any).root = new TemplateView(rootComponent));
    rootTView.attach();
    console.log(instructionIFrameStates, rootTView);
    return rootTView;
}
const TViewFns = {
    elementStart,
    listener,
    elementEnd,
    updateProperty,
    creatText,
    updateText,
    createComment,
    setCurrentTView,
    pushContext,
    popContext,
};
export { TViewFns, bootstrapView };
