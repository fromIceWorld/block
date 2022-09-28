import { parseTemplate } from 'parse-html-template';

declare class EventEmitter {
    event: CustomEvent;
    constructor(type: string, additionConfig?: CustomEventInit);
    emit(emitValue: any): void;
}

/**
 * 属性选择器,id选择器,class选择器,节点选择器
 * @param selector
 *  [name="**"]       [name,'**']
 *  [arr]             [arr, undefined]
 *  #id               [id, id]
 *  .classNameme,     [class, classNameme]
 *  div               [div, null]
 *
 * @returns
 */
declare function resolveSelector(selector: string): [string, string | null];

interface ObjectInterface<V> {
    [key: string]: V;
    [key: symbol]: V;
}
interface ConstructortInterface {
    new (): any;
    constructor: Function;
    [key: string | symbol]: any;
}

declare class NullInjector implements Injector {
    get(token: any, notFoundValue?: any): any;
}

declare let currentInjector: NullInjector;
interface Provider {
    provide: any;
    useValue?: any;
    useClass?: any;
    useFactory?: Function;
    deps?: any[];
    multi?: boolean;
}
interface ValueProvider extends Provider {
    useValue: any;
}
interface ClassProvider extends Provider {
    useClass: any;
    deps: Array<any>;
}
interface FactoryProvider extends Provider {
    useFactory: Function;
    deps: Array<any>;
}
interface standardProvider {
    token: any;
    useNew: boolean;
    fn: Function;
    value: any;
    deps: any[] | undefined;
}
declare type StaticProvider = ValueProvider | ClassProvider | FactoryProvider;
declare abstract class Injector {
    static THROW_IF_NOT_FOUND: {};
    abstract get(token: any, notFoundValue?: any): any;
    static create(providers: StaticProvider[], parent?: Injector): StaticInjector;
    static θθpro(): NullInjector;
}
declare class StaticInjector {
    private parent;
    records: Map<any, any>;
    _desc: string;
    constructor(provides?: StaticProvider[], desc?: string, parent?: Injector);
    get(token: any, notFoundValue?: any): any;
    instanceOnlyProvider(record: standardProvider): any;
}
declare class InjectionToken {
    desc: string;
    constructor(desc: string);
}

declare enum TViewIndex {
    Host = 0,
    RootElements = 1,
    LView = 2,
    Class = 3,
    Parent = 4,
    Children = 5,
    Context = 6,
    Document = 7,
    Directives = 8,
    InRange = 9,
    ComponentDef = 10,
    Slots = 11,
    Injector = 12,
    Module = 13,
    TNode = 14,
    References = 15,
    EmbeddedView = 16,
    Structures = 17,
    Mode = 18,
    styleDOM = 19
}

declare class ViewContainer extends TemplateDynamic {
    private index;
    private def;
    previousContext?: ViewDefination[];
    childrenView: embeddedView | null[];
    currentTView: TemplateView;
    constructor(index: number, def: ViewDefination, dir: ConstructortInterface);
    install(): void;
    update(): void;
    diff(viewsContext: any[]): void;
    destroyed(): void;
}
declare class embeddedView extends TemplateDynamic {
    private def;
    TView: TemplateView;
    constructor(def: {
        attributes: any[];
        template: Function;
    }, context: any, host: HTMLTemplateElement);
    $getDefinition(): {
        attributes: any[];
        template: Function;
    };
    install(): void;
    update(): void;
    destroyed(): void;
}

declare abstract class TNode$1 {
    clone(): void;
}
/**
 * @public finAttributes 静态属性与动态属性合并后的最终attributes
 */
declare class elementNode extends TNode$1 {
    type: number;
    tagName: string;
    index: number;
    native?: Element;
    attributes: any[];
    directives: ObjectInterface<any>[];
    component?: Function;
    children: number[];
    parent: number;
    TView?: TemplateView | ViewContainer | embeddedView;
    finAttributes: ObjectInterface<any>;
    constructor(tagName: string, index: number, dynamicStyle?: string[][], dynamicClasses?: string[][], attributes?: ObjectInterface<any>, events?: Object, dynamicAttributes?: ObjectInterface<any>, references?: ObjectInterface<string>, structures?: ObjectInterface<string[]>, model?: ObjectInterface<string[]>);
}
declare class textNode extends TNode$1 {
    type: number;
    content: Function;
    native: Text;
    parent: number;
    index: number;
    constructor(content: Function, native: Text, index: number);
}
declare class commentNode extends TNode$1 {
    type: number;
    content: string;
    native: Comment;
    parent: number;
    constructor(content: string, native: Comment);
}
declare type abstractTNode = elementNode | textNode | commentNode;

declare class LogicView extends Array {
}

declare enum ViewMode {
    create = 1,
    update = 2,
    install = 3,
    sleep = 4
}
declare const offset = 20;
declare class TemplateDynamic extends Array {
    [TViewIndex.Host]?: Element | HTMLTemplateElement;
    [TViewIndex.RootElements]: number[];
    [TViewIndex.TNode]?: elementNode;
    [TViewIndex.LView]?: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children]: number[];
    [TViewIndex.Directives]: Set<number>;
    [TViewIndex.Class]?: ConstructortInterface;
    [TViewIndex.Context]: ObjectInterface<any>;
    [TViewIndex.ComponentDef]?: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]?: Object;
    [TViewIndex.Injector]?: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.InRange]: () => Array<any>;
    [TViewIndex.References]: ObjectInterface<number[]>;
    [TViewIndex.EmbeddedView]?: ObjectInterface<any>;
    [TViewIndex.Mode]: ViewMode;
    constructor();
    injectProviders(): void;
    /**
     * 处理 input 属性,新旧属性更新
     *
     */
    updateInput(ctx: any): Map<string, {
        value: any;
        currentValue: any;
    }>;
    createOutput(ctx: ObjectInterface<any>): void;
    createViewChild(ctx: ObjectInterface<any>): void;
    mergeContextAndDecorators(ctx: ObjectInterface<any>): void;
    /**
     * 实例化组件/指令
     */
    initContext(): any;
}

/**
 * 组件的模板视图，用以存储组件的元数据。
 *
 * @param component 组件
 * @param host 组件的宿主元素
 * @param parent 组件的父级级 TView
 */
declare class TemplateView extends TemplateDynamic {
    constructor(component: ConstructortInterface, tNode?: elementNode, host?: DocumentFragment);
    private $getDefinition;
    install(): void;
    update(): void;
    sleep(): void;
    destroyed(): void;
}

interface ViewDefination {
    attributes: Array<null | Array<number | string>>;
    template: Function;
}
/**
 * 指令集运行栈，控制上下文的 TView
 */
declare let instructionIFrameStates: any;
declare function bootstrapView(rootComponent: {
    new (): any;
}, native: Element): TemplateView;
declare class CheckDetectChange {
    detectChanges(): void;
}
declare const TViewFns: ObjectInterface<Function>;

interface Position {
    row: number;
    column: number;
}

interface CommentTNode {
    content: string;
    type: number;
    startPosition: Position;
    endPosition: Position;
}
interface ElementTNode {
    tagName: string;
    attributes: Array<string>;
    closed: boolean;
    children: Array<AllTNode>;
    type: number;
    startPosition: Position;
    endPosition: Position;
    resolvedAttributes: Array<ObjectInterface<string | Array<string>>>;
}
interface TextTNode {
    content: string;
    type: number;
    startPosition: Position;
    endPosition: Position;
}
declare type AllTNode = CommentTNode | ElementTNode | TextTNode;
declare type TNode = ElementTNode | TextTNode;

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
declare class Instruction {
    treeNode: TNode[];
    index: number;
    configuration: Configuration;
    createFn: string;
    updateFn: string;
    template?: Function;
    componentDef?: Function;
    elements: Array<Element>;
    attributes: Array<ObjectInterface<string | Array<string>>>[];
    embeddedViews: any[];
    instructionParams: Set<string>;
    constructor(addConfiguration?: Configuration);
    init(treeNode: TNode[]): void;
    /**
     * 只创造create，update 函数体
     * @param treeNode 节点树
     */
    createFunctionBody(treeNode?: TNode[]): void;
    createFactory(treeNode?: TNode[]): void;
    createComponentDef(): void;
    createTemplateFn(): void;
    /**
     * 递归解析各类节点生成指令集
     * @param elements 节点抽象属性
     */
    resolveTNodes(elements: TNode[]): void;
    resolveModel(tagName: string, resolvedAttributes: Array<any>): void;
    /**
     * 解析element节点，生成对应指令集,
     * 此处解析嵌入视图[包含结构性指令 *for, *if]
     *
     * @param element 节点
     */
    resolveElement(element: ElementTNode): void;
    resolveEmbedded(element: ElementTNode): void;
    closeElement(element: ElementTNode): void;
    /**
     * 插值语法字符串解析较复杂，暂时使用with语句代替
     * @param element 文本节点
     */
    resolveText(element: TextTNode): void;
    /**
     *
     * @param element 注释节点
     */
    resolveComment(element: CommentTNode): void;
    /**
     * 将当前节点的属性解析后存储到 组件属性集合上
     * @param attributes 组件上所有节点的属性集合
     */
    resolveAttributes(attributes: string[]): void;
    /**
     * 判断当前节点是否需要更新属性
     */
    attemptUpdate(): void;
    /**
     * 将动态属性解析成纯函数，在更新时直接输入ctx获取最新属性
     * @param dynamicKey 属性key
     * @param value 属性value 的 函数体
     * @returns
     */
    extractDynamiceAttributes(dynamicKey: string, value: string): ObjectInterface<string[]>[];
    /**
     * 属性的更新指令集
     */
    updateProperty(): void;
    /**
     *添加事件的指令集
     * @param eventName 事件名称
     * @param callback 事件的回调函数
     */
    addListener(eventName: string, callback: string): void;
}

/**
 * 解析组件，生成指令集函数
 * @param parse 解析 template
 * @param instruction 指令集函数集合
 */
declare class compiler {
    parse: parseTemplate;
    instruction: Instruction;
    instructionContext: any;
    constructor(parse: parseTemplate, instruction: Instruction, instructionContext: any);
    transform(component: any): any;
    transformByTNodes(): void;
}

declare enum AttributeType {
    dynamicStyle = 0,
    dynamicClass = 1,
    staticAttribute = 2,
    event = 3,
    dynamicAttrubute = 4,
    reference = 5,
    structure = 6,
    model = 7,
    style = 8,
    class = 9,
    text = 10,
    length = 11
}

declare enum elementType {
    Element = 1,
    Attr = 2,
    Text = 3,
    CDATASection = 4,
    Comment = 8
}

declare class TemplateDirective extends TemplateDynamic {
    private index;
    constructor(index: number, dir: ConstructortInterface, native: Element, tNode: elementNode);
    install(): void;
    update(): void;
    destroy(): void;
}

/**
 * 嵌入视图，与 结构性指令相关，将结构性指令与主干view分割开
 */
declare class TemplateEmbedded extends TemplateDynamic {
}

interface ComponentParams {
    selector: string;
    styles: string;
    template: string;
    providers?: StaticProvider[];
}
declare function Component(params: ComponentParams): (target: any) => any;

interface DirectiveParams {
    selector?: string;
    styles?: string;
    providers?: StaticProvider[];
}
declare function Directive(params: DirectiveParams): (target: any) => any;

interface Route {
    component?: any;
    path: string;
    loadChildren?: Function;
    children?: Route[];
}

interface ModuleParams {
    declarations?: Array<any>;
    imports?: Array<any>;
    exports?: Array<any>;
    providers?: Array<any>;
    bootstrap?: Array<any>;
    routes?: Array<Route>;
}
declare function Module(params: ModuleParams): Function;

declare enum Decorator {
    Module = 0,
    Component = 1,
    Directive = 2
}

declare const InjectToken: unique symbol;
declare function Inject(param: any): (target: ObjectInterface<any>, name: string | undefined, index: number) => void;

declare const InputKeys: unique symbol;
declare const InputChanges: unique symbol;
declare function Input(inputKey: string): (target: ObjectInterface<any>, localKey: string) => void;

declare const EventKeys: unique symbol;
declare const EventChanges: unique symbol;
declare function Output(type: string): (target: ObjectInterface<any>, key: string) => void;

declare const ViewKeys: unique symbol;
declare const ViewChanges: unique symbol;
declare function ViewChild(tag: string): (target: ObjectInterface<any>, key: string) => void;

declare class formGroupDirective {
    private cd;
    formGroup?: formGroup;
    form?: HTMLFormElement;
    inputs?: HTMLFormControlsCollection;
    constructor(cd: CheckDetectChange);
    OnBind(native: HTMLFormElement): void;
    OnInit(): void;
    change(): void;
}

declare class formControl {
    private config;
    constructor(config: ObjectInterface<any>);
    input?: HTMLInputElement;
    group?: formGroupDirective;
    bind(input: HTMLInputElement, group: formGroupDirective): void;
}

declare class formGroup {
    private fromControls;
    TView: TemplateView;
    constructor(fromControls: ObjectInterface<any>);
    get(name: string): any;
    change(): void;
}

declare class formsModule {
}

/**
 *
 * @param dir 组件/指令的context
 * @param hookName 钩子名称
 * @param params 任意参数
 */
declare function Hook(context: ObjectInterface<any>, hookName: string, ...params: any[]): void;

declare const componentFromModule = "$$_Bind_Module";
declare const registerApplication: string;
declare const routeConfig = "$$_Route_Config";
/**
 * 平台是顶级作用域，下级是应用，应用下注册模块，
 * 模块下的组件构成视图。
 *
 * 平台引导模块启动，通过实例化应用，将模块注册到应用上
 * 平台
 *
 * @param @public  injector 平台依赖
 * @public applications 平台上运行的应用
 */
declare class PlatformRef {
    injector: StaticInjector;
    application: Application;
    constructor(injector: StaticInjector);
    /**
     *平台引导 module
     * @param module 根模块
     */
    bootstrapModule(module: any, native: Element): void;
    /**
     *平台调用 视图部分API，将组件挂载到view上
     *
     * @param rootComponent 启动的根组件
     */
    bootstrapComponent(rootComponent: {
        new (): any;
    }, app: Application, native: Element): void;
}
/**
 * 聚合模块的数据
 *
 * @param module 模块
 * @param root  根模块
 *
 * @public modules 模块
 * @public injector 模块依赖注入
 * @public inRange 当前模块的声明的[组件，指令，pipe]，及导入的模块所导出的[组件，指令，pipe]
 * @public rootTView 当前应用运行时的 TemplateView
 */
declare class Application {
    modules: Map<any, any>;
    injector?: Injector;
    inRange: Array<any>;
    rootTView?: TemplateView;
    routesTree: Map<RegExp, Map<RegExp, any>>;
    routesStack: any[];
    currentRouteBranch: Map<RegExp, Map<RegExp, any>>;
    collectDeclarations(module: any): any[];
    resolveRoutes(routes: Route[], parent: Map<RegExp, any>, preRegExp: string[]): Map<RegExp, any>;
    registerRoutes(module: any): void;
    registerModule(module: any): any;
    collectAndRegisterProvider(module: any): void;
}
/**
 *
 * @param parentPlatformProviders 平台注入的providers
 * @param name
 * @param providers 注入的providers
 * @returns
 */
declare function collectRunDependency(parentPlatformProviders: StaticProvider[], name: string, providers: StaticProvider[]): (extraProvides?: StaticProvider[]) => StaticProvider[];
declare function createPlatform(injector: Injector): any;

/**
 *
 * @param extraProvides 插入的providers
 * @returns 平台实例
 */
declare function PlatformBrowserDynamic(extraProvides?: StaticProvider[]): PlatformRef;

export { Application, AttributeType, CheckDetectChange, Component, Decorator, Directive, EventChanges, EventEmitter, EventKeys, Hook, Inject, InjectToken, InjectionToken, Injector, Input, InputChanges, InputKeys, Instruction, LogicView, Module, Output, PlatformBrowserDynamic, PlatformRef, StaticInjector, StaticProvider, TViewFns, TViewIndex, TemplateDirective, TemplateDynamic, TemplateEmbedded, TemplateView, ViewChanges, ViewChild, ViewContainer, ViewDefination, ViewKeys, ViewMode, abstractTNode, bootstrapView, collectRunDependency, commentNode, compiler, componentFromModule, createPlatform, currentInjector, elementNode, elementType, embeddedView, formControl, formGroup, formsModule, instructionIFrameStates, offset, registerApplication, resolveSelector, routeConfig, textNode };
