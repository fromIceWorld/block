import {
    ConstructortInterface,
    ObjectInterface,
} from '../../../common/interface';
import { InputChanges } from '../../../decorators/index';
import { Hook } from '../../../index';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/TView';
import {
    TViewFns,
    ViewDefination,
} from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic, ViewMode } from '../template';
import { LogicView } from '../TView/LogicView';
import { TemplateView } from '../TView/TemplateView';

class ViewContainer extends TemplateDynamic {
    previousContext?: ViewDefination[] = [];
    childrenView: embeddedView | null[] = [];
    currentTView: TemplateView;
    constructor(
        private index: number,
        private def: ViewDefination,
        dir: ConstructortInterface
    ) {
        super();
        Object['setPrototypeOf'](this, ViewContainer.prototype);
        let currentTView = (this.currentTView = TViewFns.currentTView()),
            currentLView = currentTView[TViewIndex.LView];
        this[TViewIndex.Host] = currentLView[index + offset];
        this[TViewIndex.Class] = dir;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.TNode] = currentTView[index + offset];
        this[TViewIndex.TNode]!['TView'] = this;
        this[TViewIndex.Module] = dir.hasOwnProperty(componentFromModule)
            ? (dir as any)[componentFromModule]
            : null;
        this.injectProviders();
        this[TViewIndex.Context] = this.currentTView[TViewIndex.Context];
        this[TViewIndex.EmbeddedView] = this.initContext();
    }
    install() {
        this.updateInput(this[TViewIndex.EmbeddedView]);
        this.createOutput(this[TViewIndex.EmbeddedView]!);
        this.mergeContextAndDecorators(this[TViewIndex.EmbeddedView]!);
        this.update();
    }
    update() {
        TViewFns.pushContext(this);
        this.updateInput(this[TViewIndex.EmbeddedView]);
        let views = this[TViewIndex.EmbeddedView]!.OnInputChanges(
            this[TViewIndex.EmbeddedView]![InputChanges]
        );
        this.diff(
            views.map((context: ObjectInterface<any>) =>
                Object.setPrototypeOf(context, this[TViewIndex.Context])
            )
        );
        TViewFns.popContext();
    }
    diff(viewsContext: any[]) {
        for (
            let i = 0;
            i < Math.max(viewsContext.length, this.previousContext!.length);
            i++
        ) {
            if (!this.previousContext![i] && viewsContext[i]) {
                let embedded = new embeddedView(
                    this.def,
                    viewsContext[i],
                    this[TViewIndex.Host] as HTMLTemplateElement
                );
                embedded[TViewIndex.InRange] = this[TViewIndex.InRange];
                this.childrenView[i] = embedded;
                embedded.install();
                this.previousContext![i] = viewsContext[i];
                (this[TViewIndex.Host] as HTMLTemplateElement).after!(
                    ...Array.from(embedded[TViewIndex.Host]!.childNodes)
                );
                this.childrenView[i][TViewIndex.Context] = viewsContext[i];
            } else if (this.previousContext![i] && !viewsContext[i]) {
                this.childrenView![i].destroyed();
                this.previousContext?.splice(i, 1);
                this.childrenView![i][TViewIndex.RootElements].map(
                    (index: number) =>
                        this.childrenView![i][TViewIndex.LView]![
                            index + offset
                        ].remove()
                );
                this.childrenView[i] = {};
            } else if (this.previousContext![i] && viewsContext[i]) {
                // 更新embedded 的上下文
                this.childrenView[i][TViewIndex.Context] =
                    viewsContext[i] || {};
                this.childrenView![i].update();
            }
        }
    }
    destroyed() {
        Hook(this[TViewIndex.Context], 'OnDestroy');
        this.diff([]);
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
        this[TViewIndex.Host] = host; //ViewContainer
    }
    $getDefinition() {
        return this.def;
    }
    install() {
        const children = this[TViewIndex.Children];
        TViewFns.pushContext(this);
        this.def.template(ViewMode.install, this[TViewIndex.Context]);
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].install();
        }
        TViewFns.popContext();
    }
    update() {
        console.log('更新上下文', this[TViewIndex.Context]);
        TViewFns.pushContext(this);
        this.def.template(ViewMode.update, this[TViewIndex.Context]);
        const children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            // 嵌入视图的上下文作为中间人，承上启下
            tNode['TView'][TViewIndex.Context] = this[TViewIndex.Context];
            tNode['TView'].update();
        }
        TViewFns.popContext();
    }
    destroyed() {
        TViewFns.pushContext(this);
        const directives = this[TViewIndex.Directives],
            children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].destroyed();
        }
        TViewFns.popContext();
    }
}
export { ViewContainer, embeddedView };
