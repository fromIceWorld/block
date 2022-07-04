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
    constructor(private index: number) {
        super();
        Object['setPrototypeOf'](this, viewContainer.prototype);
        let currentTView = TViewFns.currentTView(),
            currentLView = currentTView[TViewIndex.LView],
            tNode = currentTView[this.index + offset];
        this[TViewIndex.Host] = tNode.native = currentLView[index + offset];
        tNode.TView = this;
    }
    createEmbeddedView() {
        // let bindView = new Instruction();
        // bindView.createFunctionBody(this.treeNode);
    }
    diff(views) {
        for (
            let i = 0;
            i < Math.max(views.length, this.previousViewDefination!.length);
            i++
        ) {
            if (!this.previousViewDefination![i] && views[i]) {
                let [defination, context] = views[i],
                    embedded = new embeddedView(
                        defination,
                        context,
                        this[TViewIndex.Host].content
                    );
                this.childrenView?.push(embedded);
                embedded.attach();
            }
        }
        if (this.previousViewDefination!.length == 0) {
            this[TViewIndex.Host]!.after!(
                this[TViewIndex.Host]!.content.cloneNode(true)
            );
        }
        // let parent = document.createElement('embedded'),
        //     child = document.createTextNode('for');
        // parent.append(child);
        // this.AnchorPoint.content.append(parent);
        // let embeddedViews = [];
        // console.log(views);
        // views.forEach(([defination, context]) => {
        //     this.AnchorPoint.after(this.AnchorPoint.content.cloneNode(true));
        //     embeddedViews.push(new embeddedView(defination, context));
        // });
        // console.log(this.AnchorPoint);
    }
}

class embeddedView extends TemplateDynamic {
    TView: TemplateView = TViewFns.currentTView();
    constructor(
        private def: { attributes: any[]; template: Function },
        private context,
        host
    ) {
        super();
        Object['setPrototypeOf'](this, embeddedView.prototype);
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Host] = host;
    }
    $getDefinition() {
        return this.def;
    }
    contrast() {}
    attach() {
        TViewFns.pushContext(this);
        this[TViewIndex.Context] = { item: 12 };
        this.def.template(ViewMode.create, this[TViewIndex.Context]);
        console.log('embedded attach');
    }
    detectChanges() {
        console.log('embedded detectChanges');
    }
    inherit() {}
}
export { viewContainer, embeddedView };
