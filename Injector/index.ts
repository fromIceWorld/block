import { NullInjector, THROW_IF_NOT_FOUND } from './Null_Injector';
let currentInjector = new NullInjector();
interface Provider {
    provide: any;
    useValue?: any;
    useClass?: any;
    useFactory?: Function;
    deps?: any[];
    multi?: boolean;
}
interface ValueProvider extends Provider {
    useValue: any;
}
interface ClassProvider extends Provider {
    useClass: any;
    deps: Array<any>;
}
interface FactoryProvider extends Provider {
    useFactory: Function;
    deps: Array<any>;
}
interface standardProvider {
    token: any;
    useNew: boolean;
    fn: Function;
    value: any;
    deps: any[] | undefined;
}
type StaticProvider = ValueProvider | ClassProvider | FactoryProvider;

abstract class Injector {
    static THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
    abstract get(token: any, notFoundValue?: any): any;
    static create(
        providers: StaticProvider[],
        parent: Injector = currentInjector
    ) {
        let nextInjector = new StaticInjector(providers, parent);
        currentInjector = nextInjector;
        return nextInjector;
    }
    static θθpro() {
        return currentInjector;
    }
}
class StaticInjector {
    records = new Map<any, any>();
    _desc: string;
    constructor(
        provides: StaticProvider[],
        private parent: Injector = currentInjector,
        desc: string = ''
    ) {
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
    }
    get(token: any, notFoundValue?: any) {
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
    instanceOnlyProvider(record: standardProvider): any {
        let { token, useNew, fn, value, deps } = record;
        if (value) {
            return value;
        } else if (useNew && fn instanceof Function) {
            let params = new Array();
            deps &&
                deps.forEach((dep) => {
                    params.push(this.get(dep));
                });
            return (record.value = new (fn as any)(...params));
        } else {
            let error = `provider Error:${token} provider 格式错误`;
            throw error;
        }
    }
}
function resolveProvider(provider: StaticProvider): standardProvider {
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
    desc: string;
    constructor(desc: string) {
        this.desc = desc;
    }
}
export {
    Injector,
    StaticProvider,
    StaticInjector,
    InjectionToken,
    currentInjector,
};
