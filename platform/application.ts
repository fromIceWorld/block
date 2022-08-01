import { bootstrapView } from '../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { resolveSelector } from '../common/selector';
import { Injector, StaticInjector, StaticProvider } from '../Injector/index';
import { Route } from '../src/routerModule/Enums/route';

const componentFromModule = '$$_Bind_Module',
    registerApplication: string = '$$_Register_Application',
    routeConfig = '$$_Route_Config';
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
    injector;
    application: Application;
    constructor(injector: StaticInjector) {
        this.injector = injector;
        this.application = this.injector.get(Application);
    }
    /**
     *平台引导 module
     * @param module 根模块
     */
    bootstrapModule(module: any) {
        let { $bootstrap, $routes } = module;
        if ($bootstrap.length > 0) {
            this.application.registerModule(module);
            if ($routes) {
                this.application.registerRoutes(module);
            }
            this.bootstrapComponent($bootstrap[0], this.application);
            // app['rootTView']?.detectChanges();
        }
    }
    /**
     *平台调用 视图部分API，将组件挂载到view上
     *
     * @param rootComponent 启动的根组件
     */
    bootstrapComponent(rootComponent: { new (): any }, app: Application) {
        let rootTView = bootstrapView(rootComponent);
        app['rootTView'] = rootTView;
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
    modules: Map<any, any> = new Map();
    injector?: Injector;
    inRange: Array<any> = [];
    rootTView?: TemplateView;
    routesTree: Map<RegExp, Map<RegExp, any>> = new Map();
    routesStack: any[] = [this.routesTree];
    currentRouteBranch: Map<RegExp, Map<RegExp, any>> = this.routesTree;
    collectDeclarations(module: any) {
        let { $declarations = [], $imports } = module,
            partDeclarations = [...$declarations];
        for (let m of $imports) {
            partDeclarations.push(...this.collectDeclarations(m));
        }
        return partDeclarations;
    }
    resolveRoutes(
        routes: Route[],
        parent: Map<RegExp, any>,
        preRegExp: string[]
    ) {
        for (let route of routes) {
            let { path, component, loadChildren, children = [] } = route,
                next = new Map();
            let paths = path.split('/'),
                resolved = [],
                pathRegExp: RegExp;
            for (let p of paths) {
                if (p.startsWith(':')) {
                    resolved.push('([^/]+)');
                } else {
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
    registerRoutes(module: any) {
        let { $routes } = module;
        this.resolveRoutes($routes, this.routesTree, ['']);
        this.currentRouteBranch = this.routesTree;
        console.log('解析后的route树：', this.routesTree);
    }
    registerModule(module: any) {
        let {
            $declarations = [],
            $imports = [],
            $exports = [],
            $providers = [],
            $bootstrap = [],
        } = module;
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
    collectAndRegisterProvider(module: any) {
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
function collectRunDependency(
    parentPlatformProviders: StaticProvider[],
    name: string,
    providers: StaticProvider[]
): (extraProvides?: StaticProvider[]) => StaticProvider[] {
    let allProviders = parentPlatformProviders.concat(providers);
    return (extraProvides = []) => {
        return allProviders.concat(extraProvides);
    };
}
function createPlatform(injector: Injector) {
    return injector.get(PlatformRef);
}

export {
    PlatformRef,
    collectRunDependency,
    createPlatform,
    Application,
    componentFromModule,
    registerApplication,
    routeConfig,
};
