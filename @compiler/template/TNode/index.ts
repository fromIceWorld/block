import { ObjectInterface } from '../../../common/interface';
import { AttributeType } from '../../Enums/attributeType';
import { elementType } from '../../Enums/index';
import { TemplateView } from '../TView/TemplateView';
/**
 * @public finAttributes 静态属性与动态属性合并后的最终attributes
 */
class elementNode {
    type: number = elementType.Element;
    tagName: string;
    index: number;
    native?: Element;
    attributes = new Array();
    directives: ObjectInterface<any>[] = [];
    component?: Function;
    children: number[] = [];
    parent: number = -1;
    TView?: TemplateView;
    finAttributes: ObjectInterface<any>;
    references;
    structures;
    constructor(
        tagName: string,
        index: number,
        dynamicStyle: string[][],
        dynamicClasses: string[][],
        attributes: Object = {},
        events: Object = {},
        dynamicAttributes: ObjectInterface<any> = {},
        references: ObjectInterface<string>,
        structures: ObjectInterface<string>
    ) {
        this.tagName = tagName;
        this.index = index;
        this.attributes[AttributeType.dynamicStyle] = dynamicStyle.map(
            (fnConfig) => new Function(...fnConfig)
        );
        this.attributes[AttributeType.dynamicClass] = dynamicClasses.map(
            (fnConfig) => new Function(...fnConfig)
        );
        this.attributes[AttributeType.staticAttribute] = attributes;
        this.finAttributes = Object.assign({}, attributes);
        this.attributes[AttributeType.event] = events;
        this.attributes[AttributeType.dynamicAttrubute] = Object.create({});
        Object.keys(dynamicAttributes).map((key) => {
            this.attributes[AttributeType.dynamicAttrubute][key] = new Function(
                ...dynamicAttributes[key]
            );
        });
        this.references = references;
        this.structures = structures;
    }
}
class textNode {
    type: number = elementType.Text;
    content: string;
    native: Text;
    parent: number = -1;
    constructor(content: string, native: Text) {
        this.content = content;
        this.native = native;
    }
}
class commentNode {
    type: number = elementType.Comment;
    content: string;
    native: Comment;
    parent: number = -1;
    constructor(content: string, native: Comment) {
        this.content = content;
        this.native = native;
    }
}
export { elementNode, textNode, commentNode };
