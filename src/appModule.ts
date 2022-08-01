import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { IronComponent } from './components/iron';
import { SpiderComponent } from './components/spider';
import { Spider2Component } from './components/spider2';
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
        IronComponent,
        SpiderComponent,
    ],
    providers: [],
    imports: [RouterModule],
    exports: [],
    routes: [
        {
            path: 'iron',
            component: IronComponent,
            children: [
                {
                    path: 'mark5',
                    component: TestComponent,
                },
            ],
        },
        {
            path: 'spider',
            component: SpiderComponent,
            children: [
                {
                    path: ':userId',
                    component: Spider2Component,
                },
            ],
        },
    ],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
