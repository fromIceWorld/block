import { compiler } from '../@compiler/compile/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { EventEmitter } from '../common/event/EventEmitter';
import { ObjectConstructor } from '../common/interface';
import { createDirectivesContext, InputCache } from '../decorators/Input';
import { EventPlace } from '../decorators/Output';
import { θd } from '../DocumentAPI/browser';
import { TViewIndex } from '../Enums/index';
import { StaticInjector } from '../Injector/index';
import { Hook } from '../lifeCycle/index';
import { componentFromModule } from '../platform/application';
import { elementNode } from '../TNode/index';
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
    [TViewIndex.Host]?: Element | DocumentFragment;
    [TViewIndex.RootElements] = new Array();
    [TViewIndex.LView]: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children] = new Array();
    [TViewIndex.Directives]: Set<number> = new Set();
    [TViewIndex.Class]?: ObjectConstructor;
    [TViewIndex.Context]: objInterface = {};
    [TViewIndex.ComponentDef]?: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]?: Object;
    [TViewIndex.Injector]?: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.InRange] = () => {
        return this[TViewIndex.Module]
            ? this[TViewIndex.Module]['moduleCore'].inRange
            : [];
    };
    constructor(
        component: ObjectConstructor,
        tNode?: elementNode,
        host = θd.createElement('template').content!,
        parent?: TemplateView
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateView.prototype);
        this[TViewIndex.Class] = component;
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Host] = host;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Parent] = parent;
        this[TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
            ? (component as any)[componentFromModule]
            : null;
        // this.createContext(component, tNode);
        this.handleOutput();
        this.createInjector();
    }
    /**
     * 创建组件的上下文，需要先初始化 @Input属性
     */
    createContext(component: ObjectConstructor, tNode?: elementNode) {
        if (!tNode) {
            this[TViewIndex.Context] = new component();
        } else {
            this[TViewIndex.Context] = createDirectivesContext(
                component,
                tNode
            );
        }
    }
    /**
     * 处理 input 属性
     */
    updateInput() {
        // 根节点无
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode,
            inventedObj = this[TViewIndex.Context][InputCache];
        for (let [localKey, localObj] of Object.entries(
            inventedObj as objInterface
        )) {
            let value = finAttributes[localObj.inputKey],
                { currentValue } = inventedObj[localKey];
            inventedObj[localKey]['previousValue'] = currentValue;
            inventedObj[localKey]['currentValue'] = value;
            localObj['firstChange'] = false;
        }
        Hook(
            this[TViewIndex.Context],
            'OnInputChanges',
            this[TViewIndex.Context][InputCache]
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
        this.createContext(this[TViewIndex.Class]!, this[TViewIndex.TNode]);
        TViewFns.pushContext(this);
        // Hook(this[TViewIndex.Context],'OnIputChanges', this[TViewIndex.Context][InputPlace]);
        Hook(this[TViewIndex.Context], 'OnInit');
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def.template(3, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotInit');
        this.HookDirectives('OnInserted');
        this.HookDirectives('OnInputChanges');
        this.HookDirectives('OnInit');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        Hook(this[TViewIndex.Context], 'OnViewInit');
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
    HookDirectives(hooks: string) {
        let nodeHasDirectives = this[TViewIndex.Directives];
        for (let nodeIndex of nodeHasDirectives) {
            let tNode = this[nodeIndex + offset],
                { directives, native } = tNode;
            for (let dirContext of directives) {
                Hook(dirContext, hooks, native, dirContext[InputCache]);
            }
        }
    }
    detectChanges(): void {
        this.updateInput();
        TViewFns.pushContext(this);
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def && def.template(2, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotChecked');
        // 指令的 [OnInputChanges]生命周期
        // attach阶段，触发指令 change生命周期
        this.HookDirectives('OnInputChanges');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        Hook(this[TViewIndex.Context], 'OnViewChecked');
        TViewFns.popContext();
    }
}

export { TemplateView };
