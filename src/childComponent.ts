import { Component } from '../decorators/index';
@Component({
    selector: `app-child`,
    template: `app-child组件: {{ desc }}`,
    styles: '',
})
class ChilComponent {
    desc = '[child组件中的插值]';
    constructor() {}
}
export { ChilComponent };
