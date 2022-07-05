import { ViewDefination } from '../@compiler/instruction/InstructionContext/index';
import { Input } from '../decorators/index';

class bIf {
    @Input('if')
    arr: any;
    name = 'if指令';
    views: any[] = [];
    static selector = 'if';
    constructor(private index: number, private defination: ViewDefination) {
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
        return [{ arr: true }];
    }
}
export { bIf };
