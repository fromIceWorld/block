import { ObjectInterface } from '../../common/interface';
const InjectToken = Symbol('$$_@Inject_Token');
function Inject(param: any) {
    return function (
        target: ObjectInterface<any>,
        name: string | undefined,
        index: number
    ) {
        if (!target[InjectToken]) {
            target[InjectToken] = [];
        }
        target[InjectToken][index] = param;
    };
}
export { Inject, InjectToken };
