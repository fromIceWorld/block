import { elementType } from '../../@compiler/Enums/elementType';
import { Instruction } from '../../@compiler/instruction/index';
import { TViewFns } from '../../@compiler/instruction/InstructionContext/index';
import { ViewContainer } from '../../@compiler/template/embedded/index';
import { Inject } from '../../decorators/params/inject';
import { Router } from '../routerModule/router';

class RouterView {
    static selector = 'route';
    constructor(
        @Inject(Router) private router: Router,
        @Inject(ViewContainer) private viewContainer: ViewContainer
    ) {
        if (router) {
            router.subscribe(viewContainer);
        }
        console.log('所在的 viewContainer', this.viewContainer);
    }
    OnDestroy() {}
    OnInit() {
        console.log('router-view', this.viewContainer);
    }
    OnInputChanges(ctx) {
        console.log('@Inject路由', this.router);
        let ran = Math.random();
        if (ran > 0.5) {
            let instructionIns = new Instruction();
            instructionIns.createFactory([
                {
                    tagName: 'app-demo',
                    closed: true,
                    children: [],
                    type: elementType.Element,
                    attributes: [],
                },
            ]);
            let paramsString = Array.from(instructionIns.instructionParams),
                paramsFns = paramsString.map((key) => TViewFns[key]),
                componentDef = instructionIns.componentDef!(...paramsFns);
            this.viewContainer.def = componentDef;
        } else {
            let instructionIns = new Instruction();
            instructionIns.createFactory([
                {
                    tagName: 'app-child',
                    closed: true,
                    children: [],
                    type: elementType.Element,
                    attributes: [],
                },
            ]);
            let paramsString = Array.from(instructionIns.instructionParams),
                paramsFns = paramsString.map((key) => TViewFns[key]),
                componentDef = instructionIns.componentDef!(...paramsFns);
            this.viewContainer.def = componentDef;
        }
        console.log('router-view', this.viewContainer);
        return [{}];
    }
}
export { RouterView };
