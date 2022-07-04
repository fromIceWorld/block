import { ViewDefination } from '../@compiler/instruction/InstructionContext/index';
import { viewContainer } from '../@compiler/template/embedded/index';
import { Input } from '../decorators/index';

class forof {
    @Input('forOf')
    arr: any;
    name = '第一个指令';
    views: any[] = [];
    container: viewContainer;
    static selector = 'forOf';
    constructor(private index: number, private defination: ViewDefination) {
        this.container = new viewContainer(index);
        console.log(this.container);
        // this.container = new viewContainer();
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
        const { currentValue, previousValue } = changesObj;
        currentValue.forEach((item) => {
            console.log(item);
            this.views?.push([this.defination, item]);
        });
        console.log('forof指令end', this.views);
        this.container.diff(this.views);
    }
}
export { forof };
