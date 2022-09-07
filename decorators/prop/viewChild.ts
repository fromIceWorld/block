import { ObjectInterface } from '../../common/interface';

const ViewKeys = Symbol('$$_@View_Keys'),
    ViewChanges = Symbol('$$_@View_Changes');
function ViewChild(tag: string) {
    return function (target: ObjectInterface<any>, key: string) {
        if (!target[ViewKeys]) {
            target[ViewKeys] = Object.create({});
        }
        target[ViewKeys][key] = tag;
    };
}
export { ViewChild, ViewKeys, ViewChanges };
