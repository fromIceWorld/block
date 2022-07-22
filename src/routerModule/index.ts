import { Module } from '../../decorators/index';
import { RouterView } from './router-view';
@Module({
    declarations: [RouterView],
})
export class RouterModule {
    static tree: any;
    static register(config) {
        this.tree = config;
        return [
            {
                provide: RouterModule,
                useClass: RouterModule,
            },
        ];
    }
}
