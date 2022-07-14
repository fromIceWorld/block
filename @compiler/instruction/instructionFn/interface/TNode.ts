import { ObjectInterface } from '../../../../common/interface';
import { Position } from './position';
interface CommentTNode {
    content: string;
    type: number;
    startPosition: Position;
    endPosition: Position;
}
interface ElementTNode {
    tagName: string;
    attributes: Array<string>;
    closed: boolean;
    children: Array<number>;
    type: number;
    startPosition: Position;
    endPosition: Position;
    resolvedAttributes: Array<ObjectInterface<string | Array<string>>>;
}
interface TextTNode {
    content: string;
    type: number;
    startPosition: Position;
    endPosition: Position;
}
type AllTNode = CommentTNode | ElementTNode | TextTNode;
type TNode = ElementTNode | TextTNode;
export { CommentTNode, ElementTNode, TextTNode, TNode };
