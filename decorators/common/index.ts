import { ObjectInterface } from '../../common/interface';
/**
 * 在context和 class之间建立一层中间层，存储input，output，inject数据
 *
 * @param constructor 组件/指令的class
 * @param key
 */
function insertMiddleLayer(constructor: ObjectInterface<any>, key: string) {
    let upper = constructor.prototype,
        middle = Object.create(upper);
    return middle;
}
