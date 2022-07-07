import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { demoComponent } from './demo';
import { firstDirective } from './firstDirective';
import { forof } from './forOf';
import { bIf } from './if';
import { MyComponent } from './myComponent';
@Module({
    declarations: [
        MyComponent,
        ChilComponent,
        demoComponent,
        firstDirective,
        forof,
        bIf,
    ],
    imports: [],
    exports: [],
    providers: [],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
