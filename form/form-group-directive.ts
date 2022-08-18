import { Directive, Input } from '../index';
import { formGroup } from './index';

@Directive({
    selector: '[formGroup]',
})
class formGroupDirective {
    @Input('formGroup') formGroup?: formGroup;
    form?: HTMLFormElement;
    inputs?: HTMLFormControlsCollection;
    constructor() {
        console.log('formGroup 实例化');
    }
    OnBind(native: HTMLFormElement) {
        this.form = native;
    }
    OnInit() {
        this.inputs = this.form!.elements;
        Array.from(this.inputs).forEach((input) => {
            const controlName = input.getAttribute('formControlName') || '',
                control = this.formGroup!.get(controlName);
            if (control) {
                control.bind(input);
            }
        });
    }
}
export { formGroupDirective };
