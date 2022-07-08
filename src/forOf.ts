import { Input } from '../decorators/index';

class forof {
    @Input('forOf')
    arr: Array<any>;
    @Input('item')
    item: string = 'item';
    @Input('index')
    index: string = 'index';
    static selector = 'forOf';
    constructor() {}
    OnInputChanges(changesObj: any) {
        console.log('forof指令start', this.arr);
        let views: Array<any> = [];
        const { currentValue = [], previousValue = [] } = changesObj;
        [{ item: 1 }, { item: 2 }].forEach((item: any) => {
            console.log(item);
            views?.push(item);
        });
        return views;
    }
}
export { forof };
