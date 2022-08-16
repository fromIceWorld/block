/**
 * 属性选择器,id选择器,class选择器,节点选择器
 * @param selector
 *  [name="**"]       [name,'**']
 *  [arr]             [arr, undefined]
 *  #id               [id, id]
 *  .classNameme,     [class, classNameme]
 *  div               [div, null]
 *
 * @returns
 */
function resolveSelector(selector: string) {
    let kv: [string, string | null] = ['', null],
        pre = selector[0];
    if (pre == '#') {
        kv = ['id', selector.substring(1)];
    } else if (pre == '[') {
        let [key, value] = selector
            .substring(1, selector.length - 1)
            .split('=');
        // 处理 value "[name=angular]" 和 "[name = 'angular']" 一样
        if (value) {
            kv = [key.trim(), value.trim()];
        } else {
            kv = [key.trim(), null];
        }
    } else {
        kv = ['tagName', selector];
    }
    return kv;
}
export { resolveSelector };
