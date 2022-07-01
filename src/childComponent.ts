import { compiler } from '../@compiler/compile/index';
import { EventEmitter } from '../common/event/EventEmitter';
import { Component, Inject, Input, Output } from '../decorators/index';
@Component({
    selector: `app-child`,
    template: ` <h1>
            -------------------ChildComponent------------------------
        </h1>
        app-child组件: {{ desc }}
        <div
            *for="let item of list"
            style="width: 67px;
                    padding: 10px 15px;
                    border-radius: 6px;
                    background-color: #72d381"
            @click="emitValue()"
        >
            按钮
        </div>
        <p>parentValue:{{ parentValue }}</p>
        <slot name="slot1"></slot>
        <slot></slot>`,
    styles: '',
})
class ChilComponent {
    @Inject(compiler) injectorCompiler: any;
    @Input('value') parentValue?: string;
    @Output('childEmit')
    arr = [1, 2];
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
