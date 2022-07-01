import { ConstructortInterface } from '../../../common/interface';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/TView';
import {
    TViewFns,
    ViewDefination,
} from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic } from '../template';
import { TemplateView } from '../TView/TemplateView';

class viewContainer extends TemplateDynamic {
    currentViewDefination?: ViewDefination[];
    previousViewDefination?: ViewDefination[];
    childrenView?: TemplateView[];
    constructor(
        private AnchorPoint: Element,
        private index: number,
        directive: ConstructortInterface,
        private context
    ) {
        super();
        Object['setPrototypeOf'](this, viewContainer.prototype);

        let attachTView = TViewFns.currentTView();
        this[TViewIndex.Class] = directive;
        this[TViewIndex.Context] = context;
        this[TViewIndex.TNode] = attachTView[index + offset];
        // this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Parent] = attachTView;
        this[TViewIndex.Module] = directive.hasOwnProperty(componentFromModule)
            ? (directive as any)[componentFromModule]
            : null;
        // this.injectProviders();
        // this[TViewIndex.Context] = this.initContext();
    }
    createEmbeddedView() {
        // let bindView = new Instruction();
        // bindView.createFunctionBody(this.treeNode);
    }
    diff(defs) {
        let parent = document.createElement('embedded'),
            child = document.createTextNode('for');
        parent.append(child);
        this.AnchorPoint.content.append(parent);
        let embeddedViews = [];
        console.log(defs);
        defs.forEach((def) => {
            this.AnchorPoint.after(this.AnchorPoint.content.cloneNode(true));
            embeddedViews.push(new embeddedView(def));
        });
    }
}

class embeddedView extends TemplateDynamic {
    TView: TemplateView = TViewFns.currentTView();
    constructor(private def: { attributes: any[]; template: Function }) {
        super();
        Object['setPrototypeOf'](this, embeddedView.prototype);
    }
    $getDefinition() {
        return this.def;
    }
    attach() {
        console.log('embedded attach');
    }
    detectChanges() {
        console.log('embedded detectChanges');
    }
    inherit() {}
}
export { viewContainer, embeddedView };
