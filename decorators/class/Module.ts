import { Route } from '../../src/routerModule/Enums/route';

interface ModuleParams {
    declarations?: Array<any>;
    imports?: Array<any>;
    exports?: Array<any>;
    providers?: Array<any>;
    bootstrap?: Array<any>;
    routes?: Array<Route>;
}
function Module(params: ModuleParams): Function {
    let { declarations, imports, exports, providers, bootstrap, routes } =
        params;
    return function (target: any) {
        target.$declarations = declarations;
        target.$imports = imports;
        target.$exports = exports;
        target.$providers = providers;
        target.$bootstrap = bootstrap;
        target.$routes = routes;
        return target;
    };
}
export { Module };
