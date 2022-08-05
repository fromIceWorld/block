import { parseTemplate } from 'parse-html-template';
import { compiler } from '../@compiler/compile/index';
import { Instruction } from '../@compiler/instruction/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { ViewContainer } from '../@compiler/template/embedded/index';
import { TemplateView } from '../@compiler/template/TView/TemplateView';
import { Injector, StaticProvider } from '../Injector/index';
import { Application, PlatformRef } from './application';

/**
 * 平台提供依赖：
 *      编译template的函数，指令集view函数，平台class，依赖注入
 */

const CORE_PROVIDES: StaticProvider[] = [
    { provide: PlatformRef, deps: [Injector], useClass: PlatformRef },
    { provide: TemplateView, useValue: TemplateView },
    { provide: ViewContainer, useValue: ViewContainer },
    {
        provide: compiler,
        deps: [parseTemplate, Instruction, TViewFns],
        useClass: compiler,
    },
    {
        provide: Instruction,
        deps: [],
        useClass: Instruction,
    },
    {
        provide: parseTemplate,
        deps: [],
        useClass: parseTemplate,
    },
    {
        provide: TViewFns,
        useValue: TViewFns,
    },
    { provide: Injector, deps: [], useClass: Injector },
    { provide: Application, deps: [], useClass: Application },
];
const PlatformCore = CORE_PROVIDES;
export { PlatformCore };
