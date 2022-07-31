import { Component } from '../../decorators/index';
@Component({
    selector: `iron`,
    styles: ``,
    template: `<div>钢铁侠</div>`,
    providers: [],
})
class IronComponent {
    constructor() {}
    OnDestroy() {
        console.log('钢铁侠 销毁！');
    }
}
export { IronComponent };
