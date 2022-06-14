const InputPlace = '$$_Input';
function Input(inputKey: string) {
    return function (target: Object, localKey: string) {
        (target as any)[InputPlace] = (target as any)[InputPlace]
            ? (target as any)[InputPlace].push({
                  localKey,
                  inputKey,
              })
            : [{ localKey, inputKey }];
    };
}
export { Input, InputPlace };
