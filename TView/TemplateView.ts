import { compiler } from '../@compiler/compile/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { TNode } from '../@compiler/instruction/instructionFn/interface/TNode';
import { EventEmitter } from '../common/event/EventEmitter';
import { InputPlace } from '../decorators/Input';
import { EventPlace } from '../decorators/Output';
import { TViewIndex } from '../Enums/index';
import { StaticInjector } from '../Injector/index';
import { componentFromModule } from '../platform/application';
import { LogicView } from './LogicView';
const offset = 20;

/**
 * 组件的模板视图，用以存储组件的元数据。
 *
 * @param component 组件
 * @param host 组件的宿主元素
 * @param parent 组件的父级级 TView
 */
class TemplateView extends Array {
    [TViewIndex.Host]: Element | Array<Element>;
    [TViewIndex.RootElements] = new Array();
    [TViewIndex.LView]: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children] = new Array();
    [TViewIndex.Class]?: Function;
    [TViewIndex.Context] = {};
    [TViewIndex.ComponentDef]: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]: Object;
    [TViewIndex.Injector]: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.Directives] = () => {
        return this[TViewIndex.Module]
            ? this[TViewIndex.Module]['moduleCore'].inRange
            : [];
    };
    constructor(
        component: { new (): any },
        tNode?: TNode,
        host: Element | Array<Element> = [],
        parent?: TemplateView
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateView.prototype);
        this[TViewIndex.Class] = component;
        this[TViewIndex.TNode] = tNode || {};
        this[TViewIndex.Host] = host;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Parent] = parent;
        this[TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
            ? (component as any)[componentFromModule]
            : null;
        this[TViewIndex.Context] = new component!();
        this.handleOutput();
        this.createInjector();
    }
    // 处理 inout属性
    handleInput() {
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode,
            inputValueskey =
                this[TViewIndex.Class]!.prototype[InputPlace] || [],
            inputObj = Object.create({});
        for (let obj of inputValueskey) {
            let { localKey, inputKey } = obj;
            inputObj[localKey] = finAttributes[inputKey];
        }
        this[TViewIndex.Context] = Object.assign(
            this[TViewIndex.Context],
            inputObj
        );
    }
    // 处理output事件
    handleOutput() {
        let host = this[TViewIndex.Host],
            outputEventskey =
                this[TViewIndex.Class]!.prototype[EventPlace] || [],
            outputEventObj = Object.create({});
        for (let event of outputEventskey) {
            let { type, key } = event;
            outputEventObj[key] = new EventEmitter(type, {
                detail: {
                    dom: host,
                },
            });
        }
        this[TViewIndex.Context] = Object.assign(
            this[TViewIndex.Context],
            outputEventObj
        );
    }
    $getDefinition = (() => {
        return () => {
            if (!this[TViewIndex.ComponentDef]) {
                const compilerInstance =
                    this[TViewIndex.Injector].get(compiler);
                console.log(compilerInstance);
                this[TViewIndex.ComponentDef] = compilerInstance.transform(
                    this[TViewIndex.Class]
                );
            }
            return this[TViewIndex.ComponentDef];
        };
    })();
    // 当前组件的依赖系统
    createInjector() {
        let providers =
            Object.getOwnPropertyDescriptor(this[TViewIndex.Class], 'providers')
                ?.value || [];
        this[TViewIndex.Injector] = new StaticInjector(providers);
    }
    attach() {
        this.handleInput();
        TViewFns.pushContext(this);
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def.template(3, this[TViewIndex.Context]);
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        if (!Array.isArray(this[TViewIndex.Host])) {
            (this[TViewIndex.Host] as Element).append(
                ...this[TViewIndex.RootElements]
            );
        } else {
            this[TViewIndex.Host] = [...this[TViewIndex.RootElements]];
        }
        TViewFns.popContext();
    }
    detectChanges() {
        this.handleInput();
        TViewFns.pushContext(this);
        let def = this.$getDefinition();
        def && def.template(2, this[TViewIndex.Context]);
        for (let child of this[TViewIndex.Children]) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        TViewFns.popContext();
    }
}

export { TemplateView };
