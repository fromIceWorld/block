import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { firstDirective } from './firstDirective';
import { forof } from './forOf';
import { bIf } from './if';
import { MyComponent } from './myComponent';
@Module({
    declarations: [MyComponent, ChilComponent, firstDirective, forof, bIf],
    imports: [],
    exports: [],
    providers: [],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
