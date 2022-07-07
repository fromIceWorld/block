import { compiler } from '../@compiler/compile/index';
import { EventEmitter } from '../common/event/EventEmitter';
import { Component, Inject, Input, Output } from '../decorators/index';
@Component({
    selector: `app-demo`,
    template: `
        <h1>-------------------demoComponent-----------start-------------</h1>
        app-demo组件: {{ desc }}
        <div *forOf="arrs">[app-demo],li{{ desc }}{{ parentValue }}</div>
        <p>app-child[parentValue]:{{ parentValue }}</p>
        <h1>-------------------demoComponent-----------end-------------</h1>
    `,
    styles: '',
})
class demoComponent {
    @Inject(compiler) injectorCompiler: any;
    @Input('value') parentValue?: string;
    @Output('childEmit')
    arrs = [1, 2];
    emitBuild?: EventEmitter;
    desc = '[demo组件中的插值]';
    constructor() {}
    OnInputChanges(changesObj: any) {
        console.log(
            '%cdemoComponent: %cOnIputChanges',
            'color:#bf7313',
            'color:#ff6500',
            changesObj
        );
    }
    OnInit() {
        console.log(
            '%cdemoComponent: %cOnIinit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnSlotInit() {
        console.log(
            '%cdemoComponent: %cOnSlotInit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnSlotChecked() {
        console.log(
            '%cdemoComponent: %cOnSlotChecked',
            'color:#bf7313',
            'color:#ff6500'
        );
    }
    OnViewInit() {
        console.log(
            '%cdemoComponent: %cOnViewInit',
            'color:#bf7313',
            'color:blue'
        );
    }
    OnViewChecked() {
        console.log(
            '%cdemoComponent: %cOnViewChecked',
            'color:#bf7313',
            'color:#ff6500'
        );
    }
    OnDestroy() {
        console.log(
            '%cdemoComponent: %cOnDestroy',
            'color:#bf7313',
            'color:red'
        );
    }
    emitValue() {
        console.log(this.injectorCompiler);
        this.emitBuild?.emit(this.injectorCompiler);
    }
}
export { demoComponent };
