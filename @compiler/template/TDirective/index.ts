import { ConstructortInterface } from '../../../common/interface';
import {
    EventChanges,
    InjectChanges,
    InputChanges,
} from '../../../decorators/index';
import { TViewIndex } from '../../Enums/index';
import { TemplateDynamic } from '../template';
import { elementNode } from '../TNode/index';
import { TemplateView } from '../TView/TemplateView';

class TemplateDirective extends TemplateDynamic {
    constructor(
        private index: number,
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
        let midContext = Object.create(tView[TViewIndex.Context]);
        midContext[InputChanges] = Object.create({});
        midContext[EventChanges] = Object.create({});
        midContext[InjectChanges] = Object.create({});
        this[TViewIndex.Context] = midContext;
    }
    attach() {
        this.createContext();
    }
    detectChanges(): void {
        this.updateInput();
    }
    destroy() {}
}
export { TemplateDirective };
