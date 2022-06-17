import { Component } from '../decorators/index';
@Component({
    selector: `#root`,
    styles: ``,
    template: `<div
            data-angular
            name="angular"
            &style="{width: dataWidth}"
            @change="go($event,'query')"
        >
            子元素:【文本】
            <div
                style="width: 100px;height: 100px;background-color:#e5e0e1;"
                &style="{width: dataWidth}"
                &name="block"
                @click="emit($event,123)"
            ></div>
        </div>
        <p
            class="forP bindClass2"
            &class="{bindClass1: class1,bindClass2: class2}"
        >
            我是:{{ exp }},{{ exp2 }}
        </p>
        <app-child &value="block" @childEmit="console($event)">
            <span>default slot</span>
            <span slot="slot1">slot1</span>
        </app-child>
        <!-- 注释信息-->`,
})
class MyComponent {
    exp = '第一个插值';
    exp2 = '第2个插值';
    block = 'com';
    dataWidth = '200px';
    class1 = true;
    class2 = false;
    constructor() {}
    emit(e: EventTarget, value: any) {
        console.log(e, value, this);
    }
    console(e: EventTarget) {
        console.log('接收到子组件的emit', e);
    }
    OnInputChanges(changesObj) {
        console.log(
            '%cmyComponent: %cOnIputChanges',
            'color:green',
            'color:#ff6500'
            changesObj,

        );
    }
    OnInit() {
        console.log('%cmyComponent: %cOnIinit', 'color:green', 'color:blue');
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
        console.log(
            '%cmyComponent: %cOnDestroy','color:green',
            'color:red'
        );
    }
}
export { MyComponent };

