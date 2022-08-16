import { ConstructortInterface } from '../../../common/interface';
import { Hook } from '../../../index';
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
        this.updateInput(this[TViewIndex.Context]);
        this.createOutput(this[TViewIndex.Context]);
        this.mergeContextAndDecorators(this[TViewIndex.Context]);
    }
    attach() {
        Hook(this[TViewIndex.Context], 'OnInit');
    }
    detectChanges(): void {}
    destroy() {}
}
export { TemplateDirective };
