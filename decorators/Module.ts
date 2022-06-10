interface ModuleParams {
    declarations: Array<any>;
    imports: Array<any>;
    exports: Array<any>;
    providers: Array<any>;
    bootstrap: Array<any>;
}
function Module(params: ModuleParams): Function {
    let { declarations, imports, exports, providers, bootstrap } = params;
    return function (target: any) {
        target.$declarations = declarations;
        target.$imports = imports;
        target.$exports = exports;
        target.$providers = providers;
        target.$bootstrap = bootstrap;
        return target;
    };
}
export { Module };
