import { ObjectInterface } from '../../common/interface';
import { formGroupDirective } from '../form-group-directive';

class formControl {
    constructor(private config: ObjectInterface<any>) {}
    input?: HTMLInputElement;
    group?: formGroupDirective;
    bind(input: HTMLInputElement, group: formGroupDirective) {
        this.group = group;
        this.input = input;
        this.input.value = this.config.value;
        input.addEventListener('input', () => {
            this.config.value = input.value;
            console.log('formGroupDirective绑定的input更改', input.value);
            this.group!.change();
        });
    }
}
export { formControl };
