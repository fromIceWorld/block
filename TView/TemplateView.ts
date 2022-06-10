import { compiler } from '../@compiler/compile/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { TViewIndex } from '../Enums/index';
import { StaticInjector } from '../Injector/index';
import { componentFromModule } from '../platform/application';
import { LogicView } from './LogicView';
const offset = 20;

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
        host: Element | Array<Element> = [],
        parent?: TemplateView
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateView.prototype);
        this[TViewIndex.Class] = component;
        this[TViewIndex.Host] = host;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Parent] = parent;
        this[TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
            ? (component as any)[componentFromModule]
            : null;
        this[TViewIndex.Context] = new component!();
        this.createInjector();
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
    createInjector() {
        let providers =
            Object.getOwnPropertyDescriptor(this[TViewIndex.Class], 'providers')
                ?.value || [];
        this[TViewIndex.Injector] = new StaticInjector(providers);
    }
    attach() {
        TViewFns.pushContext(this);
        let def = this.$getDefinition();
        def.template(1, this[TViewIndex.Context]);
        let children = this[TViewIndex.Children];
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
