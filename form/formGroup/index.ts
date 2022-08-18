import { ObjectInterface } from '../../common/interface';

class formGroup {
    constructor(private fromControls: ObjectInterface<any>) {}
    get(name: string) {
        return this.fromControls[name];
    }
}
export { formGroup };
