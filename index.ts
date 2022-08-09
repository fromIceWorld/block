import { TemplateView } from './@compiler/template/TView/TemplateView';
import { AppModule } from './src/appModule';
import { Route } from './src/routerModule/Enums/route';
// let platform = PlatformBrowserDynamic();
// platform.bootstrapModule(AppModule);
// document.body.append(root[0]);

class Block {
    moduleCapacity: Map<any, any[]> = new Map();
    routes: Route[] = [];
    registerRouterModule(routes) {
        this.routes = routes;
    }
    registerModule(module): void {
        if (this.moduleCapacity.has(module)) {
            throw Error(`重复注册模块!:${module}`);
        }
        let expansibility: any[] = [];
        const {
            $declarations = [],
            $imports = [],
            $routes = [],
            $bootstrap,
        } = module;
        expansibility.push(...$declarations);
        for (let m of $imports) {
            expansibility.push(...this.polymerizeModule(m));
        }
        this.moduleCapacity.set(module, expansibility);
    }
    private polymerizeModule(module): any[] {
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
    bootstrapModule(module) {
        const { $bootstrap } = module;
        this.registerModule(module);
        let view = new TemplateView($bootstrap, , ,this.moduleCapacity.get(module))
    }
}
let app = new Block();
app.bootstrapModule(AppModule);

console.log(app);
