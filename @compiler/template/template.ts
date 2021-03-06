import { EventEmitter } from '../../common/event/EventEmitter';
import { ConstructortInterface, ObjectInterface } from '../../common/interface';
import { InjectChanges, InjectKeys, InputKeys } from '../../decorators/index';
import { InputChanges } from '../../decorators/prop/Input';
import { EventChanges, EventKeys } from '../../decorators/prop/Output';
import { StaticInjector } from '../../Injector/index';
import { Hook } from '../../lifeCycle/index';
import { TViewIndex } from '../Enums/TView';
import { elementNode } from './TNode/index';
import { LogicView } from './TView/LogicView';
import { TemplateView } from './TView/TemplateView';

enum ViewMode {
    create = 1,
    update,
}
const offset = 20;

class TemplateDynamic extends Array {
    [TViewIndex.Host]?: Element | HTMLTemplateElement;
    [TViewIndex.RootElements]: number[] = [];
    [TViewIndex.TNode]?: elementNode;
    [TViewIndex.LView]?: LogicView;
    [TViewIndex.Parent]?: TemplateView;
    [TViewIndex.Children]: number[] = [];
    [TViewIndex.Directives]: Set<number> = new Set();
    [TViewIndex.Class]?: ConstructortInterface;
    [TViewIndex.Context]: ObjectInterface<any> = {};
    [TViewIndex.ComponentDef]?: {
        template: Function;
        attributes: Array<string | number>;
    };
    [TViewIndex.Slots]?: Object;
    [TViewIndex.Injector]?: StaticInjector;
    [TViewIndex.Module]: any;
    [TViewIndex.InRange] = () => {
        return this[TViewIndex.Module] && this[TViewIndex.Module]['moduleCore']
            ? this[TViewIndex.Module]['moduleCore'].inRange || []
            : this[TViewIndex.Parent]![TViewIndex.InRange];
    };
    [TViewIndex.References]: ObjectInterface<number[]> = {};
    [TViewIndex.EmbeddedView]: Array<ObjectInterface<any>> = new Array();
    constructor() {
        super();
        Object.setPrototypeOf(this, TemplateDynamic.prototype);
    }
    injectProviders() {
        let providers =
            Object.getOwnPropertyDescriptor(this[TViewIndex.Class], 'providers')
                ?.value || [];
        this[TViewIndex.Injector] = new StaticInjector(providers);
    }
    /**
     * ?????? input ??????,??????????????????
     *
     */
    updateInput() {
        // ????????????
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let tNode = this[TViewIndex.TNode],
            { finAttributes } = tNode as elementNode,
            inputKeys = this[TViewIndex.Class]!.prototype[InputKeys] || [],
            inputChanges = this[TViewIndex.Context][InputChanges];
        for (let [localKey, inputKey] of Object.entries(
            inputKeys as ObjectInterface<string>
        )) {
            let value = finAttributes[inputKey],
                firstChange = !inputChanges[localKey],
                currentValue = firstChange
                    ? undefined
                    : inputChanges[localKey]['currentValue'];
            inputChanges[localKey] = {
                inputKey,
                currentValue: value,
                previousValue: currentValue,
                firstChange,
            };
        }
        Hook(this[TViewIndex.Context], 'OnInputChanges', inputChanges);
    }
    // ??????output??????,??? EventEmitter,????????? mid????????????emit
    createOutput() {
        // ????????????
        if (!this[TViewIndex.TNode]) {
            return;
        }
        let host = this[TViewIndex.Host],
            outputKeys: ObjectInterface<string> =
                this[TViewIndex.Context][EventKeys] || [],
            outputEventObj = Object.create({});
        for (let [key, type] of Object.entries(outputKeys)) {
            outputEventObj[key] = {
                currentValue: new EventEmitter(type, {
                    detail: {
                        dom: host,
                    },
                }),
            };
        }
    }
    // ????????????????????????mid
    InstanceInjects() {
        // ????????????
        // if (!this[TViewIndex.TNode]) {
        //     return;
        // }
        const injectKeys = this[TViewIndex.Context][InjectKeys] || [],
            injectChanges = this[TViewIndex.Context][InjectChanges],
            injector = this[TViewIndex.Injector];
        for (let [key, provideToken] of Object.entries(injectKeys)) {
            injectChanges[key] = {
                currentValue: injector?.get(provideToken),
            };
        }
    }
    // ???context ???@Input???@Output???@Inject??????
    mergeContextAndDecorators() {
        let middleLayer = this[TViewIndex.Context],
            context = new this[TViewIndex.Class]!();
        Object.setPrototypeOf(context, middleLayer);
        for (let cache of Object.getOwnPropertySymbols(middleLayer)) {
            for (let [key, value] of Object.entries(
                middleLayer[cache] as ObjectInterface<any>
            )) {
                Object.defineProperty(context, key, {
                    get() {
                        return middleLayer[cache][key].currentValue;
                    },
                    set(v) {
                        throw Error(
                            `%c${key}??????@Input,@Output,@Inject???????????????,????????????!`
                        );
                    },
                });
            }
        }
        this[TViewIndex.Context] = context;
    }
    /**
     * ???????????????????????????????????????????????????
     */
    initContext() {
        let tNode = this[TViewIndex.TNode],
            dir = this[TViewIndex.Class];
        return insertMiddleLayer(dir!);
    }
    /**
     * ??????????????????context???@Input???@Output???@Inject???
     */
    createContext() {
        this.updateInput();
        this.createOutput();
        this.InstanceInjects();
        this.mergeContextAndDecorators();
    }
}
/**
 * ???context??? class????????????????????????????????????input???output???inject??????
 *
 *
 * @param constructor ??????/?????????class
 * @param key
 */
function insertMiddleLayer(constructor: ObjectInterface<any>) {
    let upper = constructor.prototype,
        middle = Object.create(upper);
    middle[InputChanges] = Object.create({});
    middle[EventChanges] = Object.create({});
    middle[InjectChanges] = Object.create({});
    return middle;
}
export { TemplateDynamic, offset, ViewMode, insertMiddleLayer };
