import { TNode } from '../@compiler/instruction/instructionFn/interface/TNode';
import { elementNode } from '../@compiler/template/TNode/index';

class firstDirective {
    name = '第一个指令';
    static selector = '[data-angular]';
    OnInputChanges(changesObj: any) {
        console.log(
            '%cfirstDirective: %cOnInputChanges',
            'color:#2c5dc1',
            'color:#ff6500',
            changesObj
        );
    }
    OnInit(pTNode: TNode | undefined, Tnode: elementNode) {
        console.log(
            '%cfirstDirective: %cOnInit',
            'color: #2c5dc1',
            'color: blue',
            pTNode,
            Tnode
        );
        Tnode.native!.setAttribute(
            'style',
            'width: 200px;background-color: #f9838396;'
        );
    }
    OnDestroy() {
        console.log('%cmyComponent: %cOnDestroy', 'color:green', 'color:red');
    }
}
export { firstDirective };
