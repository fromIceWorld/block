const InputPlace = '$$_Input';
function Input(inputKey: string) {
    return function (target: { [key: string]: any }, localKey: string) {
        let inputObj = {
            inputKey,
            previousValue: undefined,
            firstChange: true,
            currentValue: undefined,
            valueChange: false,
        };
        if (!target[InputPlace]) {
            target[InputPlace] = Object.create({});
        }
        target[InputPlace][localKey] = inputObj;
    };
}
export { Input, InputPlace };
