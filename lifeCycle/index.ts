import { ObjectInterface } from '../common/interface';

/**
 *
 * @param dir 组件/指令的context
 * @param hookName 钩子名称
 * @param params 任意参数
 */
function Hook(
    context: ObjectInterface<any>,
    hookName: string,
    ...params: any[]
) {
    if ({}.toString.call(context[hookName]) == '[object Function]') {
        context[hookName](...params);
    }
}
export { Hook };
