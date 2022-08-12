import { compiler } from '../../compile/index';

import { ConstructortInterface } from '../../../common/interface';
import { θd } from '../../../DocumentAPI/browser';
import { Hook } from '../../../lifeCycle/index';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/index';
import {
    instructionIFrameStates,
    TViewFns,
} from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic, ViewMode } from '../template';
import { elementNode } from '../TNode/index';
import { LogicView } from './LogicView';

/**
 * 组件的模板视图，用以存储组件的元数据。
 *
 * @param component 组件
 * @param host 组件的宿主元素
 * @param parent 组件的父级级 TView
 */
class TemplateView extends TemplateDynamic {
    constructor(
        component: ConstructortInterface,
        tNode?: elementNode,
        host = θd.createElement('template').content!
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateView.prototype);
        instructionIFrameStates.runningTView = this;
        this[TViewIndex.Class] = component;
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Host] = host as any;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
            ? (component as any)[componentFromModule]
            : null;
        this[TViewIndex.Parent] = TViewFns.currentTView();
        this.injectProviders();
        this[TViewIndex.Context] = this.initContext();
        this.updateInput(this[TViewIndex.Context]);
        this.createOutput(this[TViewIndex.Context]);
        this.mergeContextAndDecorators(this[TViewIndex.Context]);
        instructionIFrameStates.runningTView = null;
    }
    private $getDefinition: any = (() => {
        return () => {
            if (!this[TViewIndex.ComponentDef]) {
                const compilerInstance =
                    this[TViewIndex.Injector]!.get(compiler);
                this[TViewIndex.ComponentDef] = compilerInstance.transform(
                    this[TViewIndex.Class]
                );
            }
            return this[TViewIndex.ComponentDef];
        };
    })();
    attach(): void {
        TViewFns.pushContext(this);
        this.updateInput(this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnInit');
        const def = this.$getDefinition(),
            children: number[] = this[TViewIndex.Children];
        console.log('组件的数据集合：', def);
        def.template(ViewMode.create, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotInit');
        // 指令
        const nodeHasDirectiveIndex = this[TViewIndex.Directives];
        for (let index of nodeHasDirectiveIndex) {
            let tNode = this[index + offset];
            for (let dir of tNode.directives) {
                console.log(dir);
                // dir.attach();
            }
        }
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        Hook(this[TViewIndex.Context], 'OnViewInit');
        let rootElements = this[TViewIndex.RootElements].map(
            (index) => this[TViewIndex.LView]![index + offset]
        );
        this[TViewIndex.Host]!.append(...rootElements);
        TViewFns.popContext();
    }
    detectChanges(): void {
        TViewFns.pushContext(this);
        this.updateInput(this[TViewIndex.Context]);
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def && def.template(ViewMode.update, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotChecked');
        // 指令
        const nodeHasDirectiveIndex = this[TViewIndex.Directives];
        for (let index of nodeHasDirectiveIndex) {
            let tNode = this[index + offset];
            for (let dir of tNode.directives) {
                console.log(dir);
                Hook(dir, 'OnViewUpdateed', this);
            }
        }
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        Hook(this[TViewIndex.Context], 'OnViewChecked');
        TViewFns.popContext();
    }
    // Tview 不应该被展示，也不想被销毁时，可以进行休眠。
    sleep() {
        console.log('该去休眠了');
    }
    destroyed() {
        TViewFns.pushContext(this);
        let children = this[TViewIndex.Children];
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].destroyed();
        }
        Hook(this[TViewIndex.Context], 'OnDestroy');
        this[TViewIndex.Host]?.replaceChildren();
        TViewFns.popContext();
    }
}

export { TemplateView };
