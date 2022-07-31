import { TViewIndex } from '../../@compiler/Enums/TView';
import { TViewFns } from '../../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../../@compiler/template/TView/TemplateView';
import { Component } from '../../decorators/index';
import { Inject } from '../../decorators/params/inject';
import { Application, routeConfig } from '../../platform/application';
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
    tView?: TemplateView;
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
        console.log('获取hashs', this.router.getHash());
        let tree = this.app.currentRouteBranch,
            hash = '/' + this.router.getHash(),
            route;
        for (let pathRegExp of tree.keys()) {
            let matchResult = hash.match(pathRegExp);
            console.log('路由match结果', matchResult);
            if (matchResult && matchResult.index == 0) {
                this.app.currentRouteBranch = tree.get(pathRegExp)!;
                console.log('路由匹配：', matchResult);
                route = tree.get(pathRegExp)?.get(routeConfig);
                break;
            }
        }
        console.log('router-view的路由', this.app.routesTree);
        if (route) {
            if (this.tView) {
                this.tView.destroyed();
                this.tView[TViewIndex.Host]!.replaceChildren();
            }
            let component = route.component;
            this.tView = new TemplateView(
                component,
                undefined,
                this.native,
                this.parentTView
            );
            console.log('路由匹配渲染：', this.tView);
            this.tView.attach();
        } else {
            console.log('未匹配到路由', tree);
        }
    }
}
export { RouterView };
