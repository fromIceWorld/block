import { Module } from '../../index';
import {
    formControlDirective,
    formGroupDirective,
} from '../form-group-directive';

@Module({
    declarations: [formGroupDirective, formControlDirective],
    exports: [],
})
class formsModule {}
export { formsModule };
