import { ConstructortInterface } from '../../../common/interface';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/TView';
import {
    TViewFns,
    ViewDefination,
} from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic, ViewMode } from '../template';
import { LogicView } from '../TView/LogicView';
import { TemplateView } from '../TView/TemplateView';

let count = 0;
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
        this[TViewIndex.Context] = currentTView[TViewIndex.Context];
        this[TViewIndex.EmbeddedView].push(new dir());
    }
    createEmbeddedView() {
        // let bindView = new Instruction();
        // bindView.createFunctionBody(this.treeNode);
    }
    attach() {
        // TViewFns.pushContext(this);
        // this.createContext();
        // let views = this[TViewIndex.EmbeddedView].reduce((pre, cur) => {
        //     return cur.OnInputChanges(pre);
        // }, []);
        // this.diff(views);
        // TViewFns.popContext();
    }
    detectChanges() {
        TViewFns.pushContext(this);
        // this.updateInput();
        let views = this[TViewIndex.EmbeddedView].reduce((pre, cur) => {
            return cur.OnInputChanges(pre);
        }, []);
        this.diff(views);
        TViewFns.popContext();
    }
    diff(viewsContext: any[]) {
        console.log('viewContainer currentView', this.currentTView);
        for (
            let i = 0;
            i <
            Math.max(viewsContext.length, this.previousViewDefination!.length);
            i++
        ) {
            if (!this.previousViewDefination![i] && viewsContext[i]) {
                let context = viewsContext[i],
                    embedded = new embeddedView(
                        this.def,
                        Object.setPrototypeOf(
                            context,
                            this[TViewIndex.Context]
                        ),
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
        console.log('RootElements', rootElements);
        this[TViewIndex.Host]!.append(...rootElements);
        console.log('embedded attach', directives, children);
        TViewFns.popContext();
    }
    detectChanges() {
        TViewFns.pushContext(this);
        this.def.template(ViewMode.update, this[TViewIndex.Context]);
        const directives = this[TViewIndex.Directives],
            children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        console.log('embedded detectChanges', directives, children);
        TViewFns.popContext();
    }
}
export { viewContainer, embeddedView };
