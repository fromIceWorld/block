import { EventEmitter } from '../common/event/EventEmitter';
import { Component } from '../decorators/index';
import { Input } from '../decorators/Input';
import { Output } from '../decorators/Output';
@Component({
    selector: `app-child`,
    template: `app-child组件: {{ desc }}
        <div
            style="width:100px;height:100px;background-color:red"
            @click="emitValue()"
        >
            按钮
        </div>
        <p>{{ parentValue }}</p>`,
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
