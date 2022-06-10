import { Position } from '../position/index';
class syntaxError {
    position: Position;
    desc: string;
    constructor(desc: string, position: Position) {
        this.position = position;
        this.desc = desc;
    }
}
export { syntaxError };
