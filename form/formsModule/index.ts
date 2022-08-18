import { Module } from '../../index';
import { formGroupDirective } from '../form-group-directive';

@Module({
    declarations: [formGroupDirective],
    exports: [],
})
class formsModule {}
export { formsModule };
