(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('parse-html-template')) :
    typeof define === 'function' && define.amd ? define(['exports', 'parse-html-template'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.mark5 = {}, global.parseHtmlTemplate));
}(this, (function (exports, parseHtmlTemplate) { 'use strict';

    let defaultConfig = {
        bubbles: false,
        cancelable: true,
        composed: true,
        detail: {},
    };
    class EventEmitter {
        constructor(type, additionConfig = {}) {
            this.event = new CustomEvent(type, Object.assign(defaultConfig, additionConfig));
        }
        emit(emitValue) {
            if (this.event.detail.hasOwnProperty('value')) {
                this.event.detail['value'] = emitValue;
            }
            else {
                Object.defineProperty(this.event.detail, 'value', {
                    value: emitValue,
                    writable: true,
                });
            }
            this.event.detail.dom.dispatchEvent(this.event);
        }
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
    function resolveSelector(selector) {
        let kv = ['', null], pre = selector[0];
        if (pre == '#') {
            kv = ['id', selector.substring(1)];
        }
        else if (pre == '[') {
            let [key, value] = selector
                .substring(1, selector.length - 1)
                .split('=');
            // 处理 value "[name=angular]" 和 "[name = 'angular']" 一样
            if (value) {
                kv = [key.trim(), value.trim()];
            }
            else {
                kv = [key.trim(), null];
            }
        }
        else {
            kv = ['tagName', selector];
        }
        return kv;
    }

    /**
     * 解析组件，生成指令集函数
     * @param parse 解析 template
     * @param instruction 指令集函数集合
     */
    class compiler {
        constructor(parse, instruction, instructionContext) {
            this.parse = parse;
            this.instruction = instruction;
            this.instructionContext = instructionContext;
        }
        transform(component) {
            let { template } = component;
            let tokenTree = this.parse.parse(template);
            this.instruction.createFactory(tokenTree);
            let paramsString = Array.from(this.instruction.instructionParams), paramsFns = paramsString.map((key) => this.instructionContext[key]);
            let componentDef = this.instruction.componentDef(...paramsFns);
            return componentDef;
        }
        transformByTNodes() { }
    }

    exports.AttributeType = void 0;
    (function (AttributeType) {
        AttributeType[AttributeType["dynamicStyle"] = 0] = "dynamicStyle";
        AttributeType[AttributeType["dynamicClass"] = 1] = "dynamicClass";
        AttributeType[AttributeType["staticAttribute"] = 2] = "staticAttribute";
        AttributeType[AttributeType["event"] = 3] = "event";
        AttributeType[AttributeType["dynamicAttrubute"] = 4] = "dynamicAttrubute";
        AttributeType[AttributeType["reference"] = 5] = "reference";
        AttributeType[AttributeType["structure"] = 6] = "structure";
        AttributeType[AttributeType["model"] = 7] = "model";
        AttributeType[AttributeType["style"] = 8] = "style";
        AttributeType[AttributeType["class"] = 9] = "class";
        AttributeType[AttributeType["text"] = 10] = "text";
        AttributeType[AttributeType["length"] = 11] = "length";
    })(exports.AttributeType || (exports.AttributeType = {}));

    exports.elementType = void 0;
    (function (elementType) {
        elementType[elementType["Element"] = 1] = "Element";
        elementType[elementType["Attr"] = 2] = "Attr";
        elementType[elementType["Text"] = 3] = "Text";
        elementType[elementType["CDATASection"] = 4] = "CDATASection";
        elementType[elementType["Comment"] = 8] = "Comment";
    })(exports.elementType || (exports.elementType = {}));

    exports.TViewIndex = void 0;
    (function (TViewIndex) {
        TViewIndex[TViewIndex["Host"] = 0] = "Host";
        TViewIndex[TViewIndex["RootElements"] = 1] = "RootElements";
        TViewIndex[TViewIndex["LView"] = 2] = "LView";
        TViewIndex[TViewIndex["Class"] = 3] = "Class";
        TViewIndex[TViewIndex["Parent"] = 4] = "Parent";
        TViewIndex[TViewIndex["Children"] = 5] = "Children";
        TViewIndex[TViewIndex["Context"] = 6] = "Context";
        TViewIndex[TViewIndex["Document"] = 7] = "Document";
        TViewIndex[TViewIndex["Directives"] = 8] = "Directives";
        TViewIndex[TViewIndex["InRange"] = 9] = "InRange";
        TViewIndex[TViewIndex["ComponentDef"] = 10] = "ComponentDef";
        TViewIndex[TViewIndex["Slots"] = 11] = "Slots";
        TViewIndex[TViewIndex["Injector"] = 12] = "Injector";
        TViewIndex[TViewIndex["Module"] = 13] = "Module";
        TViewIndex[TViewIndex["TNode"] = 14] = "TNode";
        TViewIndex[TViewIndex["References"] = 15] = "References";
        TViewIndex[TViewIndex["EmbeddedView"] = 16] = "EmbeddedView";
        TViewIndex[TViewIndex["Structures"] = 17] = "Structures";
        TViewIndex[TViewIndex["Mode"] = 18] = "Mode";
        TViewIndex[TViewIndex["styleDOM"] = 19] = "styleDOM";
    })(exports.TViewIndex || (exports.TViewIndex = {}));

    exports.Decorator = void 0;
    (function (Decorator) {
        Decorator[Decorator["Module"] = 0] = "Module";
        Decorator[Decorator["Component"] = 1] = "Component";
        Decorator[Decorator["Directive"] = 2] = "Directive";
    })(exports.Decorator || (exports.Decorator = {}));

    function Component(params) {
        let { selector, styles, template, providers } = params;
        return function (target) {
            target.selector = selector;
            target.styles = styles;
            target.template = template;
            target.providers = providers;
            target.$type = exports.Decorator.Component;
            return target;
        };
    }

    function Directive(params) {
        let { selector, styles, providers } = params;
        return function (target) {
            target.selector = selector;
            target.styles = styles;
            target.providers = providers;
            target.$type = exports.Decorator.Directive;
            return target;
        };
    }

    function Module(params) {
        let { declarations, imports, exports, providers, bootstrap, routes } = params;
        return function (target) {
            target.$declarations = declarations;
            target.$imports = imports;
            target.$exports = exports;
            target.$providers = providers;
            target.$bootstrap = bootstrap;
            target.$routes = routes;
            return target;
        };
    }

    const InjectToken = Symbol('$$_@Inject_Token');
    function Inject(param) {
        return function (target, name, index) {
            if (!target[InjectToken]) {
                target[InjectToken] = [];
            }
            target[InjectToken][index] = param;
        };
    }

    const InputKeys = Symbol('$$_@Input_Keys'), InputChanges = Symbol('$$_@Input_Changes');
    function Input(inputKey) {
        return function (target, localKey) {
            if (!target[InputKeys]) {
                target[InputKeys] = [];
            }
            target[InputKeys][localKey] = inputKey;
        };
    }

    const EventKeys = Symbol('$$_@Output_Keys'), EventChanges = Symbol('$$_@Output_Changes');
    function Output(type) {
        return function (target, key) {
            if (!target[EventKeys]) {
                target[EventKeys] = Object.create({});
            }
            target[EventKeys][key] = type;
        };
    }

    const ViewKeys = Symbol('$$_@View_Keys'), ViewChanges = Symbol('$$_@View_Changes');
    function ViewChild(tag) {
        return function (target, key) {
            if (!target[ViewKeys]) {
                target[ViewKeys] = Object.create({});
            }
            target[ViewKeys][key] = tag;
        };
    }

    const θd = document;

    /**
     *
     * @param dir 组件/指令的context
     * @param hookName 钩子名称
     * @param params 任意参数
     */
    function Hook(context, hookName, ...params) {
        if ({}.toString.call(context[hookName]) == '[object Function]') {
            context[hookName](...params);
        }
    }

    const THROW_IF_NOT_FOUND = {};
    class NullInjector {
        get(token, notFoundValue = THROW_IF_NOT_FOUND) {
            if (notFoundValue == THROW_IF_NOT_FOUND) {
                const error = new Error(`NullInjectorError: No provider for ${token}`);
                error.name = 'NullInjectorError';
                throw error;
            }
            return notFoundValue;
        }
    }

    exports.currentInjector = new NullInjector();
    class Injector {
        static create(providers, parent = exports.currentInjector) {
            let nextInjector = new StaticInjector(providers, '', parent);
            exports.currentInjector = nextInjector;
            return nextInjector;
        }
        static θθpro() {
            return exports.currentInjector;
        }
    }
    Injector.THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
    class StaticInjector {
        constructor(provides = [], desc = '', parent = exports.currentInjector) {
            this.parent = parent;
            this.records = new Map();
            this._desc = desc;
            provides.forEach((provider) => {
                let { token, useNew, fn, value, deps } = resolveProvider(provider);
                this.records.set(token, {
                    token,
                    useNew,
                    fn,
                    value,
                    deps,
                });
            });
            exports.currentInjector = this;
        }
        get(token, notFoundValue) {
            // 自定义依赖注入
            if (token['θθpro']) {
                return token['θθpro']();
            }
            let record = this.records.get(token);
            if (!record) {
                return this.parent.get(token, notFoundValue);
            }
            return this.instanceOnlyProvider(record);
        }
        instanceOnlyProvider(record) {
            let { token, useNew, fn, value, deps } = record;
            if (value) {
                return value;
            }
            else if (useNew && fn instanceof Function) {
                let params = new Array();
                deps &&
                    deps.forEach((dep) => {
                        params.push(this.get(dep));
                    });
                return (record.value = new fn(...params));
            }
            else {
                let error = `provider Error:${token} provider 格式错误`;
                throw error;
            }
        }
    }
    function resolveProvider(provider) {
        let { provide, useClass, useFactory, useValue, deps } = provider;
        return {
            token: provide,
            useNew: !!(useClass || useFactory),
            fn: useClass || useFactory,
            value: useValue,
            deps,
        };
    }
    class InjectionToken {
        constructor(desc) {
            this.desc = desc;
        }
    }

    const componentFromModule = '$$_Bind_Module', registerApplication = '$$_Register_Application', routeConfig = '$$_Route_Config';
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
    class PlatformRef {
        constructor(injector) {
            this.injector = injector;
            this.application = this.injector.get(Application);
        }
        /**
         *平台引导 module
         * @param module 根模块
         */
        bootstrapModule(module, native) {
            let { $bootstrap, $routes } = module;
            if ($bootstrap.length > 0) {
                this.application.registerModule(module);
                if ($routes) {
                    this.application.registerRoutes(module);
                }
                this.bootstrapComponent($bootstrap[0], this.application, native);
            }
        }
        /**
         *平台调用 视图部分API，将组件挂载到view上
         *
         * @param rootComponent 启动的根组件
         */
        bootstrapComponent(rootComponent, app, native) {
            let rootTView = bootstrapView(rootComponent, native);
            app['rootTView'] = rootTView;
            window['view'] = rootTView;
        }
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
    class Application {
        constructor() {
            this.modules = new Map();
            this.inRange = [];
            this.routesTree = new Map();
            this.routesStack = [this.routesTree];
            this.currentRouteBranch = this.routesTree;
        }
        collectDeclarations(module) {
            let { $declarations = [], $imports } = module, partDeclarations = [...$declarations];
            for (let m of $imports) {
                partDeclarations.push(...this.collectDeclarations(m));
            }
            return partDeclarations;
        }
        resolveRoutes(routes, parent, preRegExp) {
            for (let route of routes) {
                let { path, component, loadChildren, children = [] } = route, next = new Map();
                let paths = path.split('/'), resolved = [], pathRegExp;
                for (let p of paths) {
                    if (p.startsWith(':')) {
                        resolved.push('([^/]+)');
                    }
                    else {
                        resolved.push(`${p}`);
                    }
                }
                pathRegExp = new RegExp([...preRegExp, ...resolved].join(`\/`));
                parent.set(pathRegExp, next);
                next.set(routeConfig, {
                    component,
                    loadChildren,
                });
                this.resolveRoutes(children, next, [...preRegExp, ...resolved]);
            }
            return parent;
        }
        registerRoutes(module) {
            let { $routes } = module;
            this.resolveRoutes($routes, this.routesTree, ['']);
            this.currentRouteBranch = this.routesTree;
            console.log('解析后的route树：', this.routesTree);
        }
        registerModule(module) {
            let { $declarations = [], $imports = [], $exports = [], $providers = [], $bootstrap = [], } = module;
            module[registerApplication] = this;
            this.collectAndRegisterProvider(module);
            for (let declaration of $declarations) {
                declaration.chooser = resolveSelector(declaration.selector);
                if (declaration.hasOwnProperty(componentFromModule)) {
                    throw Error('组件在多个模块中定义!');
                }
                Object.defineProperty(declaration, componentFromModule, {
                    value: module,
                    writable: false,
                    enumerable: false,
                });
                this.inRange.push(declaration);
            }
            this.modules.set(module, {
                $declarations,
                $imports,
                $exports,
                $providers,
                $bootstrap,
            });
            for (let depModule of $imports) {
                let exports = this.registerModule(depModule);
                this.inRange = [...this.inRange, ...exports]; //收集依附模块暴露出的组件/指令/pipe
            }
            return $exports;
        }
        collectAndRegisterProvider(module) {
            let { $providers = [] } = module;
            this.injector = new StaticInjector($providers, `${module.name}`);
        }
    }
    /**
     *
     * @param parentPlatformProviders 平台注入的providers
     * @param name
     * @param providers 注入的providers
     * @returns
     */
    function collectRunDependency(parentPlatformProviders, name, providers) {
        let allProviders = parentPlatformProviders.concat(providers);
        return (extraProvides = []) => {
            return allProviders.concat(extraProvides);
        };
    }
    function createPlatform(injector) {
        return injector.get(PlatformRef);
    }

    class TNode {
        clone() { }
    }
    /**
     * @public finAttributes 静态属性与动态属性合并后的最终attributes
     */
    class elementNode extends TNode {
        constructor(tagName, index, dynamicStyle = [], dynamicClasses = [], attributes = {}, events = {}, dynamicAttributes = {}, references = {}, structures = {}, model = {}) {
            super();
            this.type = exports.elementType.Element;
            this.attributes = new Array();
            this.directives = [];
            this.children = [];
            this.parent = -1;
            this.tagName = tagName;
            this.index = index;
            this.attributes = [
                Object.values(dynamicStyle).map((fnConfig) => new Function(...fnConfig)),
                Object.values(dynamicClasses).map((fnConfig) => new Function(...fnConfig)),
                attributes,
                events,
                {},
                references,
                {},
                {},
                model,
            ];
            Object.keys(structures).forEach((key) => (this.attributes[exports.AttributeType.structure][key] = new Function(...structures[key])));
            this.finAttributes = Object.assign({}, attributes);
            Object.keys(dynamicAttributes).map((key) => {
                this.attributes[exports.AttributeType.dynamicAttrubute][key] = new Function(...dynamicAttributes[key]);
            });
        }
    }
    class textNode extends TNode {
        constructor(content, native, index) {
            super();
            this.type = exports.elementType.Text;
            this.parent = -1;
            this.content = content;
            this.native = native;
            this.index = index;
        }
    }
    class commentNode extends TNode {
        constructor(content, native) {
            super();
            this.type = exports.elementType.Comment;
            this.parent = -1;
            this.content = content;
            this.native = native;
        }
    }

    var _a, _b, _c, _d, _e, _f, _g;
    exports.ViewMode = void 0;
    (function (ViewMode) {
        ViewMode[ViewMode["create"] = 1] = "create";
        ViewMode[ViewMode["update"] = 2] = "update";
        ViewMode[ViewMode["install"] = 3] = "install";
        ViewMode[ViewMode["sleep"] = 4] = "sleep";
    })(exports.ViewMode || (exports.ViewMode = {}));
    const offset$1 = 20;
    class TemplateDynamic extends Array {
        constructor() {
            super();
            this[_a] = [];
            this[_b] = [];
            this[_c] = new Set();
            this[_d] = {};
            this[_e] = () => {
                return this[exports.TViewIndex.Module] &&
                    this[exports.TViewIndex.Module][registerApplication]
                    ? this[exports.TViewIndex.Module][registerApplication].inRange || []
                    : this[exports.TViewIndex.Parent][exports.TViewIndex.InRange]();
            };
            this[_f] = {};
            this[_g] = exports.ViewMode.sleep;
            Object.setPrototypeOf(this, TemplateDynamic.prototype);
        }
        injectProviders() {
            var _h;
            let providers = ((_h = Object.getOwnPropertyDescriptor(this[exports.TViewIndex.Class], 'providers')) === null || _h === void 0 ? void 0 : _h.value) || [];
            this[exports.TViewIndex.Injector] = new StaticInjector(providers);
        }
        /**
         * 处理 input 属性,新旧属性更新
         *
         */
        updateInput(ctx) {
            // 根节点 和 embedded无 tNode
            let tNode = this[exports.TViewIndex.TNode] || new elementNode('', Infinity), { finAttributes } = tNode, inputKeys = ctx[InputKeys] || {}, inputChanges = ctx[InputChanges], conflict = new Map();
            for (let [localKey, inputKey] of Object.entries(inputKeys)) {
                let value = finAttributes[inputKey] || ctx[inputKey], currentValue = inputChanges[localKey]
                    ? inputChanges[localKey]['currentValue']
                    : undefined;
                inputChanges[localKey] = {
                    inputKey,
                    currentValue: value,
                    previousValue: currentValue,
                };
                // if (value !== currentValue) {
                conflict.set(inputKey, { currentValue, value });
                // }
            }
            return conflict;
        }
        // 处理output事件,将 EventEmitter,添加到 mid层，方便emit
        createOutput(ctx) {
            // 根节点无
            if (!this[exports.TViewIndex.TNode]) {
                return;
            }
            let host = this[exports.TViewIndex.Host], outputKeys = ctx[EventKeys] || {}, outputEventObj = (ctx[EventChanges] = Object.create({}));
            for (let [key, type] of Object.entries(outputKeys)) {
                outputEventObj[key] = {
                    currentValue: new EventEmitter(type, {
                        detail: {
                            dom: host,
                        },
                    }),
                };
            }
        }
        createViewChild(ctx) {
            let viewKeys = ctx[ViewKeys] || {}, viewObj = (ctx[ViewChanges] = Object.create({}));
            for (let [local, tag] of Object.entries(viewKeys)) {
                viewObj[local] = {
                    key: tag,
                };
            }
        }
        // TODO:不能遍历，使用者可能自定义Symbol数据
        // 将context 与@Input，@Output，@Inject合并
        mergeContextAndDecorators(ctx) {
            for (let cache of Object.getOwnPropertySymbols(ctx)) {
                for (let [key, value] of Object.entries(ctx[cache])) {
                    Object.defineProperty(ctx, key, {
                        get() {
                            return ctx[cache][key].currentValue;
                        },
                        set(v) {
                            throw Error(`%c${key}是被@Input,@Output,@Inject修饰的数据,不可更改!`);
                        },
                    });
                }
            }
        }
        /**
         * 实例化组件/指令
         */
        initContext() {
            let dir = this[exports.TViewIndex.Class], tokens = dir[InjectToken] || [], providers = tokens.map((token) => { var _h; return (_h = this[exports.TViewIndex.Injector]) === null || _h === void 0 ? void 0 : _h.get(token); }), ctx = new dir(...providers);
            ctx[InputChanges] = Object.create({});
            ctx[EventChanges] = Object.create({});
            ctx[InjectToken] = [];
            return ctx;
        }
    }
    exports.TViewIndex.Host, _a = exports.TViewIndex.RootElements, exports.TViewIndex.TNode, exports.TViewIndex.LView, exports.TViewIndex.Parent, _b = exports.TViewIndex.Children, _c = exports.TViewIndex.Directives, exports.TViewIndex.Class, _d = exports.TViewIndex.Context, exports.TViewIndex.ComponentDef, exports.TViewIndex.Slots, exports.TViewIndex.Injector, exports.TViewIndex.Module, _e = exports.TViewIndex.InRange, _f = exports.TViewIndex.References, exports.TViewIndex.EmbeddedView, _g = exports.TViewIndex.Mode;

    class LogicView extends Array {
    }

    class ViewContainer extends TemplateDynamic {
        constructor(index, def, dir) {
            super();
            this.index = index;
            this.def = def;
            this.previousContext = [];
            this.childrenView = [];
            Object['setPrototypeOf'](this, ViewContainer.prototype);
            let currentTView = (this.currentTView = TViewFns.currentTView()), currentLView = currentTView[exports.TViewIndex.LView];
            this[exports.TViewIndex.Host] = currentLView[index + offset$1];
            this[exports.TViewIndex.Class] = dir;
            this[exports.TViewIndex.LView] = new LogicView();
            this[exports.TViewIndex.TNode] = currentTView[index + offset$1];
            this[exports.TViewIndex.TNode]['TView'] = this;
            this[exports.TViewIndex.Module] = dir.hasOwnProperty(componentFromModule)
                ? dir[componentFromModule]
                : null;
            this.injectProviders();
            this[exports.TViewIndex.Context] = this.currentTView[exports.TViewIndex.Context];
            this[exports.TViewIndex.EmbeddedView] = this.initContext();
        }
        install() {
            this.updateInput(this[exports.TViewIndex.EmbeddedView]);
            this.createOutput(this[exports.TViewIndex.EmbeddedView]);
            this.mergeContextAndDecorators(this[exports.TViewIndex.EmbeddedView]);
            this.update();
        }
        update() {
            TViewFns.pushContext(this);
            this.updateInput(this[exports.TViewIndex.EmbeddedView]);
            let views = this[exports.TViewIndex.EmbeddedView].OnInputChanges(this[exports.TViewIndex.EmbeddedView][InputChanges]);
            this.diff(views.map((context) => Object.setPrototypeOf(context, this[exports.TViewIndex.Context])));
            TViewFns.popContext();
        }
        diff(viewsContext) {
            var _a;
            for (let i = 0; i < Math.max(viewsContext.length, this.previousContext.length); i++) {
                if (!this.previousContext[i] && viewsContext[i]) {
                    let embedded = new embeddedView(this.def, viewsContext[i], this[exports.TViewIndex.Host]);
                    embedded[exports.TViewIndex.InRange] = this[exports.TViewIndex.InRange];
                    this.childrenView[i] = embedded;
                    embedded.install();
                    this.previousContext[i] = viewsContext[i];
                    this[exports.TViewIndex.Host].after(...Array.from(embedded[exports.TViewIndex.Host].childNodes));
                    this.childrenView[i][exports.TViewIndex.Context] = viewsContext[i];
                }
                else if (this.previousContext[i] && !viewsContext[i]) {
                    this.childrenView[i].destroyed();
                    (_a = this.previousContext) === null || _a === void 0 ? void 0 : _a.splice(i, 1);
                    this.childrenView[i][exports.TViewIndex.RootElements].map((index) => this.childrenView[i][exports.TViewIndex.LView][index + offset$1].remove());
                    this.childrenView[i] = {};
                }
                else if (this.previousContext[i] && viewsContext[i]) {
                    // 更新embedded 的上下文
                    this.childrenView[i][exports.TViewIndex.Context] =
                        viewsContext[i] || {};
                    this.childrenView[i].update();
                }
            }
        }
        destroyed() {
            Hook(this[exports.TViewIndex.Context], 'OnDestroy');
            this.diff([]);
        }
    }
    class embeddedView extends TemplateDynamic {
        constructor(def, context, host) {
            super();
            this.def = def;
            this.TView = TViewFns.currentTView();
            Object['setPrototypeOf'](this, embeddedView.prototype);
            this[exports.TViewIndex.Context] = context;
            this[exports.TViewIndex.LView] = new LogicView();
            this[exports.TViewIndex.Host] = host; //ViewContainer
        }
        $getDefinition() {
            return this.def;
        }
        install() {
            const children = this[exports.TViewIndex.Children];
            TViewFns.pushContext(this);
            this.def.template(exports.ViewMode.install, this[exports.TViewIndex.Context]);
            for (let child of children) {
                let tNode = this[child + offset$1];
                tNode['TView'].install();
            }
            TViewFns.popContext();
        }
        update() {
            console.log('更新上下文', this[exports.TViewIndex.Context]);
            TViewFns.pushContext(this);
            this.def.template(exports.ViewMode.update, this[exports.TViewIndex.Context]);
            const children = this[exports.TViewIndex.Children];
            for (let child of children) {
                let tNode = this[child + offset$1];
                // 嵌入视图的上下文作为中间人，承上启下
                tNode['TView'][exports.TViewIndex.Context] = this[exports.TViewIndex.Context];
                tNode['TView'].update();
            }
            TViewFns.popContext();
        }
        destroyed() {
            TViewFns.pushContext(this);
            this[exports.TViewIndex.Directives]; const children = this[exports.TViewIndex.Children];
            for (let child of children) {
                let tNode = this[child + offset$1];
                tNode['TView'].destroyed();
            }
            TViewFns.popContext();
        }
    }

    class TemplateDirective extends TemplateDynamic {
        constructor(index, dir, native, tNode) {
            super();
            this.index = index;
            Object['setPrototypeOf'](this, TemplateDirective.prototype);
            this[exports.TViewIndex.Class] = dir;
            this[exports.TViewIndex.TNode] = tNode;
            this[exports.TViewIndex.Host] = native;
            this[exports.TViewIndex.Module] = dir.hasOwnProperty(componentFromModule)
                ? dir[componentFromModule]
                : null;
            this[exports.TViewIndex.Parent] = TViewFns.currentTView();
            this.injectProviders();
            this[exports.TViewIndex.Context] = this.initContext();
            // this.updateInput(this[TViewIndex.Context]);
            // this.createOutput(this[TViewIndex.Context]);
            // this.mergeContextAndDecorators(this[TViewIndex.Context]);
        }
        install() {
            this.updateInput(this[exports.TViewIndex.Context]);
            this.createOutput(this[exports.TViewIndex.Context]);
            this.mergeContextAndDecorators(this[exports.TViewIndex.Context]);
        }
        update() {
            this.updateInput(this[exports.TViewIndex.Context]);
        }
        destroy() { }
    }

    /**
     * 组件的模板视图，用以存储组件的元数据。
     *
     * @param component 组件
     * @param host 组件的宿主元素
     * @param parent 组件的父级级 TView
     */
    class TemplateView extends TemplateDynamic {
        constructor(component, tNode, host = θd.createElement('template').content) {
            super();
            this.$getDefinition = (() => {
                return () => {
                    if (!this[exports.TViewIndex.ComponentDef]) {
                        const compilerInstance = this[exports.TViewIndex.Injector].get(compiler);
                        this[exports.TViewIndex.ComponentDef] = compilerInstance.transform(this[exports.TViewIndex.Class]);
                    }
                    return this[exports.TViewIndex.ComponentDef];
                };
            })();
            Object['setPrototypeOf'](this, TemplateView.prototype);
            this[exports.TViewIndex.Class] = component;
            this[exports.TViewIndex.TNode] = tNode;
            this[exports.TViewIndex.Host] = host;
            this[exports.TViewIndex.LView] = new LogicView();
            this[exports.TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
                ? component[componentFromModule]
                : null;
            this[exports.TViewIndex.Parent] = TViewFns.currentTView();
            this.injectProviders();
            this[exports.TViewIndex.Context] = this.initContext();
            instructionIFrameStates.runningTView = null;
        }
        install() {
            this[exports.TViewIndex.Mode] = exports.ViewMode.install;
            this.updateInput(this[exports.TViewIndex.Context]); // 初始化 @Input
            this.createOutput(this[exports.TViewIndex.Context]); // 初始化 @Output
            this.createViewChild(this[exports.TViewIndex.Context]); // 初始化 @ViewChild
            this.mergeContextAndDecorators(this[exports.TViewIndex.Context]);
            TViewFns.pushContext(this);
            const def = this.$getDefinition(), children = this[exports.TViewIndex.Children];
            // 加载css
            const { styles } = this[exports.TViewIndex.Class], styleDOM = document.createElement('style');
            styleDOM.innerHTML = styles;
            document.head.append(styleDOM);
            this[exports.TViewIndex.styleDOM] = styleDOM;
            console.log(def, styles);
            def.template(exports.ViewMode.install, this[exports.TViewIndex.Context]);
            Hook(this[exports.TViewIndex.Context], 'OnInit');
            for (let child of children) {
                let tNode = this[child + offset$1];
                tNode['TView'].install();
            }
            Hook(this[exports.TViewIndex.Context], 'OnViewInit');
            // 指令生命周期
            const nodeHasDirectiveIndex = this[exports.TViewIndex.Directives];
            for (let index of nodeHasDirectiveIndex) {
                let tNode = this[index + offset$1];
                for (let dir of tNode.directives) {
                    Hook(dir[exports.TViewIndex.Context], 'OnViewInit');
                }
            }
            TViewFns.popContext();
            this[exports.TViewIndex.Mode] = exports.ViewMode.sleep;
        }
        // TODO:slot更新未处理
        update() {
            this[exports.TViewIndex.Mode] = exports.ViewMode.update;
            const conflict = this.updateInput(this[exports.TViewIndex.Context]);
            Hook(this[exports.TViewIndex.Context], 'OnInputChanges', conflict);
            // if (conflict.size) {
            TViewFns.pushContext(this);
            let def = this.$getDefinition(), children = this[exports.TViewIndex.Children];
            def && def.template(exports.ViewMode.update, this[exports.TViewIndex.Context]);
            Hook(this[exports.TViewIndex.Context], 'OnUpdated', conflict);
            for (let child of children) {
                let tNode = this[child + offset$1];
                tNode['TView'].update();
            }
            Hook(this[exports.TViewIndex.Context], 'OnViewUpdated', conflict);
            // 指令生命周期
            const nodeHasDirectiveIndex = this[exports.TViewIndex.Directives];
            for (let index of nodeHasDirectiveIndex) {
                let tNode = this[index + offset$1];
                for (let dir of tNode.directives) {
                    Hook(dir[exports.TViewIndex.Context], 'OnViewUpdated');
                }
            }
            TViewFns.popContext();
            // }
            this[exports.TViewIndex.Mode] = exports.ViewMode.sleep;
        }
        // Tview 不应该被展示，也不想被销毁时，可以进行休眠。
        sleep() {
            console.log('该去休眠了');
        }
        destroyed() {
            var _a;
            TViewFns.pushContext(this);
            let children = this[exports.TViewIndex.Children];
            for (let child of children) {
                let tNode = this[child + offset$1];
                tNode['TView'].destroyed();
            }
            Hook(this[exports.TViewIndex.Context], 'OnDestroy');
            (_a = this[exports.TViewIndex.Host]) === null || _a === void 0 ? void 0 : _a.replaceChildren();
            // 卸载style
            this[exports.TViewIndex.styleDOM].remove();
            TViewFns.popContext();
        }
    }

    const offset = 20;
    /**
     * 指令集运行栈，控制上下文的 TView
     */
    let instructionIFrameStates = {
        currentTView: null,
        rootTView: null,
        runningTView: null,
    }, elementStack = new Array();
    function currentTView() {
        return instructionIFrameStates.currentTView;
    }
    function setCurrentTView(tView) {
        instructionIFrameStates.currentTView = tView;
    }
    function currentLView() {
        return currentTView()[exports.TViewIndex.LView];
    }
    function pushContext(tView) {
        tView[exports.TViewIndex.Parent] = currentTView();
        setCurrentTView(tView);
    }
    function popContext() {
        let tView = currentTView(), preTView = tView[exports.TViewIndex.Parent];
        setCurrentTView(preTView);
    }
    function embeddedViewStart(tagName, index, def) {
        // 解析组件，指令建立抽象节点
        let tNode = resolveNode(tagName, index);
        createNative(tNode, index);
        extractStructures(index, def);
        processedNodeContext(index);
    }
    function embeddedViewEnd(tagName) {
        elementEnd(tagName);
    }
    /**
     * 建立真实DOM元素
     *
     * @param tagName 节点名称
     * @param index 节点索引
     */
    function elementStart(tagName, index) {
        // 解析组件，指令建立抽象节点
        let tNode = resolveNode(tagName, index);
        createNative(tNode, index);
        // HookDirective('OnInit', tNode.directives);
        // 添加静态属性
        addStaticAttributes(tNode.native, tNode.attributes[exports.AttributeType.staticAttribute]);
        resolveDirective(tagName, index);
        processedNodeContext(index);
    }
    function createNative(tNode, index) {
        let TView = currentTView(), LView = TView[exports.TViewIndex.LView], { tagName, finAttributes } = tNode, slotName = finAttributes['name'], parentTView = TView[exports.TViewIndex.Parent], dom = θd.createElement(tagName);
        while (parentTView instanceof ViewContainer) {
            parentTView = parentTView[exports.TViewIndex.Parent];
        }
        if (tagName == 'slot') {
            let slotsIndex = TView[exports.TViewIndex.Slots], filters = [], slotsDOM = slotsIndex.map((index) => parentTView[exports.TViewIndex.LView][index + offset]);
            filters = slotsDOM.filter((d) => (slotName &&
                d.nodeType == exports.elementType.Element &&
                d.getAttribute('slot') == slotName) ||
                (!slotName && d.nodeType == exports.elementType.Text));
            dom.append(...filters);
        }
        tNode.native = dom;
        LView[offset + index] = dom;
    }
    function addStaticAttributes(native, attributes = {}) {
        Object.keys(attributes).forEach((key) => {
            native.setAttribute(key, attributes[key]);
        });
    }
    function elementEnd(tagName) {
        const TView = currentTView(), LView = TView[exports.TViewIndex.LView], index = elementStack.pop(), native = LView[index + offset], tNode = TView[index + offset];
        let rootElements = TView[exports.TViewIndex.RootElements];
        let elementStart = LView[index + offset];
        if (elementStart.localName == tagName) {
            if (elementStack.length == 0) {
                rootElements.push(index);
            }
        }
        // 指令的生命周期
        tNode.directives.forEach((dir) => {
            Hook(dir[exports.TViewIndex.Context], 'OnInserted', native);
        });
        // 当前节点是组件，就将slot索引存进 [TViewIndex.Slots];
        if (tNode.TView) {
            tNode.TView[exports.TViewIndex.Slots] = tNode.children;
        }
    }
    /**
     * 当节点上有动态属性时，更新节点属性
     *
     * @param index 节点索引
     */
    function updateProperty(index) {
        let TView = currentTView(), tNode = TView[index + offset];
        let { attributes, finAttributes, directives } = tNode;
        let [dynamicStyle, dynamicClass, staticAttribute, event, dynamicAttrubute, reference, structure, , model,] = attributes;
        if (Object.keys(structure).length > 0) {
            updateInputValue(index, structure, finAttributes);
        }
        else {
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
            directives.forEach((dir) => {
                switch (TView[exports.TViewIndex.Mode]) {
                    case exports.ViewMode.install:
                        dir.install();
                        Hook(dir[exports.TViewIndex.Context], 'OnInit');
                        break;
                    case exports.ViewMode.update:
                        dir.update();
                        Hook(dir[exports.TViewIndex.Context], 'OnInputChanges');
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
    function updateProp(index, attributes, finAttributes, model) {
        let TView = currentTView(), LView = TView[exports.TViewIndex.LView], native = LView[index + offset], context = TView[exports.TViewIndex.Context];
        Object.keys(attributes).forEach((key) => {
            const value = attributes[key](context);
            native.setAttribute(key, value);
            finAttributes[key] = value;
        });
        updateModelProp(index, attributes, model, finAttributes);
    }
    function updateInputValue(index, attributes, finAttributes) {
        let TView = currentTView(), context = TView[exports.TViewIndex.Context];
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
    function updateClass(index, classes, finAttributes) {
        let TView = currentTView(), LView = currentLView(), native = LView[index + offset], context = TView[exports.TViewIndex.Context], result;
        let preClass = native.getAttribute('class') || '', preclassObj = Object.create({}), mergeClass = [];
        preClass &&
            preClass.split(/[ ]+/).map((cla) => {
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
    function updateModelProp(index, attributes, model, finAttributes) {
        const TView = currentTView(), LView = TView[exports.TViewIndex.LView], context = TView[exports.TViewIndex.Context];
        let native = LView[index + offset], { tagName, type } = native;
        for (let [event, value] of Object.entries(model)) {
            let currentValue = context[value];
            if (tagName == 'INPUT') {
                if (type == 'text') {
                    native.value = currentValue;
                    finAttributes[value] = currentValue;
                }
                else if (type == 'checkbox') {
                    if (Array.isArray(currentValue) &&
                        currentValue.includes(native.value)) {
                        native.checked = true;
                    }
                    else {
                        native.checked = false;
                    }
                }
                else if (type == 'radio') {
                    native.checked = native.value === context[value];
                }
            }
            else if (tagName == 'TEXT' || tagName == 'TEXTAREA') {
                native.value = currentValue;
            }
            else if (tagName == 'SELECT') {
                Array.from(native.options).forEach((item) => {
                    if (currentValue.includes(item.value)) {
                        item.selected = true;
                    }
                    else {
                        item.selected = false;
                    }
                });
            }
        }
    }
    /**
     * 更新节点style
     *
     * @param index 节点索引
     * @param styles 节点样式函数
     */
    function updateStyle(index, fns, finAttributes) {
        let TView = currentTView(), LView = currentLView(), native = LView[index + offset], styleMap = native.attributeStyleMap, context = TView[exports.TViewIndex.Context], styleObj = Object.create({});
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
    function creatText(index) {
        let TView = currentTView(), LView = TView[exports.TViewIndex.LView], { attributes } = TView.$getDefinition(), ctx = TView[exports.TViewIndex.Context], fn = new Function(...attributes[index][exports.AttributeType.text]['content']), text = θd.createTextNode(fn(ctx));
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
    function updateText(index) {
        let TView = currentTView(), { content } = TView[index + offset], ctx = TView[exports.TViewIndex.Context], LView = currentLView(), element = LView[index + offset];
        element.textContent = content(ctx);
    }
    /**
     * 创建注释节点
     *
     * @param index 节点索引
     * @param content 内容
     */
    function createComment(index, content) {
        let TView = currentTView(), LView = TView[exports.TViewIndex.LView], comment = θd.createComment(content);
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
    function listener(eventName, callback, index) {
        let LView = currentLView(), el = LView[index + offset];
        el.addEventListener(eventName, callback);
    }
    /**
     * 解析节点并判断节点上是否有特殊属性 [组件， 指令]
     *
     * @param tagName 节点名称
     * @param index 节点索引
     * @return tNode 节点抽象数据
     */
    function resolveNode(tagName, index) {
        const TView = currentTView(), { attributes } = currentTView().$getDefinition(), [dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures, model,] = attributes[index];
        let tNode = new elementNode(tagName, index, dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures, model);
        TView[offset + index] = tNode;
        return tNode;
    }
    function extractStructures(index, def) {
        let TView = currentTView(), TNode = TView[offset + index];
        let { attributes } = TNode, has = false, structures = attributes[exports.AttributeType.structure];
        const InRanges = TView[exports.TViewIndex.InRange]();
        for (let dir of InRanges) {
            let [k, v] = dir.chooser;
            if (structures[k]) {
                if (!has) {
                    has = true;
                    new ViewContainer(index, def, dir);
                    TView[exports.TViewIndex.Children].push(index);
                }
                else {
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
    function resolveDirective(tagName, index) {
        let TView = currentTView(), native = TView[exports.TViewIndex.LView][index + offset], TNode = TView[offset + index];
        let { attributes, directives } = TNode;
        const InRanges = TView[exports.TViewIndex.InRange]() || [], ctx = TView[exports.TViewIndex.Context], [, , staticAttributes, , dynamicAttributes, references, structure] = attributes, localTags = Object.keys(references), viewTagChanges = ctx[ViewChanges]; Object.values(ctx[ViewKeys] || {}); const matchTag = [];
        for (let [key, ref] of Object.entries(ctx[ViewKeys] || {})) {
            if (localTags.includes(ref)) {
                matchTag.push(key);
            }
        }
        matchTag.forEach((tag) => {
            viewTagChanges[tag]['currentValue'] = native;
        });
        for (let dir of InRanges) {
            let [k, v] = dir.chooser;
            if ((k == 'tagName' && tagName == v) ||
                (v === null &&
                    (staticAttributes[k] === '' ||
                        dynamicAttributes[k] ||
                        structure[k])) ||
                staticAttributes[k] === v) {
                let { $type } = dir;
                if ($type == exports.Decorator.Component) {
                    console.log('解析的router', tagName == 'router-view');
                    TView[exports.TViewIndex.Children].push(index);
                    TNode.component = dir;
                    TNode['TView'] = new TemplateView(TNode.component, TNode, native);
                    // @ViewChild
                    matchTag.forEach((tag) => {
                        if (tag === dir) {
                            viewTagChanges[tag]['currentValue'] = TNode['TView'];
                        }
                    });
                    break;
                }
                else if ($type == exports.Decorator.Directive) {
                    TView[exports.TViewIndex.Directives].add(index);
                    let dirInstance = new TemplateDirective(index, dir, native, TNode);
                    // @ViewChild
                    matchTag.forEach((tag) => {
                        if (tag === dir) {
                            viewTagChanges[tag]['currentValue'] = dirInstance;
                        }
                    });
                    Hook(dirInstance[exports.TViewIndex.Context], 'OnBind', native);
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
    function processedNodeContext(index) {
        const TView = currentTView(), LView = TView[exports.TViewIndex.LView], { nodeType } = LView[index + offset];
        let parentIndex;
        let rootElements = TView[exports.TViewIndex.RootElements];
        if (elementStack.length == 0) {
            parentIndex = -1; //当前无父节点
            if (nodeType == exports.elementType.Text) {
                rootElements.push(index);
            }
        }
        else {
            parentIndex = elementStack[elementStack.length - 1];
        }
        if (nodeType == exports.elementType.Element) {
            elementStack.push(index);
        }
        linkParentChild(parentIndex, index);
    }
    //收集父子的index，在slot阶段, 指令生命周期阶段使用
    function linkParentChild(parentIndex, index) {
        const TView = currentTView(), LView = TView[exports.TViewIndex.LView];
        let parentTNode, parentNative, currentTNode = TView[index + offset];
        if (parentIndex == -1) {
            parentNative = TView[exports.TViewIndex.Host];
        }
        else {
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
    function bootstrapView(rootComponent, native) {
        let rootTView = (window.root = new TemplateView(rootComponent, undefined, native));
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
    const TViewFns = {
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

    let cache = new Map();
    function copy(target) {
        const type = {}.toString.call(target);
        switch (type) {
            case '[object Number]':
            case '[object String]':
                return target;
            case '[object Object]':
                return copyObject(target);
            case '[object Array]':
                return copyArray(target);
        }
    }
    function copyObject(target) {
        if (cache.has(target)) {
            return cache.get(target);
        }
        let result = {};
        cache.set(target, result);
        Object.keys(target).forEach((key) => {
            result[key] = copy(target[key]);
        });
        return result;
    }
    function copyArray(target) {
        if (cache.has(target)) {
            return cache.get(target);
        }
        let result = new Array();
        cache.set(target, result);
        for (let i = 0; i < target.length; i++) {
            result[i] = copy(target[i]);
        }
        return result;
    }

    /**
     * 接收 tokenTree,将token解析成指令集。
     *
     * @param treeNode template 解析后生成的 tokenTree
     * @param configuration 配置参数
     */
    class Instruction {
        constructor(addConfiguration = {}) {
            this.treeNode = [];
            this.index = 0;
            this.configuration = {
                interpolationSyntax: ['{{', '}}'],
                addAttributeMark: '&',
                addEventMark: '@',
                structureMark: '*',
                referenceMark: '#',
                modelMark: '%',
            };
            this.createFn = ``;
            this.updateFn = ``;
            this.elements = new Array();
            this.attributes = new Array();
            this.embeddedViews = [];
            this.instructionParams = new Set();
            this.configuration = Object.assign(this.configuration, addConfiguration);
        }
        init(treeNode) {
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
        createFunctionBody(treeNode = []) {
            this.init(treeNode);
            this.resolveTNodes(this.treeNode);
        }
        createFactory(treeNode = []) {
            this.createFunctionBody(treeNode);
            this.createTemplateFn();
            this.createComponentDef();
        }
        createComponentDef() {
            this.componentDef = new Function(...Array.from(this.instructionParams), `
            let attributes = ${JSON.stringify(this.attributes)};
            return {
                embeddedViews:[${this.embeddedViews.length
            ? this.embeddedViews
                .map((obj) => {
                let { embeddedViews, attributes, template } = obj;
                return `{
                        embeddedViews:[${embeddedViews.length
                    ? embeddedViews
                        .map((def) => {
                        return `
                                          {
                                            embeddedViews: ${JSON.stringify(def.embeddedViews)},
                                            attributes: ${JSON.stringify(def.attributes)},
                                            template: ${def.template.toString()},
                                        }`;
                    })
                        .join(',\n')
                    : ''}],
                        attributes:${JSON.stringify(attributes)},
                        template:${template.toString()}
                      }`;
            })
                .join(',\n')
            : ''}],
                attributes,
                template:${this.template}
            }`);
        }
        createTemplateFn() {
            this.template = new Function('mode', 'ctx', `
                if(mode & 1){ ${this.createFn}
                };
                if(mode & 2){ ${this.updateFn}
                };
            `);
        }
        /**
         * 递归解析各类节点生成指令集
         * @param elements 节点抽象属性
         */
        resolveTNodes(elements) {
            for (let element of elements) {
                let { type } = element;
                switch (type) {
                    case exports.elementType.Element:
                        this.resolveElement(element);
                        break;
                    case exports.elementType.Text:
                        this.resolveText(element);
                        break;
                    case exports.elementType.Comment:
                        this.resolveComment(element);
                        break;
                }
            }
        }
        resolveModel(tagName, resolvedAttributes) {
            let [dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures, model,] = resolvedAttributes;
            for (let [name, value] of Object.entries(model)) {
                let { type } = mergeAttributes, eventName = name ? name : 'input';
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
                    }
                    else if (type == 'radio') {
                        this.createFn += `
                    listener('change',function($event){
                                        ctx['${value}'] = $event.target.value;
                                        ctx.cd.detectChanges();
                                    }, ${this.index});`;
                    }
                    else {
                        this.createFn += `
                    listener('${eventName}',function($event){
                                        ctx['${value}'] = $event.target.value;
                                        ctx.cd.detectChanges();
                                    }, ${this.index});`;
                    }
                }
                else if (tagName == 'textarea') {
                    this.createFn += `
                        listener('${eventName}',function($event){
                                            ctx['${value}'] = $event.target.value;
                                            ctx.cd.detectChanges();
                                        }, ${this.index});`;
                }
                else if (tagName == 'select') {
                    this.createFn += `
                        listener('change',function($event){
                                            ctx['${value}'] = [];
                                            Array.from($event.target.options).forEach(item=>{
                                                if(item.selected){
                                                    ctx['${value}'].push(item.value)
                                                }
                                            })
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
        resolveElement(element) {
            const { tagName, attributes, resolvedAttributes, children = [], } = element;
            if (!resolvedAttributes) {
                this.resolveAttributes(attributes);
                element.resolvedAttributes = this.attributes[this.index];
            }
            else {
                this.attributes[this.index] = element.resolvedAttributes;
            }
            this.attemptUpdate();
            let [dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures, model,] = element.resolvedAttributes;
            // 嵌入式图
            if (Object.keys(structures).length) {
                let copyEle = copy(element);
                // 过滤掉第一个结构性指令
                delete copyEle.resolvedAttributes[exports.AttributeType.structure][Object.keys(copyEle.resolvedAttributes[exports.AttributeType.structure])[0]];
                Object.entries(structures).forEach(([key, value]) => {
                    structures[key.slice(1)] = value;
                    delete structures[key];
                });
                this.resolveEmbedded(copyEle);
                this.createFn += `
                        embeddedViewEnd('template');`;
                this.index++;
            }
            else {
                this.instructionParams.add('elementStart');
                this.createFn += `
                        elementStart('${tagName}', ${this.index});`;
                // 绑定事件
                Object.entries(events).forEach(([eventName, fn]) => {
                    this.addListener(eventName, fn);
                });
                // 解析 % 模型
                this.resolveModel(tagName, element.resolvedAttributes);
                this.index++;
                this.resolveTNodes(children);
                this.closeElement(element);
            }
        }
        resolveEmbedded(element) {
            this.instructionParams.add('embeddedViewStart');
            this.instructionParams.add('embeddedViewEnd');
            this.createFn += `
                        embeddedViewStart('template', ${this.index}, this.embeddedViews[${this.embeddedViews.length}]);`;
            let instructionIns = new Instruction();
            instructionIns.createFactory([element]);
            let paramsString = Array.from(instructionIns.instructionParams), paramsFns = paramsString.map((key) => TViewFns[key]), componentDef = instructionIns.componentDef(...paramsFns);
            // 为嵌入视图生成独立的view,以便在结构性指令渲染时有对应的 defination
            this.instructionParams = new Set(Array.from(this.instructionParams).concat(paramsString));
            this.embeddedViews.push(componentDef);
        }
        closeElement(element) {
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
        resolveText(element) {
            this.attributes[this.index] = Array.from(new Array(exports.AttributeType.length), () => Object.create(null));
            this.instructionParams.add('creatText');
            let text = this.attributes[this.index][exports.AttributeType.text], hasInterpolation = false, [start, end] = this.configuration.interpolationSyntax, interpolationRegExp = new RegExp(`${start}\\s*[a-zA-Z0-9!.'"\\[\\]]*\\s*${end}`, 'g'), { content } = element;
            hasInterpolation = !!content.match(interpolationRegExp);
            this.createFn += `
                        creatText(${this.index});`;
            if (hasInterpolation) {
                this.instructionParams.add('updateText');
                text['content'] = [
                    'ctx',
                    `with(ctx){
                    return '${content.replace(interpolationRegExp, (interpolation) => {
                    return ("'+" +
                        interpolation
                            .slice(start.length, interpolation.length - end.length)
                            .trim() +
                        "+'");
                })}'
                }
                `,
                ];
                this.updateFn += `
                        updateText(${this.index});`;
            }
            else {
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
        resolveComment(element) {
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
        resolveAttributes(attributes) {
            this.attributes[this.index] = Array.from(new Array(exports.AttributeType.length), () => Object.create(null));
            let [dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures, model,] = this.attributes[this.index];
            let { addAttributeMark, addEventMark, structureMark, referenceMark, modelMark, } = this.configuration;
            for (let i = 0; i < attributes.length;) {
                let prefix = attributes[i][0];
                if (attributes[i + 1] == '=') {
                    switch (prefix) {
                        case addAttributeMark:
                            let [styles, classes, , , attrs] = this.extractDynamiceAttributes(attributes[i].slice(1), attributes[i + 2]);
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
                }
                else {
                    switch (prefix) {
                        case referenceMark:
                            references[attributes[i].slice(1)] = '';
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
            let [dynamicStyle, dynamicClasses, mergeAttributes, events, dynamicAttributes, references, structures,] = this.attributes[this.index];
            if (Object.keys(dynamicStyle).length > 0 ||
                Object.keys(dynamicClasses).length > 0 ||
                Object.keys(dynamicAttributes).length > 0 ||
                Object.keys(structures).length > 0) {
                this.updateProperty();
            }
        }
        /**
         * 将动态属性解析成纯函数，在更新时直接输入ctx获取最新属性
         * @param dynamicKey 属性key
         * @param value 属性value 的 函数体
         * @returns
         */
        extractDynamiceAttributes(dynamicKey, value) {
            let result = [{}, {}, {}, {}, {}], contextValue = [
                'context',
                `with(context){
                    return ${value}
                }`,
            ];
            switch (dynamicKey) {
                case 'style':
                    result[exports.AttributeType.dynamicStyle][dynamicKey] = contextValue;
                    break;
                case 'class':
                    result[exports.AttributeType.dynamicClass][dynamicKey] = contextValue;
                    break;
                default:
                    result[exports.AttributeType.dynamicAttrubute][dynamicKey] =
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
        addListener(eventName, callback) {
            this.instructionParams.add('listener');
            let [fn, params = ''] = callback.replace(/[()]/g, ' ').split(' '), paramsToken = params
                .split(',')
                .slice(1)
                .map((param) => {
                let matchResult = param.match(/^'[^']+'|"[^"]+"$/);
                return matchResult ? param : `ctx.${param}`;
            })
                .join(',');
            console.log('event params', params);
            // 处理
            this.createFn += `
                        listener('${eventName}',function($event){
                                            return ctx['${fn}']($event,${paramsToken});
                                        }, ${this.index});`;
        }
    }

    /**
     * 嵌入视图，与 结构性指令相关，将结构性指令与主干view分割开
     */
    class TemplateEmbedded extends TemplateDynamic {
    }

    class formControl {
        constructor(config) {
            this.config = config;
        }
        bind(input, group) {
            this.group = group;
            this.input = input;
            this.input.value = this.config.value;
            input.addEventListener('input', () => {
                this.config.value = input.value;
                console.log('formGroupDirective绑定的input更改', input.value);
                this.group.change();
            });
        }
    }

    class formGroup {
        constructor(fromControls) {
            this.fromControls = fromControls;
            this.TView = TViewFns.currentTView();
        }
        get(name) {
            return this.fromControls[name];
        }
        change() {
            this.TView.update();
        }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    let formGroupDirective = class formGroupDirective {
        constructor(cd) {
            this.cd = cd;
            console.log('formGroup 实例化');
        }
        OnBind(native) {
            this.form = native;
        }
        OnInit() {
            this.inputs = this.form.elements;
            Array.from(this.inputs).forEach((input) => {
                const controlName = input.getAttribute('formControlName') || '', control = this.formGroup.get(controlName);
                if (control) {
                    control.bind(input, this);
                }
            });
        }
        change() {
            this.cd.detectChanges();
        }
    };
    __decorate([
        Input('formGroup'),
        __metadata("design:type", formGroup)
    ], formGroupDirective.prototype, "formGroup", void 0);
    formGroupDirective = __decorate([
        Directive({
            selector: '[formGroup]',
        }),
        __param(0, Inject(CheckDetectChange)),
        __metadata("design:paramtypes", [CheckDetectChange])
    ], formGroupDirective);

    exports.formsModule = class formsModule {
    };
    exports.formsModule = __decorate([
        Module({
            declarations: [formGroupDirective],
            exports: [],
        })
    ], exports.formsModule);

    /**
     * 平台提供依赖：
     *      编译template的函数，指令集view函数，平台class，依赖注入
     */
    const CORE_PROVIDES = [
        { provide: PlatformRef, deps: [Injector], useClass: PlatformRef },
        { provide: TemplateView, useValue: TemplateView },
        { provide: ViewContainer, useValue: ViewContainer },
        {
            provide: compiler,
            deps: [parseHtmlTemplate.parseTemplate, Instruction, TViewFns],
            useClass: compiler,
        },
        {
            provide: Instruction,
            deps: [],
            useClass: Instruction,
        },
        {
            provide: parseHtmlTemplate.parseTemplate,
            deps: [],
            useClass: parseHtmlTemplate.parseTemplate,
        },
        {
            provide: TViewFns,
            useValue: TViewFns,
        },
        { provide: Injector, deps: [], useClass: Injector },
        { provide: Application, deps: [], useClass: Application },
        { provide: CheckDetectChange, deps: [], useClass: CheckDetectChange },
    ];
    const PlatformCore = CORE_PROVIDES;

    /**
     * 浏览器平台提供依赖：
     *      render函数(DOM_API)
     */
    const Browser_Providers = [
        {
            provide: θd,
            useValue: θd,
        },
    ];
    /**
     *
     * @param extraProvides 插入的providers
     * @returns 平台实例
     */
    function PlatformBrowserDynamic(extraProvides = []) {
        let platFormProviders = collectRunDependency(PlatformCore, 'browser', Browser_Providers);
        let platFomrInjector = Injector.create(platFormProviders(extraProvides));
        let platformRef = createPlatform(platFomrInjector);
        window['platformRef'] = platformRef;
        return platformRef;
    }

    exports.Application = Application;
    exports.CheckDetectChange = CheckDetectChange;
    exports.Component = Component;
    exports.Directive = Directive;
    exports.EventChanges = EventChanges;
    exports.EventEmitter = EventEmitter;
    exports.EventKeys = EventKeys;
    exports.Hook = Hook;
    exports.Inject = Inject;
    exports.InjectToken = InjectToken;
    exports.InjectionToken = InjectionToken;
    exports.Injector = Injector;
    exports.Input = Input;
    exports.InputChanges = InputChanges;
    exports.InputKeys = InputKeys;
    exports.Instruction = Instruction;
    exports.LogicView = LogicView;
    exports.Module = Module;
    exports.Output = Output;
    exports.PlatformBrowserDynamic = PlatformBrowserDynamic;
    exports.PlatformRef = PlatformRef;
    exports.StaticInjector = StaticInjector;
    exports.TViewFns = TViewFns;
    exports.TemplateDirective = TemplateDirective;
    exports.TemplateDynamic = TemplateDynamic;
    exports.TemplateEmbedded = TemplateEmbedded;
    exports.TemplateView = TemplateView;
    exports.ViewChanges = ViewChanges;
    exports.ViewChild = ViewChild;
    exports.ViewContainer = ViewContainer;
    exports.ViewKeys = ViewKeys;
    exports.bootstrapView = bootstrapView;
    exports.collectRunDependency = collectRunDependency;
    exports.commentNode = commentNode;
    exports.compiler = compiler;
    exports.componentFromModule = componentFromModule;
    exports.createPlatform = createPlatform;
    exports.elementNode = elementNode;
    exports.embeddedView = embeddedView;
    exports.formControl = formControl;
    exports.formGroup = formGroup;
    exports.instructionIFrameStates = instructionIFrameStates;
    exports.offset = offset$1;
    exports.registerApplication = registerApplication;
    exports.resolveSelector = resolveSelector;
    exports.routeConfig = routeConfig;
    exports.textNode = textNode;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
