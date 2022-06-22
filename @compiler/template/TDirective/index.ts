import { ConstructortInterface } from '../../../common/interface';
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
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Parent] = tView;
        this[TViewIndex.Class] = dir;
        this.injectProviders();
        this[TViewIndex.Context] = this.createContext();
        this.updateInput();
        this.createOutput();
        this.InstanceInjects();
        this.mergeContextAndDecorators();
    }
}
export { TemplateDirective };
