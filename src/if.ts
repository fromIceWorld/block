import { Input } from '../decorators/index';

class bIf {
    @Input('if')
    arr: any;
    name = 'if指令';
    static selector = 'if';
    constructor() {}
    OnInputChanges(changesObj: any): Array<any> {
        console.log('if指令start:', this.arr);
        return this.arr ? [{ arr: this.arr }] : [];
    }
}
export { bIf };
