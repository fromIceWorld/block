import { elementType } from '../../@compiler/Enums/elementType';
import { Instruction } from '../../@compiler/instruction/index';
import { TViewFns } from '../../@compiler/instruction/InstructionContext/index';
import { Inject } from '../../decorators/index';
import { Router } from '../routerModule/router';

class RouterView {
    @Inject(Router) router;
    static selector = 'route';
    constructor(private viewContainer) {
        console.log('所在的 viewContainer', this.viewContainer);
    }
    OnDestroy() {}
    OnInit() {
        console.log('router-view', this.viewContainer);
    }
    OnInputChanges(ctx) {
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
