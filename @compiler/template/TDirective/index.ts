import { ConstructortInterface } from '../../../common/interface';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/index';
import { TViewFns } from '../../instruction/InstructionContext/index';
import { TemplateDynamic } from '../template';
import { elementNode } from '../TNode/index';

class TemplateDirective extends TemplateDynamic {
    constructor(
        private index: number,
        dir: ConstructortInterface,
        native: Element,
        tNode: elementNode
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateDirective.prototype);
        this[TViewIndex.Class] = dir;
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Host] = native;
        this[TViewIndex.Module] = dir.hasOwnProperty(componentFromModule)
            ? (dir as any)[componentFromModule]
            : null;
        this[TViewIndex.Parent] = TViewFns.currentTView();
        this[TViewIndex.Class] = dir;
        this.injectProviders();
        this[TViewIndex.EmbeddedView] = this.initContext();
    }
    attach() {}
    detectChanges(): void {}
    destroy() {}
}
export { TemplateDirective };
