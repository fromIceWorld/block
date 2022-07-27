import { ViewContainer } from '../@compiler/template/embedded/index';
import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { demoComponent } from './demo';
import { firstDirective } from './firstDirective';
import { forof } from './forOf';
import { bIf } from './if';
import { MyComponent } from './myComponent';
import { Router } from './routerModule/router';
import { RouterView } from './routerModule/router-view';
@Module({
    declarations: [
        MyComponent,
        ChilComponent,
        demoComponent,
        firstDirective,
        forof,
        bIf,
        RouterView,
    ],
    providers: [
        { provide: ViewContainer, useValue: ViewContainer },
        { provide: Router, useValue: Router },
    ],
    imports: [],
    exports: [],
    routes: [
        {
            path: 'demo',
            component: MyComponent,
        },
    ],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
