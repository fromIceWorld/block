import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { firstDirective } from './firstDirective';
import { MyComponent } from './myComponent';
@Module({
    declarations: [MyComponent, ChilComponent, firstDirective],
    imports: [],
    exports: [],
    providers: [],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
