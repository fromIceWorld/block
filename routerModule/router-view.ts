import { TViewIndex } from '../@compiler/Enums/TView';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { Component } from '../decorators/index';
import { Inject } from '../decorators/params/inject';
import { Application, routeConfig } from '../platform/application';
import { Router } from '../routerModule/router';

let cache = {
    deep: 1,
};
@Component({
    selector: 'router-view',
    template: '',
    styles: '',
    providers: [{ provide: Router, useClass: Router, deps: [] }],
})
class RouterView {
    parentTView: TemplateView;
    tView?: TemplateView;
    native: Element;
    deep = cache.deep++;
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
        this.detectChanges();
    }
    detectChanges() {
        console.log('router-view监听到hash更改');
        console.log('获取hashs', this.router.getHash());
        let oldTree = this.app.routesStack[this.deep],
            parentTree = this.app.routesStack[this.deep - 1] || new Map(),
            newTree,
            hash = '/' + this.router.getHash();

        for (let pathRegExp of parentTree.keys()) {
            let matchResult = hash.match(pathRegExp);
            console.log('路由match结果', matchResult);
            if (matchResult && matchResult.index == 0) {
                newTree = this.app.routesStack[this.deep] =
                    parentTree.get(pathRegExp);
                console.log('路由匹配：', matchResult);
                break;
            }
        }
        console.log('router-view的路由', this.app.routesTree);
        if (newTree == oldTree) {
            console.log('新旧路由相同');
        } else if (newTree !== oldTree) {
            let route = newTree.get(routeConfig);
            if (this.tView) {
                this.tView.destroyed();
                this.tView[TViewIndex.Host]!.replaceChildren();
            }
            let component = route.component;
            this.tView = new TemplateView(component, undefined, this.native);
            console.log('路由匹配渲染：', this.tView);
            this.tView.attach();
        } else {
            console.log('未匹配到路由', parentTree);
        }
    }
}
export { RouterView, cache };
