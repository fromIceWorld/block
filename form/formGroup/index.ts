import { ObjectInterface } from '../../common/interface';
import { TViewFns } from '../../compiler/instruction/InstructionContext/index';
import { TemplateView } from '../../index';

class formGroup {
    TView: TemplateView;
    constructor(private fromControls: ObjectInterface<any>) {
        this.TView = TViewFns.currentTView();
    }
    get(name: string) {
        return this.fromControls[name];
    }
    change() {
        this.TView.update();
    }
}
export { formGroup };
