import { Module } from '../../index';
import { formGroupDirective } from '../form-group-directive';

@Module({
    declarations: [formGroupDirective],
    exports: [formGroupDirective],
})
class formsModule {}
export { formsModule };
