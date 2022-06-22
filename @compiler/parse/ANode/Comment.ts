import { elementType } from '../../Enums/index';
import { Position } from '../position/index';
class CommentANode {
    content: string;
    type = elementType.Comment;
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
export { CommentANode };
