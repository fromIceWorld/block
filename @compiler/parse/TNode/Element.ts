import { elementType } from '../Enum/index';
import { Position } from '../position/index';

/**
 * @param tagName 标签名称
 */
class ElementTNode {
    tagName: string;
    attributes: Array<string> = new Array();
    closed: boolean;
    children: Array<ElementTNode> = new Array();
    type: number = elementType.Element;
    startPosition: Position;
    constructor(
        tagName: string,
        attributes: Array<string>,
        closed: boolean,
        startPosition: Position
    ) {
        this.tagName = tagName;
        this.attributes = attributes;
        this.closed = closed;
        this.startPosition = startPosition;
    }
}
export { ElementTNode };
