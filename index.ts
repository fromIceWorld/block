import { PlatformBrowserDynamic } from './platform/browser';
import { AppModule } from './src/appModule';
let platform = PlatformBrowserDynamic();
platform.bootstrapModule(AppModule);
document.body.append(root[0]);
