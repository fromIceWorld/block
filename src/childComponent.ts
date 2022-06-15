import { EventEmitter } from '../common/event/EventEmitter';
import { Component } from '../decorators/index';
import { Input } from '../decorators/Input';
import { Output } from '../decorators/Output';
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
    @Input('value') parentValue?: string;
    @Output('childEmit')
    emitBuild?: EventEmitter<any>;
    desc = '[child组件中的插值]';
    constructor() {
        console.log(this, this.emitBuild);
    }
    emitValue() {
        this.emitBuild?.emit('child');
    }
}
export { ChilComponent };
