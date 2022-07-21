import { elementNode } from '../@compiler/template/TNode/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { Input } from '../decorators/index';

class firstDirective {
    @Input('name')
    arr: any;
    name = '第一个指令';
    static selector = '[data-angular]';
    constructor() {
        console.log('实例化指令');
    }
    OnInit(native: Element, Tnode: elementNode) {
        console.log(
            '%cfirstDirective: %cOnInit',
            'color: #2c5dc1',
            'color: blue',
            native,
            Tnode
        );
    }
    Oninserted(native: Element) {
        console.log(
            '%cfirstDirective: %cOninserted',
            'color:#2c5dc1',
            'color:#ff6500',
            native
        );
    }
    OnInputChanges(changesObj: any) {
        console.log(
            '%cfirstDirective: %cOnInputChanges',
            'color:#2c5dc1',
            'color:#ff6500',
            changesObj
        );
    }
    OnViewUpdateed(tView: TemplateView) {
        console.log(
            '%cfirstDirective: %cOnViewUpdateed',
            'color:#2c5dc1',
            'color:#ff6500',
            tView
        );
    }
    OnDestroy() {
        console.log('%cmyComponent: %cOnDestroy', 'color:green', 'color:red');
    }
}
export { firstDirective };
