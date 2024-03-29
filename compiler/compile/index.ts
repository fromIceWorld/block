import { parseTemplate } from 'parse-html-template';
import { Instruction } from '../instruction/index';

/**
 * 解析组件，生成指令集函数
 * @param parse 解析 template
 * @param instruction 指令集函数集合
 */
class compiler {
    parse: parseTemplate;
    instruction: Instruction;
    instructionContext: any;
    constructor(
        parse: parseTemplate,
        instruction: Instruction,
        instructionContext: any
    ) {
        this.parse = parse;
        this.instruction = instruction;
        this.instructionContext = instructionContext;
    }
    transform(component: any) {
        let { template } = component;
        let tokenTree = this.parse.parse(template);
        this.instruction.createFactory(tokenTree as any);
        let paramsString = Array.from(this.instruction.instructionParams),
            paramsFns = paramsString.map((key) => this.instructionContext[key]);
        let componentDef = this.instruction.componentDef!(...paramsFns);
        return componentDef;
    }
    transformByTNodes() {}
}
export { compiler };
