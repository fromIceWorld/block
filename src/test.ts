import { Component } from '../decorators/index';
@Component({
    selector: `test`,
    styles: ``,
    template: `<div>钢铁侠实验室</div>`,
    providers: [],
})
class TestComponent {
    constructor() {}
    OnDestroy() {
        console.log('钢铁侠 test实验室 销毁！');
    }
}
export { TestComponent };
