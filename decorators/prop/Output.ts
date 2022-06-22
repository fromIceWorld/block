import { ObjectInterface } from '../../common/interface';

const EventKeys = Symbol('$$_@Output_Keys'),
    EventChanges = Symbol('$$_@Output_Changes');
function Output(type: string) {
    return function (target: ObjectInterface<any>, key: string) {
        if (!target[EventKeys]) {
            target[EventKeys] = Object.create({});
        }
        target[EventKeys][key] = type;
    };
}
export { Output, EventKeys, EventChanges };
