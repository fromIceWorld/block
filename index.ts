import { PlatformBrowserDynamic } from './platform/browser';
import { AppModule } from './src/appModule';
let platform = PlatformBrowserDynamic();
platform.bootstrapModule(AppModule);
document.body.append(root[0]);

class Block {
    moduleCapacity: Map<any, any[]> = new Map();
    registerRouterModule() {}
    registerModule(module) {
        if (this.moduleCapacity.has(module)) {
            throw Error(`重复注册模块!:${module}`);
        }
        let expansibility: any[] = [];
        const { $declarations = [], $imports = [], $routes = [] } = module;
        expansibility.push(...$declarations);
        for (let m of $imports) {
            expansibility.push(...this.polymerizeModule(m));
        }
        this.moduleCapacity.set(module, expansibility);
    }
    private polymerizeModule(module) {
        if (this.moduleCapacity.has(module)) {
            throw Error(`模块引用循环:${module}`);
        }
        const { $exports = [], $imports = [] } = module;
        let expansibility = [...$exports];
        for (let m of $imports) {
            expansibility = expansibility.concat(this.polymerizeModule(m));
        }
        this.moduleCapacity.set(module, expansibility);
        return expansibility;
    }
    bootstrap(htmlString: string) {}
}
