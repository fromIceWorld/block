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
    install() {
        this[TViewIndex.Mode] = ViewMode.install;
        this.updateInput(this[TViewIndex.Context]); // 初始化 @Input
        this.createOutput(this[TViewIndex.Context]); // 初始化 @Output
        this.createViewChild(this[TViewIndex.Context]); // 初始化 @ViewChild
        this.mergeContextAndDecorators(this[TViewIndex.Context]);
        TViewFns.pushContext(this);
        const def = this.$getDefinition(),
            children: number[] = this[TViewIndex.Children];
        // 加载css
        const { styles } = this[TViewIndex.Class]!,
            styleDOM = document.createElement('style');
        styleDOM.innerHTML = styles;
        document.head.append(styleDOM);
        this[TViewIndex.styleDOM] = styleDOM;
        def.template(ViewMode.install, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnInit');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].install();
        }
        Hook(this[TViewIndex.Context], 'OnViewInit');
        // 指令生命周期
        const nodeHasDirectiveIndex = this[TViewIndex.Directives];
        for (let index of nodeHasDirectiveIndex) {
            let tNode = this[index + offset];
            for (let dir of tNode.directives) {
                Hook(dir[TViewIndex.Context], 'OnViewInit');
            }
        }
        TViewFns.popContext();
        this[TViewIndex.Mode] = ViewMode.sleep;
    }
    // TODO:slot更新未处理
    update() {
        this[TViewIndex.Mode] = ViewMode.update;
        const conflict = this.updateInput(this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnInputChanges', conflict);
        // if (conflict.size) {
        TViewFns.pushContext(this);
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def && def.template(ViewMode.update, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnUpdated', conflict);
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].update();
        }
        Hook(this[TViewIndex.Context], 'OnViewUpdated', conflict);
        // 指令生命周期
        const nodeHasDirectiveIndex = this[TViewIndex.Directives];
        for (let index of nodeHasDirectiveIndex) {
            let tNode = this[index + offset];
            for (let dir of tNode.directives) {
                Hook(dir[TViewIndex.Context], 'OnViewUpdated');
            }
        }
        TViewFns.popContext();
        // }
        this[TViewIndex.Mode] = ViewMode.sleep;
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
        // 卸载style
        this[TViewIndex.styleDOM].remove();
        TViewFns.popContext();
    }
}

export { TemplateView };
