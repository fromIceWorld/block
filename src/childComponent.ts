import { compiler } from '../@compiler/compile/index';
import { EventEmitter } from '../common/event/EventEmitter';
import { Component, Inject, Input, Output } from '../decorators/index';
@Component({
    selector: `app-child`,
    template: ` app-child组件: {{ desc }}
        <div
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
    emitBuild?: EventEmitter;
    desc = '[child组件中的插值]';
    constructor() {}
    OnInit() {
        console.log(this, this.emitBuild);
    }
    OnInputChanges(e: any) {
        console.log(e);
    }
    emitValue() {
        console.log(this.injectorCompiler);
        this.emitBuild?.emit(this.injectorCompiler);
    }
}
export { ChilComponent };
