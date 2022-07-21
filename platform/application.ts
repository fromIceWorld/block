import { bootstrapView } from '../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { resolveSelector } from '../common/selector';
import {
    currentInjector,
    Injector,
    StaticInjector,
    StaticProvider,
} from '../Injector/index';

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
        let app = new Application(module);
        this.applications.add(app);
        if ($bootstrap.length > 0) {
            this.bootstrapComponent($bootstrap[0], app);
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
    constructor(module: any) {
        this.registerModule(module, this);
        module['moduleCore'] = this;
    }
    registerModule(module: any, root: Application) {
        let { $declarations, $imports, $exports, $providers, $bootstrap } =
            module;
        this.collectProvider(module, $providers);
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
        root.modules.set(module, {
            $declarations,
            $imports,
            $exports,
            $providers,
            $bootstrap,
        });
        for (let depModule of $imports) {
            let exports = this.registerModule(depModule, root);
            this.inRange = [...this.inRange, ...exports];
        }
        return $exports;
    }
    collectProvider(module: any, providers: any[]) {
        let parent = currentInjector;
        this.injector = new StaticInjector(providers, parent, `${module.name}`);
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
