/**
 * 属性选择器,id选择器,class选择器,节点选择器
 * @param selector [name="**"], #id, .classNameme, div
 * @returns
 */
function resolveSelector(selector: string) {
    let kv: [string, string | null] = ['', null];
    let pre = selector[0];
    if (pre == '#') {
        kv = ['id', selector.substring(1)];
    } else if (pre == '.') {
        kv = ['class', selector.substring(1)];
    } else if (pre == '[') {
        let [key, value] = selector
            .substring(1, selector.length - 1)
            .split('=');
        // 处理 value "[name=angular]" 和 "[name = 'angular']" 一样
        if (value) {
            kv = [key.trim(), value.replace(/['"]/g, '').trim()];
        } else {
            kv = [key.trim(), ''];
        }
    } else {
        kv = [selector, null];
    }
    return kv;
}
export { resolveSelector };
