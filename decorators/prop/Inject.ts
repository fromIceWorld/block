import { ObjectInterface } from '../../common/interface';

const InjectKeys = Symbol('$$_@Inject_Keys'),
    InjectChanges = Symbol('$$_@Inject_Changes');
function Inject(injectToken: any) {
    return function (target: ObjectInterface<any>, key: string) {
        if (!target[InjectKeys]) {
            target[InjectKeys] = Object.create({});
        }
        target[InjectKeys][key] = injectToken;
    };
}
export { Inject, InjectKeys, InjectChanges };
