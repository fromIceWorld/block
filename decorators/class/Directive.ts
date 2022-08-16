import { StaticProvider } from '../../Injector/index';
import { Decorator } from '../Enum';
interface DirectiveParams {
    selector?: string;
    styles?: string;
    providers?: StaticProvider[];
}

function Directive(params: DirectiveParams) {
    let { selector, styles, providers } = params;
    return function (target: any) {
        target.selector = selector;
        target.styles = styles;
        target.providers = providers;
        target.$type = Decorator.Directive;
        return target;
    };
}
export { Directive };
