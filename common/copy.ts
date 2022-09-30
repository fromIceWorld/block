import { ObjectInterface } from './interface';

let cache = new Map();
function copy(target: string | ObjectInterface<any> | number | Array<any>) {
    cache.clear();
    return copySwitch(target);
}
function copySwitch(
    target: string | ObjectInterface<any> | number | Array<any>
) {
    const type = {}.toString.call(target);
    switch (type) {
        case '[object Number]':
        case '[object String]':
            return target;
        case '[object Object]':
            return copyObject(target as ObjectInterface<any>);
        case '[object Array]':
            return copyArray(target as Array<any>);
    }
}
function copyObject(target: ObjectInterface<any>) {
    if (cache.has(target)) {
        return cache.get(target);
    }
    let result: ObjectInterface<any> = {};
    cache.set(target, result);
    Object.keys(target).forEach((key) => {
        result[key] = copySwitch(target[key]);
    });
    return result;
}
function copyArray(target: Array<any>) {
    if (cache.has(target)) {
        return cache.get(target);
    }
    let result = new Array();
    cache.set(target, result);
    for (let i = 0; i < target.length; i++) {
        result[i] = copySwitch(target[i]);
    }
    return result;
}
export { copy };
