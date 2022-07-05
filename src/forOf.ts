import { ViewDefination } from '../@compiler/instruction/InstructionContext/index';
import { Input } from '../decorators/index';

class forof {
    @Input('forOf')
    arr: any;
    name = '第一个指令';
    static selector = 'forOf';
    constructor(private index: number, private defination: ViewDefination) {
        this.defination = defination;
    }
    attach() {}
    detectChanges() {
        this.OnInputChanges({
            currentValue: [1, 2],
            previousValue: [1, 2],
        });
    }
    OnInputChanges(changesObj: any) {
        console.log('forof指令start');
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
