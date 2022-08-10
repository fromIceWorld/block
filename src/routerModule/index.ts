import { Module } from '../../decorators/index';
import { RouterLink } from './router-link';
import { RouterView } from './router-view';
@Module({
    declarations: [RouterView, RouterLink],
    exports: [RouterView, RouterLink],
})
class RouterModule {}
export { RouterModule };
