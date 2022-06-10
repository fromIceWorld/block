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
        <app-child></app-child>
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
}
export { MyComponent };
