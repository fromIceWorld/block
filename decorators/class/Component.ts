import { StaticProvider } from '../../Injector/index';
import { Decorator } from '../Enum';
interface ComponentParams {
    selector: string;
    styles: string;
    template: string;
    providers?: StaticProvider[];
}

function Component(params: ComponentParams) {
    let { selector, styles, template, providers } = params;
    return function (target: any) {
        target.selector = selector;
        target.styles = styles;
        target.template = template;
        target.providers = providers;
        target.$type = Decorator.Component;
        return target;
    };
}
export { Component };
