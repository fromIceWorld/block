import { Injector } from './index';
const THROW_IF_NOT_FOUND = {};

class NullInjector implements Injector {
    get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND) {
        if (notFoundValue == THROW_IF_NOT_FOUND) {
            const error = new Error(
                `NullInjectorError: No provider for ${token}`
            );
            error.name = 'NullInjectorError';
            throw error;
        }
        return notFoundValue;
    }
}
export { NullInjector, THROW_IF_NOT_FOUND };
