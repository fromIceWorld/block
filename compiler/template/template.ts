import { EventEmitter } from '../../common/event/EventEmitter';
import { ConstructortInterface, ObjectInterface } from '../../common/interface';
import { InputKeys } from '../../decorators/index';
import { InjectToken } from '../../decorators/params/inject';
import {
    EventChanges,
    EventKeys,
    ViewChanges,
    ViewKeys,
} from '../../decorators/prop/index';
import { InputChanges } from '../../decorators/prop/Input';
import { StaticInjector } from '../../Injector/index';
import { registerApplication } from '../../platform/application';
import { TViewIndex } from '../Enums/TView';
import { elementNode } from './TNode/index';
import { LogicView } from './TView/LogicView';
import { TemplateView } from './TView/TemplateView';

enum ViewMode {
    create = 1,
    update,
    install,
    sleep,
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
        return this[TViewIndex.Module] &&
            this[TViewIndex.Module][registerApplication]
            ? this[TViewIndex.Module][registerApplication].inRange || []
            : this[TViewIndex.Parent]![TViewIndex.InRange]();
    };
    [TViewIndex.References]: ObjectInterface<number[]> = {};
    [TViewIndex.EmbeddedView]?: ObjectInterface<any>;
    [TViewIndex.Mode] = ViewMode.sleep;
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
    updateInput(ctx: any): Map<string, { value: any; currentValue: any }> {
        // 根节点无
        if (!this[TViewIndex.TNode]) {
            return new Map([['any', { currentValue: 'any', value: 'any' }]]);
        }
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode as elementNode,
            inputKeys = ctx![InputKeys] || [],
            inputChanges = ctx[InputChanges],
            conflict = new Map();
        for (let [localKey, inputKey] of Object.entries(
            inputKeys as ObjectInterface<string>
        )) {
            let value = finAttributes[inputKey] || ctx[inputKey],
                currentValue = inputChanges[localKey]
                    ? inputChanges[localKey]['currentValue']
                    : undefined;
            inputChanges[localKey] = {
                inputKey,
                currentValue: value,
                previousValue: currentValue,
            };
            if (value !== currentValue) {
                conflict.set(inputKey, { currentValue, value });
            }
        }
        return conflict;
    }
    // 处理output事件,将 EventEmitter,添加到 mid层，方便emit
    createOutput(ctx: ObjectInterface<any>) {
        // 根节点无
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let host = this[TViewIndex.Host],
            outputKeys: ObjectInterface<string> = ctx[EventKeys] || {},
            outputEventObj = (ctx[EventChanges] = Object.create({}));
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
    createViewChild(ctx: ObjectInterface<any>) {
        let viewKeys: ObjectInterface<string> = ctx[ViewKeys] || {},
            viewObj = (ctx[ViewChanges] = Object.create({}));
        for (let [local, tag] of Object.entries(viewKeys)) {
            viewObj[local] = {
                key: tag,
            };
        }
    }
    // TODO:不能遍历，使用者可能自定义Symbol数据
    // 将context 与@Input，@Output，@Inject合并
    mergeContextAndDecorators(ctx: ObjectInterface<any>) {
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
        ctx[InputChanges] = Object.create({});
        ctx[EventChanges] = Object.create({});
        ctx[InjectToken] = [];

        return ctx;
    }
}

export { TemplateDynamic, offset, ViewMode };
