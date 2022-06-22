import { compiler } from '../../compile/index';

import {
    ConstructortInterface,
    ObjectInterface,
} from '../../../common/interface';
import { InjectChanges } from '../../../decorators/index';
import { InputChanges } from '../../../decorators/prop/Input';
import { EventChanges } from '../../../decorators/prop/Output';
import { θd } from '../../../DocumentAPI/browser';
import { Hook } from '../../../lifeCycle/index';
import { componentFromModule } from '../../../platform/application';
import { TViewIndex } from '../../Enums/index';
import { TViewFns } from '../../instruction/InstructionContext/index';
import { offset, TemplateDynamic } from '../template';
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
        host = θd.createElement('template').content!,
        parent?: TemplateView
    ) {
        super();
        Object['setPrototypeOf'](this, TemplateView.prototype);
        this[TViewIndex.Class] = component;
        this[TViewIndex.TNode] = tNode;
        this[TViewIndex.Host] = host;
        this[TViewIndex.LView] = new LogicView();
        this[TViewIndex.Parent] = parent;
        this[TViewIndex.Module] = component.hasOwnProperty(componentFromModule)
            ? (component as any)[componentFromModule]
            : null;
        this.injectProviders();
        this[TViewIndex.Context] = this.createContext();
        this.updateInput();
        this.createOutput();
        this.InstanceInjects();
        this.mergeContextAndDecorators();
    }

    private $getDefinition: any = (() => {
        return () => {
            if (!this[TViewIndex.ComponentDef]) {
                const compilerInstance =
                    this[TViewIndex.Injector]!.get(compiler);
                console.log(compilerInstance);
                this[TViewIndex.ComponentDef] = compilerInstance.transform(
                    this[TViewIndex.Class]
                );
            }
            return this[TViewIndex.ComponentDef];
        };
    })();
    attach(): void {
        TViewFns.pushContext(this);
        Hook(this[TViewIndex.Context], 'OnInit');
        const def = this.$getDefinition(),
            children: number[] = this[TViewIndex.Children];
        def.template(3, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotInit');
        this.HookDirectives('OnInserted');
        this.HookDirectives('OnInputChanges');
        this.HookDirectives('OnInit');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].attach();
        }
        Hook(this[TViewIndex.Context], 'OnViewInit');
        let rootElements = this[TViewIndex.RootElements].map(
            (index) => this[TViewIndex.LView]![index + offset]
        );
        if ((this[TViewIndex.Host] as any).content) {
            (this[TViewIndex.Host] as any).content.append(...rootElements);
        } else {
            this[TViewIndex.Host]!.append(...rootElements);
        }
        TViewFns.popContext();
    }
    // 变更检测
    detectChanges(): void {
        this.updateInput();
        TViewFns.pushContext(this);
        let def = this.$getDefinition(),
            children = this[TViewIndex.Children];
        def && def.template(2, this[TViewIndex.Context]);
        Hook(this[TViewIndex.Context], 'OnSlotChecked');
        // 指令的 [OnInputChanges]生命周期
        // attach阶段，触发指令 change生命周期
        this.HookDirectives('OnInputChanges');
        for (let child of children) {
            let tNode = this[child + offset];
            tNode['TView'].detectChanges();
        }
        Hook(this[TViewIndex.Context], 'OnViewChecked');
        TViewFns.popContext();
    }
}

/**
 * 在context和 class之间建立一层中间层，存储input，output，inject数据
 *
 *
 * @param constructor 组件/指令的class
 * @param key
 */
function insertMiddleLayer(constructor: ObjectInterface<any>) {
    let upper = constructor.prototype,
        middle = Object.create(upper);
    middle[InputChanges] = Object.create({});
    middle[EventChanges] = Object.create({});
    middle[InjectChanges] = Object.create({});
    return middle;
}
export { TemplateView };
