import { ObjectInterface } from '../../common/interface';

class formControl {
    constructor(private config: ObjectInterface<any>) {}
    input?: HTMLInputElement;
    bind(input: HTMLInputElement) {
        this.input = input;
        this.input.value = this.config.value;
    }
}
export { formControl };
