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

class viewContainer extends TemplateDynamic {
    currentViewDefination?: ViewDefination[];
    previousViewDefination?: ViewDefination[] = [];
    childrenView?: embeddedView[];
    constructor(
        private index: number,
        private def: ViewDefination,
        dir: ConstructortInterface
    ) {
        super();
        Object['setPrototypeOf'](this, viewContainer.prototype);
        let currentTView = TViewFns.currentTView(),
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
        this[TViewIndex.Context] = Object.assign(
            {},
            currentTView[TViewIndex.Context],
            this.initContext()
        );
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
        this.updateInput();
        let views = this[TViewIndex.EmbeddedView].reduce((pre, cur) => {
            return cur.OnInputChanges(pre);
        }, []);
        this.diff(views);
        TViewFns.popContext();
    }
    diff(views: any[]) {
        for (
            let i = 0;
            i < Math.max(views.length, this.previousViewDefination!.length);
            i++
        ) {
            if (!this.previousViewDefination![i] && views[i]) {
                let context = views[i],
                    embedded = new embeddedView(
                        this.def,
                        Object.setPrototypeOf(
                            context,
                            this[TViewIndex.Context]
                        ),
                        (this[TViewIndex.Host] as HTMLTemplateElement).content
                    );
                this.childrenView?.push(embedded);
                embedded.attach();
                embedded.detectChanges();
            }
        }
        if (this.previousViewDefination!.length == 0) {
            (this[TViewIndex.Host] as HTMLTemplateElement).after!(
                (
                    this[TViewIndex.Host] as HTMLTemplateElement
                ).content.cloneNode(true)
            );
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
        this[TViewIndex.Host] = host;
    }
    $getDefinition() {
        return this.def;
    }
    contrast() {}
    attach() {
        TViewFns.pushContext(this);
        this.def.template(ViewMode.create, this[TViewIndex.Context]);
        console.log('embedded attach');
        TViewFns.popContext();
    }
    detectChanges() {
        TViewFns.pushContext(this);
        this.def.template(ViewMode.update, this[TViewIndex.Context]);
        console.log('embedded detectChanges');
        TViewFns.popContext();
    }
    inherit() {}
}
export { viewContainer, embeddedView };
