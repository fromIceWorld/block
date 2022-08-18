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
        this.injectProviders();
        this[TViewIndex.Context] = this.initContext();
    }
    install() {
        this.updateInput(this[TViewIndex.Context]);
        this.createOutput(this[TViewIndex.Context]);
        this.mergeContextAndDecorators(this[TViewIndex.Context]);
    }
    update(): void {
        const conflict = this.updateInput(this[TViewIndex.Context]);
    }
    destroy() {}
}
export { TemplateDirective };
