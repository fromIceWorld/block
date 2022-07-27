import { EventEmitter } from '../../common/event/EventEmitter';
import { ConstructortInterface, ObjectInterface } from '../../common/interface';
import { InjectChanges, InputKeys } from '../../decorators/index';
import { InjectToken } from '../../decorators/params/inject';
import { InputChanges } from '../../decorators/prop/Input';
import { EventChanges, EventKeys } from '../../decorators/prop/Output';
import { StaticInjector } from '../../Injector/index';
import { Hook } from '../../lifeCycle/index';
import { moduleCore } from '../../platform/application';
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
        return this[TViewIndex.Module] && this[TViewIndex.Module][moduleCore]
            ? this[TViewIndex.Module][moduleCore].inRange || []
            : this[TViewIndex.Parent]![TViewIndex.InRange];
    };
    [TViewIndex.References]: ObjectInterface<number[]> = {};
    [TViewIndex.EmbeddedView]?: ObjectInterface<any>;
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
            inputKeys = this[TViewIndex.Context]![InputKeys] || [],
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
    initDecoratorPropties() {
        let ctx = this[TViewIndex.Context];
        ctx[InputChanges] = Object.create({});
        ctx[EventChanges] = Object.create({});
        ctx[InjectToken] = [];
        ctx[InjectChanges] = Object.create({});
        this.updateInput();
        this.createOutput();
    }
    // 将context 与@Input，@Output，@Inject合并
    mergeContextAndDecorators() {
        let ctx = this[TViewIndex.Context];
        for (let cache of Object.getOwnPropertySymbols(ctx)) {
            for (let [key, value] of Object.entries(
                ctx[cache] as ObjectInterface<any>
            )) {
                Object.defineProperty(ctx, key, {
                    get() {
                        return ctx[cache][key].currentValue;
                    },
                    set(v) {
                        throw Error(
                            `%c${key}是被@Input,@Output,@Inject修饰的数据,不可更改!`
                        );
                    },
                });
            }
        }
    }
    /**
     * 实例化组件/指令
     */
    initContext() {
        let dir = this[TViewIndex.Class]!,
            tokens = dir[InjectToken] || [],
            providers = tokens.map((token: any) =>
                this[TViewIndex.Injector]?.get(token)
            ),
            ctx = new dir(...providers);
        this.initDecoratorPropties();
        this.mergeContextAndDecorators();
        return ctx;
    }
}

export { TemplateDynamic, offset, ViewMode };
