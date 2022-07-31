import { Component } from '../../decorators/index';
@Component({
    selector: `spider2`,
    styles: ``,
    template: `<div>蜘蛛侠2</div>`,
    providers: [],
})
class Spider2Component {
    constructor() {}
    OnDestroy() {
        console.log('蜘蛛侠2 销毁！');
    }
}
export { Spider2Component };
