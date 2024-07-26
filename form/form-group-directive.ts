import { CheckDetectChange } from '../compiler/instruction/InstructionContext/index';
import { Directive, Inject, Input } from '../index';

class FormGroup {
    [prop: string]: any;
    constructor(controls: any) {
        for (let [key, config] of Object.entries(controls)) {
            this[key] = config;
            (config as any)['group'] = this;
        }
    }
    get(key: string) {
        const { value } = this[key];
        return value;
    }
    subs: Function[] = [];
    subscribe(fn: Function) {
        this.subs.push(fn);
    }
    change(key: string, value: any) {
        console.log(key, value);
        this.subs.forEach((fn) => {
            let valid = new RegExp(this[key].regexp).test(value);
            fn(key, value, valid);
        });
    }
}
@Directive({
    selector: '[formgroup]',
})
class formGroupDirective {
    @Input('formgroup') formgroup: any;
    form?: HTMLFormElement;
    inputs?: HTMLFormControlsCollection;
    constructor(@Inject(CheckDetectChange) private cd: CheckDetectChange) {
        console.log('formGroup 实例化');
    }
    OnBind(native: HTMLFormElement) {
        this.form = native;
    }
    OnInit() {
        this.formgroup!.subscribe((key: any, value: any, valid: boolean) => {
            console.log('接收到key:value:', key, value, valid);
        });
    }
    change() {
        this.cd.detectChanges();
    }
}
@Directive({
    selector: '[formcontrol]',
})
class formControlDirective {
    @Input('formcontrol') formcontrol?: any;
    input?: HTMLInputElement;
    constructor(@Inject(CheckDetectChange) private cd: CheckDetectChange) {
        console.log('formcontrol 实例化');
    }
    OnBind(input: HTMLInputElement) {
        this.input = input;
        console.log('绑定input', this.input);
        input.addEventListener('input', (e) => {
            console.log('formGroupDirective绑定的input更改', input.value);
            const { group, name, regexp } = this.formcontrol;
            let valid = new RegExp(regexp).test(input.value);
            if (!valid) {
                input.style.border = '1px solid red';
            } else {
                input.style.border = '1px solid black';
            }
            if (group) {
                group.change(name, input.value);
            }
            this.change();
        });
    }
    OnInit() {
        this.input!.value = this.formcontrol.value;
        console.log(this.formcontrol);
    }
    change() {
        this.cd.detectChanges();
    }
}
export { formGroupDirective, formControlDirective, FormGroup };
