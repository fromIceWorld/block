import { CheckDetectChange } from '../compiler/instruction/InstructionContext/index';
import { Directive, Inject, Input } from '../index';
import { formGroup } from './index';

@Directive({
    selector: '[formGroup]',
})
class formGroupDirective {
    @Input('formGroup') formGroup?: formGroup;
    form?: HTMLFormElement;
    inputs?: HTMLFormControlsCollection;
    constructor(@Inject(CheckDetectChange) private cd: CheckDetectChange) {
        console.log('formGroup 实例化');
    }
    OnBind(native: HTMLFormElement) {
        this.form = native;
    }
    OnInit() {
        this.inputs = this.form!.elements;
        Array.from(this.inputs).forEach((input: Element) => {
            const controlName = input.getAttribute('formControlName') || '',
                control = this.formGroup!.get(controlName);
            if (control) {
                control.bind(input, this);
            }
        });
    }
    change() {
        this.cd.detectChanges();
    }
}
export { formGroupDirective };
