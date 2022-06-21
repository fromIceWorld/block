import { resolveSelector } from '../../../common/index';
import { ObjectInterface } from '../../../common/interface';
import { createDirectivesContext } from '../../../decorators/Input';
import { θd } from '../../../DocumentAPI/index';
import { AttributeType, elementType, TViewIndex } from '../../../Enums/index';
import { commentNode, elementNode, textNode } from '../../../TNode/index';
import { TemplateView } from '../../../TView/TemplateView';

interface Attributes {
    [key: string]: Function;
}
const offset = 20;
/**
 * 指令集运行栈，控制上下文的 TView
 */
let instructionIFrameStates: any = {
        currentTView: null,
    },
    elementStack: Array<number> = new Array();
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
    // 解析组件，指令建立抽象节点
    let tNode = resolveNode(tagName, index);
    createNative(tNode, index);
    resolveDirective(tagName, index);
    // HookDirective('OnInit', tNode.directives);
    // 添加静态属性
    addStaticAttributes(
        tNode.native!,
        tNode.attributes[AttributeType.staticAttribute]
    );
    progressContext(index);
}
function createNative(tNode: elementNode, index: number) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        { tagName, finAttributes } = tNode,
        slotName: string = finAttributes['name'],
        dom = θd.createElement(tagName);
    if (tagName == 'slot') {
        let slotsIndex = TView[TViewIndex.Slots],
            filters,
            slotsDOM = slotsIndex.map(
                (index: number) =>
                    TView[TViewIndex.Parent][TViewIndex.LView][index + offset]
            );
        filters = slotsDOM.filter(
            (d: Element) => d.getAttribute('slot') == slotName
        );
        dom.append(...filters);
    } else {
    }
    tNode.native = dom;
    LView[offset + index] = dom;
}
function addStaticAttributes(
    dom: Element,
    attributes: ObjectInterface<string> = {}
) {
    Object.keys(attributes).forEach((key) => {
        dom.setAttribute(key, attributes[key]);
    });
}
function elementEnd(tagName: string) {
    const TView = currentTView(),
        LView = TView[TViewIndex.LView],
        index = elementStack.pop()!,
        tNode = TView[index + offset];
    let rootElements = TView[TViewIndex.RootElements];
    let elementStart = LView[index + offset];
    if (elementStart.localName == tagName) {
        if (elementStack.length == 0) {
            rootElements.push(index);
        }
    }
    // 当前节点是组件，就将slot索引存进 [TViewIndex.Slots];
    if (tNode.TView) {
        tNode.TView[TViewIndex.Slots] = tNode.children;
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
    finAttributes: ObjectInterface<any>
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
    finAttributes: ObjectInterface<any>
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
    finAttributes: ObjectInterface<any>
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
    TView[offset + index] = new textNode(content, text);
    // 解析 text,确定text的属性
    // resolveText()
    progressContext(index);
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
    TView[offset + index] = new commentNode(content, comment);
    // 解析 text,确定text的属性
    // resolveText()
    progressContext(index);
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
 * 解析节点并判断节点上是否有特殊属性 [组件， 指令]
 *
 * @param tagName 节点名称
 * @param index 节点索引
 * @return tNode 节点抽象数据
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
        index,
        dynamicStyle,
        dynamicClasses,
        attributes,
        events,
        dynamicAttributes
    );
    TView[offset + index] = tNode;
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
    let { classes, attributes, directives } = TNode;
    const InRanges = TView[TViewIndex.InRange]();
    for (let dir of InRanges) {
        let { selector } = dir as any;
        let [k, v] = resolveSelector(selector);
        if (v == null) {
            if (k == tagName) {
                TView[TViewIndex.Children].push(index);
                TNode.component = dir;
                TNode['TView'] = new TemplateView(
                    TNode.component,
                    TNode,
                    native,
                    TView
                );
            }
        } else {
            if (
                (k == 'class' && Object.keys(classes).join(' ') == v) ||
                attributes[AttributeType.staticAttribute][k] == v
            ) {
                TView[TViewIndex.Directives].add(index);
                let context = createDirectivesContext(dir, TNode);
                // Hook(context, 'OnInputChanges', context[InputCache]);
                directives.push(context);
            }
        }
    }
}
/**
 * 处理节点之间的关系
 *
 * @param index 节点索引
 */
function progressContext(index: number) {
    const TView = currentTView(),
        LView = TView[TViewIndex.LView],
        { nodeType } = LView[index + offset];
    let parentIndex;
    let rootElements = TView[TViewIndex.RootElements];
    if (elementStack.length == 0) {
        parentIndex = -1; //当前无父节点
        if (nodeType == elementType.Text) {
            rootElements.push(index);
        }
    } else {
        parentIndex = elementStack[elementStack.length - 1];
    }
    if (nodeType == elementType.Element) {
        elementStack.push(index);
    }
    linkParentChild(parentIndex, index);
}
//收集父子的index，在slot阶段, 指令生命周期阶段使用
function linkParentChild(parentIndex: number, index: number) {
    const TView = currentTView(),
        LView = TView[TViewIndex.LView];
    let parentTNode,
        parentNative,
        currentTNode = TView[index + offset],
        { directives = [], native } = currentTNode;
    if (parentIndex == -1) {
        parentNative = TView[TViewIndex.Host];
    } else {
        parentTNode = TView[parentIndex + offset];
        parentNative = LView[parentIndex + offset];
        parentTNode.children.push(index);
        currentTNode.parent = parentIndex;
    }
    if (!parentTNode || !parentTNode.component) {
        parentNative.append(LView[index + offset]);
    }
    // 调用指令生命周期:[insert]
    // for (let context of directives) {
    //     Hook(context, 'OnInsert', parentNative, native);
    // }
}
function bootstrapView(rootComponent: { new (): any }) {
    let rootTView = ((window as any).root = new TemplateView(rootComponent));
    rootTView.attach();
    console.log(instructionIFrameStates, rootTView);
    return rootTView;
}

function HookDirective(
    lifeCycle: string,
    directives: any[] = [],
    ...params: any[]
) {
    directives.forEach((dir) => {
        if (dir[lifeCycle]) {
            dir[lifeCycle](...params);
        }
    });
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
