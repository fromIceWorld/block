import { Module } from '../../decorators/index';
import { Route } from './Enums/route';
import { RouterView } from './router-view';
@Module({
    declarations: [RouterView],
    exports: [RouterView],
})
class RouterModule {
    static tree: Map<string, any> = new Map();
    static register(routes: Route[]) {
        this.tree = routes;
    }
}
export { RouterModule };
