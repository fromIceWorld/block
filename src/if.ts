import { ViewDefination } from '../@compiler/instruction/InstructionContext/index';
import { viewContainer } from '../@compiler/template/embedded/index';
import { Input } from '../decorators/index';

class bIf {
    @Input('if')
    arr: any;
    name = 'if指令';
    views: any[] = [];
    container: viewContainer;
    static selector = 'if';
    constructor(private index: number, private defination: ViewDefination) {
        this.container = new viewContainer(index);
        console.log(this.container);
        // this.container = new viewContainer();
        this.defination = defination;
    }
    attach() {}
    detectChanges() {
        this.OnInputChanges({
            currentValue: true,
            previousValue: true,
        });
    }
    OnInputChanges(changesObj: any) {
        console.log('if指令start');
        const { currentValue, previousValue } = changesObj;
        if (previousValue && !currentValue) {
            this.views = [];
            this.container.diff(this.views);
        } else {
            this.views.push([this.defination, {}]);
            this.container.diff(this.views);
        }
    }
}
export { bIf };
