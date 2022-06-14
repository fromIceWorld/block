const EventPlace = '$$_Output';
function Output(type: string) {
    return function (target: Object, key: string) {
        (target as any)[EventPlace] = (target as any)[EventPlace]
            ? (target as any)[EventPlace].push({
                  key,
                  type,
              })
            : [{ key, type }];
    };
}
export { Output, EventPlace };
