import { Module } from '../../decorators/index';
import { RouterView } from './router-view';
@Module({
    declarations: [RouterView],
    exports: [RouterView],
})
class RouterModule {}
export { RouterModule };
