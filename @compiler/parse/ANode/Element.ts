import { elementType } from '../../Enums/index';
import { Position } from '../position/index';

/**
 * @param tagName 标签名称
 */
class ElementANode {
    tagName: string;
    attributes: Array<string> = new Array();
    closed: boolean;
    children: Array<ElementANode> = new Array();
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
export { ElementANode };
