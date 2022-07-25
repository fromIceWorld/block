import { EventEmitter } from '../../common/event/EventEmitter';
import { ConstructortInterface, ObjectInterface } from '../../common/interface';
import { InjectChanges, InjectKeys, InputKeys } from '../../decorators/index';
import { InputChanges } from '../../decorators/prop/Input';
import { EventChanges, EventKeys } from '../../decorators/prop/Output';
import { StaticInjector } from '../../Injector/index';
import { Hook } from '../../lifeCycle/index';
import { TViewIndex } from '../Enums/TView';
import { elementNode } from './TNode/index';
import { LogicView } from './TView/LogicView';
import { TemplateView } from './TView/TemplateView';

enum ViewMode {
    create = 1,
    update,
}
const offset = 20;

class TemplateDynamic extends Array {
    [TViewIndex.Host]?: Element | HTMLTemplateElement;
    [TViewIndex.RootElements]: number[] = [];
    [TViewIndex.TNode]?: elementNode;
    [TViewIndex.LView]?: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children]: number[] = [];
    [TViewIndex.Directives]: Set<number> = new Set();
    [TViewIndex.Class]?: ConstructortInterface;
    [TViewIndex.Context]: ObjectInterface<any> = {};
    [TViewIndex.ComponentDef]?: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]?: Object;
    [TViewIndex.Injector]?: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.InRange] = () => {
        return this[TViewIndex.Module] && this[TViewIndex.Module]['moduleCore']
            ? this[TViewIndex.Module]['moduleCore'].inRange || []
            : this[TViewIndex.Parent]![TViewIndex.InRange];
    };
    [TViewIndex.References]: ObjectInterface<number[]> = {};
    [TViewIndex.EmbeddedView]: Array<ObjectInterface<any>> = new Array();
    constructor() {
        super();
        Object.setPrototypeOf(this, TemplateDynamic.prototype);
    }
    injectProviders() {
        let providers =
            Object.getOwnPropertyDescriptor(this[TViewIndex.Class], 'providers')
                ?.value || [];
        this[TViewIndex.Injector] = new StaticInjector(providers);
    }
    /**
     * 处理 input 属性,新旧属性更新
     *
     */
    updateInput() {
        // 根节点无
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode as elementNode,
            inputKeys = this[TViewIndex.Class]!.prototype[InputKeys] || [],
            inputChanges = this[TViewIndex.Context][InputChanges];
        for (let [localKey, inputKey] of Object.entries(
            inputKeys as ObjectInterface<string>
        )) {
            let value = finAttributes[inputKey],
                firstChange = !inputChanges[localKey],
                currentValue = firstChange
                    ? undefined
                    : inputChanges[localKey]['currentValue'];
            inputChanges[localKey] = {
                inputKey,
                currentValue: value,
                previousValue: currentValue,
                firstChange,
            };
        }
        Hook(this[TViewIndex.Context], 'OnInputChanges', inputChanges);
    }
    // 处理output事件,将 EventEmitter,添加到 mid层，方便emit
    createOutput() {
        // 根节点无
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let host = this[TViewIndex.Host],
            outputKeys: ObjectInterface<string> =
                this[TViewIndex.Context][EventKeys] || [],
            outputEventObj = Object.create({});
        for (let [key, type] of Object.entries(outputKeys)) {
            outputEventObj[key] = {
                currentValue: new EventEmitter(type, {
                    detail: {
                        dom: host,
                    },
                }),
            };
        }
    }
    // 实例化依赖注入到mid
    InstanceInjects() {
        // 根节点无
        // if (!this[TViewIndex.TNode]) {
        //     return;
        // }
        const injectKeys = this[TViewIndex.Context][InjectKeys] || [],
            injectChanges = this[TViewIndex.Context][InjectChanges],
            injector = this[TViewIndex.Injector];
        for (let [key, provideToken] of Object.entries(injectKeys)) {
            injectChanges[key] = {
                currentValue: injector?.get(provideToken),
            };
        }
    }
    // 将context 与@Input，@Output，@Inject合并
    mergeContextAndDecorators() {
        let middleLayer = this[TViewIndex.Context],
            context = new this[TViewIndex.Class]!();
        Object.setPrototypeOf(context, middleLayer);
        for (let cache of Object.getOwnPropertySymbols(middleLayer)) {
            for (let [key, value] of Object.entries(
                middleLayer[cache] as ObjectInterface<any>
            )) {
                Object.defineProperty(context, key, {
                    get() {
                        return middleLayer[cache][key].currentValue;
                    },
                    set(v) {
                        throw Error(
                            `%c${key}是被@Input,@Output,@Inject修饰的数据,不可更改!`
                        );
                    },
                });
            }
        }
        this[TViewIndex.Context] = context;
    }
    /**
     * 初始化组件的上下文，建立一个中间层
     */
    initContext() {
        let tNode = this[TViewIndex.TNode],
            dir = this[TViewIndex.Class];
        return insertMiddleLayer(dir!);
    }
    /**
     * 合并初始化的context，@Input，@Output，@Inject。
     */
    createContext() {
        this.updateInput();
        this.createOutput();
        this.InstanceInjects();
        this.mergeContextAndDecorators();
    }
}
/**
 * 在context和 class之间建立一层中间层，存储input，output，inject数据
 *
 *
 * @param constructor 组件/指令的class
 * @param key
 */
function insertMiddleLayer(constructor: ObjectInterface<any>) {
    let upper = constructor.prototype,
        middle = Object.create(upper);
    middle[InputChanges] = Object.create({});
    middle[EventChanges] = Object.create({});
    middle[InjectChanges] = Object.create({});
    return middle;
}
export { TemplateDynamic, offset, ViewMode, insertMiddleLayer };
