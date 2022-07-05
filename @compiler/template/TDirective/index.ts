import { ConstructortInterface } from '../../../common/interface';
import { InputChanges } from '../../../decorators/index';
import { Hook } from '../../../lifeCycle/index';
import { TViewIndex } from '../../Enums/index';
import { ViewDefination } from '../../instruction/InstructionContext/index';
import { TemplateDynamic } from '../template';
import { elementNode } from '../TNode/index';
import { TemplateView } from '../TView/TemplateView';

class TemplateDirective extends TemplateDynamic {
    constructor(
        private index: number,
        def: ViewDefination,
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
    transform() {}
    attach() {
        this.createContext();
        Hook(
            this[TViewIndex.Context],
            'OnInit',
            this[TViewIndex.TNode]!.parent == -1
                ? this[TViewIndex.Host]
                : this[TViewIndex.Parent]![this[TViewIndex.TNode]!.parent],
            this[TViewIndex.TNode]
        );
    }
    detach() {}
    reattach() {}
    detectChanges(): void {
        this.updateInput();
        Hook(
            this[TViewIndex.Context],
            'OnInputChanges',
            this[TViewIndex.Context][InputChanges]
        );
    }
    destroy() {}
}
export { TemplateDirective };
