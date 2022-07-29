import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { demoComponent } from './demo';
import { firstDirective } from './firstDirective';
import { forof } from './forOf';
import { bIf } from './if';
import { MyComponent } from './myComponent';
import { RouterModule } from './routerModule/index';
import { TestComponent } from './test';
@Module({
    declarations: [
        MyComponent,
        ChilComponent,
        demoComponent,
        firstDirective,
        forof,
        bIf,
        TestComponent,
    ],
    providers: [],
    imports: [RouterModule],
    exports: [],
    routes: [
        {
            path: 'demo',
            component: TestComponent,
            children: [
                {
                    path: 'demoTest1',
                    component: TestComponent,
                },
            ],
        },
        {
            path: 'test/:user',
            component: TestComponent,
        },
    ],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
