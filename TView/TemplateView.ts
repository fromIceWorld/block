import { compiler } from '../@compiler/compile/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { TNode } from '../@compiler/instruction/instructionFn/interface/TNode';
import { EventEmitter } from '../common/event/EventEmitter';
import { InputPlace } from '../decorators/Input';
import { EventPlace } from '../decorators/Output';
import { θd } from '../DocumentAPI/browser';
import { TViewIndex } from '../Enums/index';
import { StaticInjector } from '../Injector/index';
import { componentFromModule } from '../platform/application';
import { LogicView } from './LogicView';
const offset = 20;

interface Changes {
    [key: string]: {
        inputKey: string;
        previousValue: any;
        firstChange: boolean;
        currentValue: any;
        valueChange: boolean;
    };
}
interface objInterface {
    [key: string]: any;
}
/**
 * 组件的模板视图，用以存储组件的元数据。
 *
 * @param component 组件
 * @param host 组件的宿主元素
 * @param parent 组件的父级级 TView
 */
class TemplateView extends Array {
    [TViewIndex.Host]?: Element;
    [TViewIndex.RootElements] = new Array();
    [TViewIndex.LView]: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children] = new Array();
    [TViewIndex.Class]?: Function;
    [TViewIndex.Context]: objInterface = {};
    [TViewIndex.ComponentDef]?: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]?: Object;
    [TViewIndex.Injector]?: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.Directives] = () => {
        return this[TViewIndex.Module]
            ? this[TViewIndex.Module]['moduleCore'].inRange
            : [];
    };
    constructor(
        component: { new (): any },
        tNode?: TNode,
        host: Element = θd.createElement('template'),
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
    /**
     * 处理 input属性, 建立__proto__
     * @param firstChange 是否是第一次处理输入属性
     */
    updateInput(firstChange: boolean) {
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode,
            inputValueskey =
                this[TViewIndex.Class]!.prototype[InputPlace] || {},
            context = firstChange
                ? Object.create(this[TViewIndex.Context])
                : this[TViewIndex.Context];
        for (let [localKey, localObj] of Object.entries(inputValueskey) as [
            string,
            any
        ]) {
            let value = finAttributes[localObj.inputKey];
            if (localObj['currentValue'] !== value) {
                localObj['previousValue'] = localObj['currentValue'];
                localObj['currentValue'] = value;
                localObj['valueChange'] = true;
                context[localKey] = value;
            }
            localObj['firstChange'] = firstChange;
        }
        if (firstChange) {
            this[TViewIndex.Context] = context;
        }
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
    $getDefinition: any = (() => {
        return () => {
            if (!this[TViewIndex.ComponentDef]) {
                const compilerInstance =
                    this[TViewIndex.Injector]!.get(compiler);
                console.log(compilerInstance);
                this[TViewIndex.ComponentDef] = compilerInstance.transform(
                    this[TViewIndex.Class]
                );
            }
            return this[TViewIndex.ComponentDef];
        };
    })();
    // 当前组件的依赖系统
    createInjector(): void {
        let providers =
            Object.getOwnPropertyDescriptor(this[TViewIndex.Class], 'providers')
                ?.value || [];
        this[TViewIndex.Injector] = new StaticInjector(providers);
    }
    attach(): void {
        this.updateInput(true);
        TViewFns.pushContext(this);
        // this.Hook('OnIputChanges', this[TViewIndex.Context][InputPlace]);
        this.Hook('OnInit');
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def.template(3, this[TViewIndex.Context]);
        this.Hook('OnSlotInit');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        this.Hook('OnViewInit');
        let rootElements = this[TViewIndex.RootElements].map(
            (index) => this[TViewIndex.LView][index + offset]
        );
        if ((this[TViewIndex.Host] as any).content) {
            (this[TViewIndex.Host] as any).content.append(...rootElements);
        } else {
            this[TViewIndex.Host]!.append(...rootElements);
        }
        TViewFns.popContext();
    }
    detectChanges(): void {
        this.updateInput(false);
        this.Hook('OnInputChanges', this[TViewIndex.Context][InputPlace]);
        TViewFns.pushContext(this);
        let def = this.$getDefinition();
        def && def.template(2, this[TViewIndex.Context]);
        this.Hook('OnSlotChecked');
        for (let child of this[TViewIndex.Children]) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        this.Hook('OnViewChecked');
        TViewFns.popContext();
    }
    Hook(lifeCycle: string, param?: any) {
        let context = this[TViewIndex.Context];
        if (context[lifeCycle]) {
            context[lifeCycle](param);
        }
    }
}

export { TemplateView };
