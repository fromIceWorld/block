import { CheckDetectChange } from '../@compiler/instruction/InstructionContext/index';
import { Component } from '../decorators/index';
import { Inject } from '../decorators/params/inject';
@Component({
    selector: `#root`,
    styles: ``,
    template: `
        <input &value="exp2" @input="onInput($event)"></input>
        <input id="orange" type="checkbox" &checked="!exp" value="橘子" @change="onchange($event)" label="第一个checkbox"></input>
        <label for="orange">橘子</label>
        <input id="apple" type="checkbox" value="苹果" @change="onchange($event)" label="第一个checkbox"></input>
        <label for="apple">苹果</label>
        <select @change="selectChange($event)">
            <option>A</option>
            <option>B</option>
            <option>C</option>
        </select>
            <input id="radio" type="radio" value="少年" @change="onRadioChange($event)" name="Radio"></input>
            <label for="radio">少年</label>
            <input id="radio2" type="radio" value="少年" @change="onRadioChange($event)"  name="Radio"></input>
            <label for="radio2">青年</label>
       
        <div
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
        <h3 style="background:yellow">下面是路由：</h3>
        <h1>路由跳转:</h1>
        <router-link
            to="file:///C:/Users/%E5%B4%94%E5%86%B0%E5%86%B0/Desktop/block/index.html#iron/mark5"
            >GO!钢铁侠实验室</router-link
        >
        <div></div>
        <router-link
            to="file:///C:/Users/%E5%B4%94%E5%86%B0%E5%86%B0/Desktop/block/index.html#spider/mark5"
            >GO!蜘蛛侠家</router-link
        >
        <router-view></router-view>
    `,
})
class MyComponent {
    exp = '第一个插值';
    displayIf: boolean = true;
    exp2 = '第2个插值';
    block = 'com';
    dataWidth = '200px';
    class1 = true;
    class2 = false;
    constructor(@Inject(CheckDetectChange) private cd: CheckDetectChange) {}
    onInput(e) {
        this.exp2 = e.target.value;
        console.log('onInput事件', this);
        this.cd.detectChanges();
    }
    onchange(e) {
        this.exp2 = e.target.value;
        console.log('change事件');
        this.cd.detectChanges();
    }
    selectChange(e) {
        console.log(e);
    }
    onRadioChange(e) {
        console.log(e);
    }
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
