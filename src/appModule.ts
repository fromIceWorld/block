import { Module } from '../decorators/index';
import { ChilComponent } from './childComponent';
import { demoComponent } from './demo';
import { firstDirective } from './firstDirective';
import { forof } from './forOf';
import { bIf } from './if';
import { MyComponent } from './myComponent';
import { RouterModule } from './routerModule/index';
import { Router } from './routerModule/router';
import { routes } from './routerModule/routes';
let router = new Router();
router.register(routes);
@Module({
    declarations: [
        MyComponent,
        ChilComponent,
        demoComponent,
        firstDirective,
        forof,
        bIf,
    ],
    providers: [{ provide: Router, useValue: Router }],
    imports: [RouterModule],
    exports: [],
    bootstrap: [MyComponent],
})
class AppModule {}
export { AppModule };
