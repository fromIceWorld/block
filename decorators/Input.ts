import { ObjectConstructor, ObjectInterface } from '../common/interface';
import { elementNode } from '../TNode/index';
const InputPlace = '$$_Input',
    InputCache = '$$_InputCache';
function Input(inputKey: string) {
    return function (target: { [key: string]: any }, localKey: string) {
        if (!target[InputPlace]) {
            target[InputPlace] = Object.create({});
        }
        target[InputPlace][localKey] = inputKey;
    };
}
function createDirectivesContext(
    dir: ObjectConstructor,
    tNode?: elementNode
): ObjectInterface<any> {
    if (!tNode) {
        return {};
    }
    let { finAttributes } = tNode || {},
        { prototype, inputCache } = createInventedInput(dir),
        inpuObj = dir.prototype[InputPlace] || {},
        context;
    for (let [localKey, inputKey] of Object.entries(
        inpuObj as { [key: string]: string }
    )) {
        let value = finAttributes![inputKey];
        inputCache[localKey] = {
            inputKey,
            previousValue: null,
            currentValue: value,
            firstChange: true,
        };
        prototype[localKey] = value;
    }
    context = new dir();
    for (let key of Object.keys(inputCache)) {
        Object.defineProperty(context, key, {
            get() {
                return inputCache[key].currentValue;
            },
            set(value) {
                console.error(`%c${key}是被@Input修饰的数据,不可更改!`);
            },
        });
        delete prototype[key];
    }
    return context;
}
function createInventedInput(
    component: ObjectConstructor
): ObjectInterface<any> {
    let prototype = component.prototype,
        inputCache: ObjectInterface<any> = Object.create({});
    prototype[InputCache] = inputCache;
    return { prototype, inputCache };
}
export {
    Input,
    InputPlace,
    createInventedInput,
    createDirectivesContext,
    InputCache,
};
