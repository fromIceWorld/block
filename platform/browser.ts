import { θd } from '../DocumentAPI/index';
import { Injector, StaticProvider } from '../Injector/index';
import {
    collectRunDependency,
    createPlatform,
    PlatformRef,
} from './application';
import { PlatformCore } from './platform_core';

/**
 * 浏览器平台提供依赖：
 *      render函数(DOM_API)
 */
const Browser_Providers: StaticProvider[] = [
    {
        provide: θd,
        useValue: θd,
    },
];

function PlatformBrowserDynamic(
    extraProvides: StaticProvider[] = []
): PlatformRef {
    let platFormProviders = collectRunDependency(
        PlatformCore,
        'browser',
        Browser_Providers
    );
    let platFomrInjector = Injector.create(platFormProviders(extraProvides));
    let platformRef = createPlatform(platFomrInjector);
    (window as any)['platformRef'] = platformRef;
    return platformRef;
}

export { PlatformBrowserDynamic };
