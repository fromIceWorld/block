import { bootstrapView } from '../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { resolveSelector } from '../common/selector';
import { Injector, StaticInjector, StaticProvider } from '../Injector/index';
import { Route } from '../src/routerModule/Enums/route';
import { Router } from '../src/routerModule/router';

const componentFromModule = '$$_Bind_Module',
    moduleCore: string = '$$_Module_Core';
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
    applications: Set<Application> = new Set();
    constructor(injector: StaticInjector) {
        this.injector = injector;
    }
    /**
     *平台引导 module
     * @param module 根模块
     */
    bootstrapModule(module: any) {
        let { $bootstrap } = module;
        let app = new Application();
        app.registerModule(module);
        this.applications.add(app);
        if ($bootstrap.length > 0) {
            this.bootstrapComponent($bootstrap[0], app);
            // app['rootTView']?.detectChanges();
        }
    }
    bootstrapRoutes() {}
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
    routesTree: Map<string, Map<string, any>> = new Map();
    collectDeclarations(module: any) {
        let { $declarations = [], $imports } = module,
            partDeclarations = [...$declarations];
        for (let m of $imports) {
            partDeclarations.push(...this.collectDeclarations(m));
        }
        return partDeclarations;
    }
    bootstrapRouter() {
        new Router();
    }
    resolveRoutes(routes: Route[], pre: Map<string, any>) {
        if (!pre.has('children')) {
            pre.set('children', []);
        }
        for (let route of routes) {
            let { path, component, loadChildren, children = [] } = route,
                config = new Map();
            config.set('path', path);
            config.set('component', component);
            this.resolveRoutes(children, config);
            pre.get('children').push(config);
        }
        return pre;
    }
    registerModule(module: any) {
        let {
            $declarations = [],
            $imports = [],
            $exports = [],
            $providers = [],
            $bootstrap = [],
            $routes = [],
        } = module;
        module[moduleCore] = this;
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
        if ($routes) {
            let routesTree = this.resolveRoutes($routes, new Map());
            console.log(routesTree);
            this.bootstrapRouter();
        }
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
    moduleCore,
    componentFromModule,
};
