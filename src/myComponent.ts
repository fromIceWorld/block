import { Component, Inject } from '../decorators/index';
import { Router } from './routerModule/router';
@Component({
    selector: `#root`,
    styles: ``,
    template: ` <div
            data-angular
            name="angular"
            &style="{width: dataWidth}"
            @change="go($event,'query')"
        >
            文本节点:【文本】
            <div
                *if="displayIf"
                style="width: 100px;height: 100px;background-color:#b52f4a;"
                &style="{width: dataWidth}"
                &name="block"
                @click="emit($event,123)"
            >
                {{ displayIf }}
            </div>
        </div>
        <p
            #ref
            class="forP bindClass2"
            &class="{bindClass1: class1,bindClass2: class2}"
        >
            我是:{{ exp }},{{ exp2 }}
        </p>
        <app-child &value="block" @childEmit="console($event)">
            <span>default slot</span>
            <span slot="slot1">slot1</span>
        </app-child>

        <!-- 注释信息-->
        <h1 style="background:yellow">下面是路由：</h1>
        <router-view *route="exp2"></router-view>`,
})
class MyComponent {
    @Inject(Router) router;
    exp = '第一个插值';
    displayIf: boolean = true;
    exp2 = '第2个插值';
    block = 'com';
    dataWidth = '200px';
    class1 = true;
    class2 = false;
    constructor() {}
    emit(e: EventTarget, value: any) {
        console.log(e, value, this);
    }
    OnInputChanges(changesObj: any) {
        console.log(
            '%cmyComponent: %cOnIputChanges',
            'color:green',
            'color:#ff6500',
            changesObj
        );
    }
    OnInit() {
        console.log('%cmyComponent: %cOnInit', 'color:green', 'color:blue');
        console.log(this.router);
    }
    OnSlotInit() {
        console.log('%cmyComponent: %cOnSlotInit', 'color:green', 'color:blue');
    }
    OnSlotChecked() {
        console.log(
            '%cmyComponent: %cOnSlotChecked',
            'color:green',
            'color:#ff6500'
        );
    }
    OnViewInit() {
        console.log('%cmyComponent: %cOnViewInit', 'color:green', 'color:blue');
    }
    OnViewChecked() {
        console.log(
            '%cmyComponent: %cOnViewChecked',
            'color:green',
            'color:#ff6500'
        );
    }
    OnDestroy() {
        console.log('%cmyComponent: %cOnDestroy', 'color:green', 'color:red');
    }
}
export { MyComponent };
