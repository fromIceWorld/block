import { TNode } from '../@compiler/instruction/instructionFn/interface/TNode';
import { abstractTNode, elementNode } from '../@compiler/template/TNode/index';
import { Input } from '../decorators/index';

class firstDirective {
    @Input('vds')
    arr: any;
    name = '第一个指令';
    static selector = 'cvb';
    transform(tNodes: abstractTNode[]) {
        console.log(tNodes);
        return tNodes;
    }
    OnInputChanges(changesObj: any) {
        console.log(
            '%cfirstDirective: %cOnInputChanges',
            'color:#2c5dc1',
            'color:#ff6500',
            changesObj
        );
    }
    detectChanges() {}
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
