import { elementType } from '../../Enums/index';
import { Position } from '../position/index';

/**
 * @param content 文本字符串
 * @param startPosition 开始位置
 * @param startPosition 结束位置
 */
class TextANode {
    content: string;
    type = elementType.Text;
    startPosition: Position;
    endPosition: Position;
    constructor(
        content: string,
        startPosition: Position,
        endPosition: Position
    ) {
        this.content = content;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }
}
export { TextANode };
