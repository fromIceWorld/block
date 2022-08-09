import { TemplateView } from './@compiler/template/TView/TemplateView';
import { AppModule } from './src/appModule';
import { Route } from './src/routerModule/Enums/route';
import { StaticInjector, StaticProvider, Injector } from './Injector/index';
import { PlatformRef, Application } from './platform/index';
import { ViewContainer } from './@compiler/template/embedded/index';
import { compiler } from './@compiler/compile/index';
import { parseTemplate } from 'parse-html-template';
import { Instruction } from './@compiler/instruction/index';
import { TViewFns } from './@compiler/instruction/InstructionContext/index';
// let platform = PlatformBrowserDynamic();
// platform.bootstrapModule(AppModule);
// document.body.append(root[0]);

const render = Symbol('$$Render')
class Block {
    moduleCapacity: Map<any, any[]> = new Map();
    routes: Route[] = [];
    applicationInjector:StaticInjector
    constructor(private providers:StaticProvider[] = []){
        this.applicationInjector = new StaticInjector(providers)
    }
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
        const { $bootstrap,$providers } = module;
        this.registerModule(module);
        const injector = new StaticInjector($providers);
        let view = new TemplateView($bootstrap[0], , ,this.moduleCapacity.get(module))
        window['view'] = view
    }
}
let app = new Block([
    { provide: PlatformRef, deps: [Injector], useClass: PlatformRef },
    { provide: TemplateView, useValue: TemplateView },
    { provide: ViewContainer, useValue: ViewContainer },
    {
        provide: compiler,
        deps: [parseTemplate, Instruction, TViewFns],
        useClass: compiler,
    },
    {
        provide: Instruction,
        deps: [],
        useClass: Instruction,
    },
    {
        provide: parseTemplate,
        deps: [],
        useClass: parseTemplate,
    },
    {
        provide: TViewFns,
        useValue: TViewFns,
    },
    { provide: Injector, deps: [], useClass: Injector },
]);
app.bootstrapModule(AppModule);

console.log(app);
