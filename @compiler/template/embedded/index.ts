import { ConstructortInterface } from '../../../common/interface';
import {
    EventChanges,
    InjectChanges,
    InputChanges,
    InputKeys,
} from '../../../decorators/index';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/TView';
import {
    TViewFns,
    ViewDefination,
} from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic, ViewMode } from '../template';
import { elementNode } from '../TNode/index';
import { LogicView } from '../TView/LogicView';
import { TemplateView } from '../TView/TemplateView';

class viewContainer extends TemplateDynamic {
    currentViewDefination?: ViewDefination[];
    previousViewDefination?: ViewDefination[] = [];
    childrenView: embeddedView[] = [];
    currentTView: TemplateView;
    constructor(
        private index: number,
        private def: ViewDefination,
        dir: ConstructortInterface
    ) {
        super();
        Object['setPrototypeOf'](this, viewContainer.prototype);
        let currentTView = (this.currentTView = TViewFns.currentTView()),
            currentLView = currentTView[TViewIndex.LView];
        this[TViewIndex.Host] = currentLView[index + offset];

        this[TViewIndex.Class] = dir;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.TNode] = currentTView[index + offset];
        this[TViewIndex.TNode]['TView'] = this;
        this[TViewIndex.Module] = dir.hasOwnProperty(componentFromModule)
            ? (dir as any)[componentFromModule]
            : null;
        this.injectProviders();
        this.createDirectiveContext();
        this[TViewIndex.EmbeddedView].push(new dir());
    }
    createDirectiveContext(): void {
        let midContext = Object.create(this.currentTView[TViewIndex.Context]);
        midContext[InputChanges] = Object.create({});
        midContext[EventChanges] = Object.create({});
        midContext[InjectChanges] = Object.create({});
        this[TViewIndex.Context] = midContext;
    }
    attach() {
        TViewFns.pushContext(this);
        TViewFns.popContext();
    }
    detectChanges() {
        TViewFns.pushContext(this);
        this.updateInput();
        let directiveIns = this[TViewIndex.EmbeddedView][0];
        let { finAttributes } = this[TViewIndex.TNode] as elementNode;
        // 更新
        Object.entries(this[TViewIndex.Class]!.prototype[InputKeys]).forEach(
            ([key, value]) => {
                let nextValue = finAttributes[value];
                if (nextValue !== undefined) {
                    directiveIns[key] = nextValue;
                }
            }
        );
        let views = directiveIns.OnInputChanges(
            this[TViewIndex.Context][InputChanges]
        );
        this.diff(
            views.map((context) =>
                Object.setPrototypeOf(context, this[TViewIndex.Context])
            )
        );
        TViewFns.popContext();
    }
    diff(viewsContext: any[]) {
        for (
            let i = 0;
            i <
            Math.max(viewsContext.length, this.previousViewDefination!.length);
            i++
        ) {
            if (!this.previousViewDefination![i] && viewsContext[i]) {
                let embedded = new embeddedView(
                    this.def,
                    viewsContext[i],
                    this[TViewIndex.Host] as HTMLTemplateElement
                );
                embedded[TViewIndex.InRange] = this[TViewIndex.InRange];
                this.childrenView.push(embedded);
                embedded.attach();
                embedded.detectChanges();
            }
        }
        if (this.previousViewDefination!.length == 0) {
            this.childrenView.forEach((embeddedView) => {
                (this[TViewIndex.Host] as HTMLTemplateElement).after!(
                    ...Array.from(embeddedView[TViewIndex.Host].childNodes)
                );
            });
        }
    }
}

class embeddedView extends TemplateDynamic {
    TView: TemplateView = TViewFns.currentTView();
    constructor(
        private def: { attributes: any[]; template: Function },
        context: any,
        host: HTMLTemplateElement
    ) {
        super();
        Object['setPrototypeOf'](this, embeddedView.prototype);
        this[TViewIndex.Context] = context;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Host] = host; //viewContainer
    }
    $getDefinition() {
        return this.def;
    }
    attach() {
        TViewFns.pushContext(this);
        this.def.template(ViewMode.create, this[TViewIndex.Context]);
        const directives = this[TViewIndex.Directives],
            children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        let rootElements = this[TViewIndex.RootElements].map(
            (index) => this[TViewIndex.LView]![index + offset]
        );
        this[TViewIndex.Host]!.append(...rootElements);
        TViewFns.popContext();
    }
    detectChanges() {
        TViewFns.pushContext(this);
        this.updateInput();
        this.def.template(ViewMode.update, this[TViewIndex.Context]);
        const directives = this[TViewIndex.Directives],
            children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        TViewFns.popContext();
    }
}
export { viewContainer, embeddedView };
