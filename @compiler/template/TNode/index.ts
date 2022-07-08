import { ObjectInterface } from '../../../common/interface';
import { AttributeType } from '../../Enums/attributeType';
import { elementType } from '../../Enums/index';
import { embeddedView, viewContainer } from '../embedded/index';
import { TemplateView } from '../TView/TemplateView';

abstract class TNode {
    clone() {}
}

/**
 * @public finAttributes 静态属性与动态属性合并后的最终attributes
 */
class elementNode extends TNode {
    type: number = elementType.Element;
    tagName: string;
    index: number;
    native?: Element;
    attributes = new Array();
    directives: ObjectInterface<any>[] = [];
    component?: Function;
    children: number[] = [];
    parent: number = -1;
    TView?: TemplateView | viewContainer | embeddedView;
    finAttributes: ObjectInterface<any>;
    constructor(
        tagName: string,
        index: number,
        dynamicStyle: string[][] = [],
        dynamicClasses: string[][] = [],
        attributes: ObjectInterface<any> = {},
        events: Object = {},
        dynamicAttributes: ObjectInterface<any> = {},
        references: ObjectInterface<string> = {},
        structures: ObjectInterface<string> = {}
    ) {
        super();
        this.tagName = tagName;
        this.index = index;
        this.attributes = [
            dynamicStyle!.map((fnConfig) => new Function(...fnConfig)),
            dynamicClasses!.map((fnConfig) => new Function(...fnConfig)),
            attributes,
            {},
            events,
            references,
            structures,
        ];
        this.finAttributes = Object.assign({}, attributes);
        Object.keys(dynamicAttributes).map((key) => {
            this.attributes[AttributeType.dynamicAttrubute][key] = new Function(
                ...dynamicAttributes[key]
            );
        });
    }
}
class textNode extends TNode {
    type: number = elementType.Text;
    content: string;
    native: Text;
    parent: number = -1;
    index: number;
    constructor(content: string, native: Text, index: number) {
        super();
        this.content = content;
        this.native = native;
        this.index = index;
    }
}
class commentNode extends TNode {
    type: number = elementType.Comment;
    content: string;
    native: Comment;
    parent: number = -1;
    constructor(content: string, native: Comment) {
        super();
        this.content = content;
        this.native = native;
    }
}
type abstractTNode = elementNode | textNode | commentNode;
export { elementNode, textNode, commentNode, abstractTNode };
