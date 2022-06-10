import { Decorator } from './Enum';
interface ComponentParams {
    selector: string;
    styles: string;
    template: string;
}

function Component(params: ComponentParams) {
    let { selector, styles, template } = params;
    return function (target: any) {
        target.selector = selector;
        target.styles = styles;
        target.template = template;
        target.$type = Decorator.Component;
        return target;
    };
}
export { Component };
