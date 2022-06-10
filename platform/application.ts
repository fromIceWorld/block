import { bootstrapView } from '../@compiler/instruction/InstructionContext/index';
import {
    currentInjector,
    Injector,
    StaticInjector,
    StaticProvider,
} from '../Injector/index';

const componentFromModule = '$$_Bind_Module',
    moduleCore: string = '$$_Module_Core';
/**
 * 平台是顶级作用域，创建应用，
 * 其下注册模块，
 * 模块下的组件构成视图
 *
 * @param injector 平台依赖注入
 */
class PlatformRef {
    injector;
    registeredModules?: moduleCollection;
    rootModules = new Map();
    constructor(injector: StaticInjector) {
        this.injector = injector;
    }
    bootstrapModule(module: any) {
        let { $bootstrap } = module;
        this.registeredModules = new moduleCollection(module);
        let moduleRef = new module();
        this.rootModules.set(module, moduleRef);
        if ($bootstrap.length > 0) {
            this.bootstrapComponent(
                $bootstrap[0],
                this.rootModules.get(module)
            );
        }
    }
    /**
     *平台调用 视图部分API，将组件挂载到view上
     *
     * @param rootComponent 启动的根组件
     */
    bootstrapComponent(rootComponent: { new (): any }, module: any) {
        let rootTView = bootstrapView(rootComponent, module);
        module['TView'] = rootTView;
    }
    getExternalDeclarations(importModules: Array<any>) {
        let exportDeclarations = new Array();
        for (let module of importModules) {
            let { $imports, $exports } = module;
            exportDeclarations = exportDeclarations.concat(
                $exports,
                this.getExternalDeclarations($imports)
            );
        }
        return exportDeclarations;
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
 */
class moduleCollection {
    modules: Map<any, any> = new Map();
    injector?: Injector;
    inRange: Array<any> = [];
    constructor(module: any) {
        this.registerModule(module, this);
        module['moduleCore'] = this;
    }
    registerModule(module: any, root: moduleCollection) {
        let { $declarations, $imports, $exports, $providers, $bootstrap } =
            module;
        this.collectProvider(module, $providers);
        for (let declaration of $declarations) {
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
function polyModule(module: any) {
    let { $declarations, $imports, $exports, $providers, $bootstrap } = module;
    let root = new moduleCollection(module);
}
function createPlatform(injector: Injector) {
    return injector.get(PlatformRef);
}

class Application {}
export {
    PlatformRef,
    collectRunDependency,
    createPlatform,
    moduleCore,
    componentFromModule,
};
