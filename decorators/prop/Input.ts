import { ObjectInterface } from '../../common/interface';
const InputKeys = Symbol('$$_@Input_Keys'),
    InputChanges = Symbol('$$_@Input_Changes');
function Input(inputKey: string) {
    return function (target: ObjectInterface<any>, localKey: string) {
        if (!target[InputKeys]) {
            target[InputKeys] = [];
        }
        target[InputKeys][localKey] = inputKey;
    };
}

export { Input, InputKeys, InputChanges };
