import { Input } from '../decorators/index';

class forof {
    @Input('forOf')
    arr: any;
    name = '第一个指令';
    static selector = 'forOf';
    constructor() {}
    OnInputChanges(changesObj: any) {
        console.log('forof指令start');
        let views: Array<any> = [];
        const { currentValue = [], previousValue = [] } = changesObj;
        [{ item: 1 }, { item: 2 }, { item: 3 }].forEach((item: any) => {
            console.log(item);
            views?.push(item);
        });
        return views;
    }
}
export { forof };
