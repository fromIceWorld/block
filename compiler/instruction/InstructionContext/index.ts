import { ObjectInterface } from '../../../common/interface';
import { Decorator, ViewChanges, ViewKeys } from '../../../decorators/index';
import { θd } from '../../../DocumentAPI/index';
import { Hook } from '../../../lifeCycle/index';
import { AttributeType, elementType, TViewIndex } from '../../Enums/index';
import { ViewMode } from '../../index';
import { embeddedView, ViewContainer } from '../../template/embedded/index';
import { TemplateDirective } from '../../template/TDirective/index';
import { commentNode, elementNode, textNode } from '../../template/TNode/index';
import { TemplateView } from '../../template/TView/TemplateView';

interface ViewDefination {
    attributes: Array<null | Array<number | string>>;
    template: Function;
}

const offset = 20;
/**
 * 指令集运行栈，控制上下文的 TView
 */
let instructionIFrameStates: any = {
        currentTView: null,
        rootTView: null,
        runningTView: null,
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
function embeddedViewStart(
    tagName: string,
    index: number,
    def: ViewDefination
) {
    // 解析组件，指令建立抽象节点
    let tNode = resolveNode(tagName, index);
    createNative(tNode, index);
    extractStructures(index, def);
    processedNodeContext(index);
}
function embeddedViewEnd(tagName: string) {
    elementEnd(tagName);
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
    // HookDirective('OnInit', tNode.directives);
    // 添加静态属性
    addStaticAttributes(
        tNode.native as Element,
        tNode.attributes[AttributeType.staticAttribute]
    );
    resolveDirective(tagName, index);
    processedNodeContext(index);
}
function createNative(tNode: elementNode, index: number) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        { tagName, finAttributes } = tNode,
        slotName: string = finAttributes['name'];
    // 嵌入视图[if,for]无自己的slot，
    while (TView instanceof ViewContainer || TView instanceof embeddedView) {
        TView = TView[TViewIndex.Parent];
    }
    let parentTView = TView[TViewIndex.Parent],
        dom = θd.createElement(tagName);
    while (
        parentTView instanceof ViewContainer ||
        TView instanceof embeddedView
    ) {
        parentTView = parentTView[TViewIndex.Parent];
    }
    if (tagName == 'slot') {
        let slotsIndex = TView[TViewIndex.Slots],
            filters = [],
            slotsDOM = slotsIndex.map(
                (index: number) => parentTView[TViewIndex.LView][index + offset]
            );
        filters = slotsDOM.filter(
            (d: Element) =>
                (slotName && d.slot === slotName) || (!slotName && !d.slot)
        );

        dom.append(...filters);
    }
    tNode.native = dom;
    LView[offset + index] = dom;
}
function addStaticAttributes(
    native: Element,
    attributes: ObjectInterface<string> = {}
) {
    Object.keys(attributes).forEach((key) => {
        native.setAttribute(key, attributes[key]);
    });
}
function elementEnd(tagName: string) {
    const TView = currentTView(),
        LView = TView[TViewIndex.LView],
        index = elementStack.pop()!,
        native = LView[index + offset],
        tNode = TView[index + offset];
    let rootElements = TView[TViewIndex.RootElements];
    let elementStart = LView[index + offset];
    if (elementStart.localName == tagName) {
        if (elementStack.length == 0) {
            rootElements.push(index);
        }
    }
    // 指令的生命周期
    tNode.directives.forEach((dir: ObjectInterface<any>) => {
        Hook(dir[TViewIndex.Context], 'OnInserted', native);
    });
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
    let { attributes, finAttributes, directives } = tNode;
    let [
        dynamicStyle,
        dynamicClass,
        staticAttribute,
        event,
        dynamicAttrubute,
        reference,
        structure,
        model,
    ] = attributes;
    if (Object.keys(structure).length > 0) {
        updateInputValue(index, structure, finAttributes);
    } else {
        if (Object.keys(dynamicAttrubute).length > 0) {
            updateProp(index, dynamicAttrubute, finAttributes, model);
        }
        if (Object.keys(model).length > 0) {
            updateModelProp(index, dynamicAttrubute, model, finAttributes);
        }
        if (dynamicStyle.length > 0) {
            updateStyle(index, dynamicStyle, finAttributes);
        }
        if (dynamicClass.length > 0) {
            updateClass(index, dynamicClass, finAttributes);
        }
        // 指令生命周期
        directives.forEach((dir: TemplateDirective) => {
            switch (TView[TViewIndex.Mode]) {
                case ViewMode.install:
                    dir.install();
                    Hook(dir[TViewIndex.Context], 'OnInit');
                    break;
                case ViewMode.update:
                    dir.update();
                    Hook(dir[TViewIndex.Context], 'OnInputChanges');
                    break;
            }
        });
    }
}
/**
 * 更新动态属性
 * @param index 节点索引
 * @param attributes 动态属性
 */
function updateProp(
    index: number,
    attributes: ObjectInterface<Function>,
    finAttributes: ObjectInterface<any>,
    model: ObjectInterface<string>
) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        native = LView[index + offset],
        context = TView[TViewIndex.Context];
    Object.keys(attributes).forEach((key) => {
        const value = attributes[key](context);
        native.setAttribute(key, value);
        finAttributes[key] = value;
    });
    updateModelProp(index, attributes, model, finAttributes);
}
function updateInputValue(
    index: number,
    attributes: ObjectInterface<Function>,
    finAttributes: ObjectInterface<any>
) {
    let TView = currentTView(),
        context = TView[TViewIndex.Context];
    Object.keys(attributes).forEach((key) => {
        let value = attributes[key](context);
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
function updateModelProp(
    index: number,
    attributes: ObjectInterface<Function>,
    model: ObjectInterface<string>,
    finAttributes: ObjectInterface<any>
) {
    const TView = currentTView(),
        LView = TView[TViewIndex.LView],
        context = TView[TViewIndex.Context];
    let native = LView[index + offset],
        { tagName, type } = native;
    for (let [event, value] of Object.entries(model)) {
        let currentValue = context[value];
        if (tagName == 'INPUT') {
            if (type == 'text') {
                native.value = currentValue;
                finAttributes[value] = currentValue;
            } else if (type == 'checkbox') {
                if (
                    Array.isArray(currentValue) &&
                    currentValue.includes(native.value)
                ) {
                    native.checked = true;
                } else {
                    native.checked = false;
                }
            } else if (type == 'radio') {
                native.checked = native.value === context[value];
            }
        } else if (tagName == 'TEXT' || tagName == 'TEXTAREA') {
            native.value = currentValue;
        } else if (tagName == 'SELECT') {
            Array.from(native.options).forEach((item: any) => {
                if (currentValue.includes(item.value)) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
            });
        } else {
            // 应用到其他标签上：例如组件
            native.value = currentValue;
            finAttributes[value] = currentValue;
        }
    }
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
        let newStyle = fn(context);
        if (typeof newStyle === 'string') {
            newStyle = newStyle
                .split(';')
                .filter((objString) => {
                    return objString.trim();
                })
                .reduce((pre, cur) => {
                    let [k, v] = cur.split(':');
                    return {
                        ...pre,
                        [k.trim()]: v.trim(),
                    };
                }, {});
        }
        // 接收到style 字符串
        Object.assign(styleObj, newStyle);
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
function creatText(index: number) {
    let TView = currentTView(),
        LView = TView[TViewIndex.LView],
        { attributes } = TView.$getDefinition(),
        ctx = TView[TViewIndex.Context],
        fn = new Function(...attributes[index][AttributeType.text]['content']),
        text = θd.createTextNode(fn(ctx));
    LView[offset + index] = text;
    TView[offset + index] = new textNode(fn, text, index);
    // 解析 text,确定text的属性
    // resolveText()
    processedNodeContext(index);
}
/**
 * 更新文本节点
 *
 * @param index 节点索引
 * @param content 节点文本
 */
function updateText(index: number) {
    let TView = currentTView(),
        { content } = TView[index + offset],
        ctx = TView[TViewIndex.Context],
        LView = currentLView(),
        element = LView[index + offset];
    element.textContent = content(ctx);
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
    processedNodeContext(index);
    return comment;
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
    const TView = currentTView(),
        { attributes } = currentTView().$getDefinition() as any,
        [
            dynamicStyle,
            dynamicClasses,
            mergeAttributes,
            events,
            dynamicAttributes,
            references,
            structures,
            model,
        ] = attributes[index];
    let tNode = new elementNode(
        tagName,
        index,
        dynamicStyle,
        dynamicClasses,
        mergeAttributes,
        events,
        dynamicAttributes,
        references,
        structures,
        model
    );
    TView[offset + index] = tNode;
    return tNode;
}
function extractStructures(index: number, def: ViewDefination) {
    let TView = currentTView(),
        TNode = TView[offset + index] as elementNode;
    let { attributes } = TNode,
        has = false,
        structures = attributes[AttributeType.structure];
    const InRanges = TView[TViewIndex.InRange]();
    for (let dir of InRanges) {
        let [k, v] = dir.chooser;
        if (structures[k]) {
            if (!has) {
                has = true;
                new ViewContainer(index, def!, dir);
                TView[TViewIndex.Children].push(index);
            } else {
                delete structures[k];
            }
        }
    }
}
//  属性匹配指令[不考虑动态属性]
/**
 * 1 element-name
 * 2 #id
 * 3 [attribute]
 * 4 [attribute=value]
 *
 * 解析节点上的组件/指令
 *
 * @param index 节点索引
 */
function resolveDirective(tagName: string, index: number) {
    let TView = currentTView(),
        native = TView[TViewIndex.LView][index + offset],
        TNode = TView[offset + index] as elementNode;
    let { attributes, directives } = TNode;
    const InRanges = TView[TViewIndex.InRange]() || [],
        ctx = TView[TViewIndex.Context],
        [, , staticAttributes, , dynamicAttributes, references, structure] =
            attributes,
        localTags = Object.keys(references),
        viewTagChanges = ctx[ViewChanges],
        viewTags: string[] = Object.values(ctx[ViewKeys] || {}),
        matchTag = [];
    for (let [key, ref] of Object.entries(
        (ctx[ViewKeys] as ObjectInterface<string>) || {}
    )) {
        if (localTags.includes(ref)) {
            matchTag.push(key);
        }
    }
    matchTag.forEach((tag) => {
        viewTagChanges[tag]['currentValue'] = native;
    });
    for (let dir of InRanges) {
        let [k, v] = dir.chooser;
        if (
            (k == 'tagName' && tagName == v) ||
            (v === null &&
                (staticAttributes[k] === '' ||
                    dynamicAttributes[k] ||
                    structure[k])) ||
            staticAttributes[k] === v
        ) {
            let { $type } = dir;
            if ($type == Decorator.Component) {
                console.log('解析的router', tagName == 'router-view');
                TView[TViewIndex.Children].push(index);
                TNode.component = dir;
                TNode['TView'] = new TemplateView(
                    TNode.component as ObjectConstructor,
                    TNode,
                    native
                );
                // @ViewChild
                matchTag.forEach((tag) => {
                    if (tag === dir) {
                        viewTagChanges[tag]['currentValue'] = TNode['TView'];
                    }
                });
                break;
            } else if ($type == Decorator.Directive) {
                TView[TViewIndex.Directives].add(index);
                let dirInstance = new TemplateDirective(
                    index,
                    dir,
                    native,
                    TNode
                );
                // @ViewChild
                matchTag.forEach((tag) => {
                    if (tag === dir) {
                        viewTagChanges[tag]['currentValue'] = dirInstance;
                    }
                });
                Hook(dirInstance[TViewIndex.Context], 'OnBind', native);
                directives.push(dirInstance);
                break;
            }
        }
    }
}

/**
 * 处理节点之间的关系
 *
 * @param index 节点索引
 */
function processedNodeContext(index: number) {
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
        currentTNode = TView[index + offset];
    if (parentIndex == -1) {
        parentNative = TView[TViewIndex.Host];
    } else {
        parentTNode = TView[parentIndex + offset];
        parentNative =
            LView[parentIndex + offset].tagName == 'TEMPLATE'
                ? LView[parentIndex + offset].content
                : LView[parentIndex + offset];
        parentTNode.children.push(index);
        currentTNode.parent = parentIndex;
    }
    if (!parentTNode || !parentTNode.component) {
        parentNative.append(LView[index + offset]);
    }
}
function bootstrapView(rootComponent: { new (): any }, native: Element) {
    let rootTView = ((window as any).root = new TemplateView(
        rootComponent,
        undefined,
        native as any
    ));
    instructionIFrameStates.rootTView = rootTView;
    rootTView.install();
    return rootTView;
}
class CheckDetectChange {
    detectChanges() {
        let view = instructionIFrameStates.rootTView;
        view.update();
    }
}
const TViewFns: ObjectInterface<Function> = {
    elementStart,
    listener,
    elementEnd,
    updateProperty,
    creatText,
    updateText,
    createComment,
    currentTView,
    setCurrentTView,
    pushContext,
    popContext,
    embeddedViewStart,
    embeddedViewEnd,
};
export {
    TViewFns,
    bootstrapView,
    ViewDefination,
    CheckDetectChange,
    instructionIFrameStates,
};
