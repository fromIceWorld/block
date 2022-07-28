import { EventEmitter } from '../common/event/EventEmitter';
import { Component, Input, Output } from '../decorators/index';
@Component({
    selector: `app-child`,
    template: `
        <h1>-------------------ChildComponent------start------------------</h1>
        app-child组件: {{ desc }}
        <div
            *forOf="arr"
            item="item"
            index="index"
            style="width: 100px;
                    padding: 10px 15px;
                    border-radius: 6px;
                    background-color: #72d381"
            &style="{background:item.color}"
            @click="emitValue()"
        >
            按钮: {{ arr['1'].desc }}
        </div>
        <app-demo
            &value="parentValue"
            *forOf="arr"
            item="item"
            index="index"
            &style="{color:item.color}"
        ></app-demo>
        <p>my-component value:{{ parentValue }}</p>
        <slot name="slot1"></slot>
        <slot></slot>
        <h1>-------------------ChildComponent-------end-----------------</h1>
    `,
    styles: '',
})
class ChilComponent {
    @Input('value') parentValue?: string;
    @Output('childEmit')
    arr = [
        { color: 'rgb(255 107 137)', desc: '第一个' },
        { color: 'rgb(123 122 78)', desc: '第二个' },
    ];
    emitBuild?: EventEmitter;
    desc = '[child组件中的插值]';
    constructor() {}
    OnInputChanges(changesObj: any) {
        console.log(
            '%cChilComponent: %cOnIputChanges',
            'color:#bf7313',
            'color:#ff6500',
            changesObj
        );
    }
    OnInit() {
        console.log(
            '%cChilComponent: %cOnIinit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnSlotInit() {
        console.log(
            '%cChilComponent: %cOnSlotInit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnSlotChecked() {
        console.log(
            '%cChilComponent: %cOnSlotChecked',
            'color:#bf7313',
            'color:#ff6500'
        );
    }
    OnViewInit() {
        console.log(
            '%cChilComponent: %cOnViewInit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnViewChecked() {
        console.log(
            '%cChilComponent: %cOnViewChecked',
            'color:#bf7313',
            'color:#ff6500'
        );
    }
    OnDestroy() {
        console.log(
            '%cChilComponent: %cOnDestroy',
            'color:#bf7313',
            'color:red'
        );
    }
    emitValue() {
        console.log(this.injectorCompiler);
        this.emitBuild?.emit(this.injectorCompiler);
    }
}
export { ChilComponent };
