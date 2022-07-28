import { TViewIndex } from '../../@compiler/Enums/TView';
import { TViewFns } from '../../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../../@compiler/template/TView/TemplateView';
import { Component } from '../../decorators/index';
import { Inject } from '../../decorators/params/inject';
import { Application } from '../../platform/application';
import { Router } from '../routerModule/router';

let deep = 0;
@Component({
    selector: 'router-view',
    template: 'router-view',
    styles: '',
    providers: [{ provide: Router, useClass: Router, deps: [] }],
})
class RouterView {
    parentTView: TemplateView;
    TView?: TemplateView;
    native: Element;
    deep = deep++;
    constructor(
        @Inject(Application) private app: Application,
        @Inject(Router) private router: Router,
        @Inject(TemplateView) private TemplateView: TemplateView
    ) {
        router.subscribe(this);
        this.parentTView = TViewFns.currentTView();
        let currentLView = this.parentTView[TViewIndex.LView]!;
        this.native = currentLView[currentLView.length - 1];
        console.log('所在的TView', this.parentTView);
        console.log('附着的native', this.native);
    }
    detectChanges() {
        console.log('router-view监听到hash更改');
        console.log('获取hashs', this.router.getHashs());
        let tree = this.app.routesTree.get('children'),
            hashArr = this.router.getHashs(),
            count = 0;
        while (count <= this.deep) {
            if (tree?.has(hashArr[count])) {
                tree = tree.get(hashArr[count]);
                count++;
            } else {
                console.log('未找到匹配的路由');
                break;
            }
        }
        let component = tree?.get('component'),
            tView = new TemplateView(
                component,
                undefined,
                this.native,
                this.parentTView
            );
        console.log('路由匹配渲染：', tView);
        tView.attach();
    }
}
export { RouterView };
