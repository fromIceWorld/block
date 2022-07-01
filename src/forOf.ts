import { ViewDefination } from '../@compiler/instruction/InstructionContext/index';
import { TNode } from '../@compiler/instruction/instructionFn/interface/TNode';
import { viewContainer } from '../@compiler/template/embedded/index';
import { Input } from '../decorators/index';

class forof {
    @Input('forof')
    arr: any;
    name = '第一个指令';
    defination: ViewDefination;
    views: any[] = [];
    tNode: TNode;
    static selector = 'forOf';
    constructor(
        private container: viewContainer,
        defination: ViewDefination,
        tNode: TNode
    ) {
        // this.container = new viewContainer();
        this.defination = defination;
        this.tNode = tNode;
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
            this.views?.push(this.defination);
        });
        console.log('forof指令end', this.views);
        this.container.diff(this.views);
    }
}
export { forof };
