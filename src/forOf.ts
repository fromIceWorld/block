import { viewContainer } from '../@compiler/template/embedded/index';
import { Input } from '../decorators/index';

class forof {
    @Input('forOf')
    arr: Array<any>;
    @Input('item')
    item: string = 'item';
    @Input('index')
    index: string = 'index';
    static selector = 'forOf';
    constructor(private container: viewContainer) {}

    OnInputChanges(changesObj: any) {
        console.log('forof指令start', this, this.arr, changesObj);
        let views: Array<any> = [];
        for (let i = 0; i < this.arr.length; i++) {
            views.push({
                [this.item]: this.arr[i],
                [this.index]: i,
            });
        }
        return views;
    }
}
export { forof };
