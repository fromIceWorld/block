import { compiler } from '../@compiler/compile/index';
import { Instruction } from '../@compiler/instruction/index';
import { TViewFns } from '../@compiler/instruction/InstructionContext/index';
import { ParseTemplate } from '../@compiler/parse/index';
import { Injector, StaticProvider } from '../Injector/index';
import { PlatformRef } from './application';

/**
 * 平台提供依赖：
 *      编译template的函数，指令集view函数，平台class，依赖注入
 */

const CORE_PROVIDES: StaticProvider[] = [
    { provide: PlatformRef, deps: [Injector], useClass: PlatformRef },
    {
        provide: compiler,
        deps: [ParseTemplate, Instruction, TViewFns],
        useClass: compiler,
    },
    {
        provide: Instruction,
        deps: [],
        useClass: Instruction,
    },
    {
        provide: ParseTemplate,
        deps: [],
        useClass: ParseTemplate,
    },
    {
        provide: TViewFns,
        useValue: TViewFns,
    },
    { provide: Injector, deps: [], useClass: Injector },
];
const PlatformCore = CORE_PROVIDES;
export { PlatformCore };
