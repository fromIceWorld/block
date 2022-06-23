import { ConstructortInterface } from '../../../common/interface';
import { Hook } from '../../../lifeCycle/index';
import { TViewIndex } from '../../Enums/index';
import { TemplateDynamic } from '../template';
import { elementNode } from '../TNode/index';
import { TemplateView } from '../TView/TemplateView';

class TemplateDirective extends TemplateDynamic {
    constructor(
        tNode: elementNode,
        tView: TemplateView,
        dir: ConstructortInterface
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateDirective.prototype);
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Parent] = tView;
        this[TViewIndex.Class] = dir;
        this.injectProviders();
        this[TViewIndex.Context] = this.initContext();
    }
    attach() {
        this.createContext();
        Hook(
            this[TViewIndex.Context],
            'OnInit',
            this[TViewIndex.Parent]![this[TViewIndex.TNode]!.parent],
            this[TViewIndex.TNode]
        );
    }
    detach() {}
    reattach() {}
    OnInputChanges(): void {
        this.updateInput();
    }
    destroy() {}
}
export { TemplateDirective };
