import { AttributeType } from '../Enums/attributeType';
import { elementType } from '../Enums/index';
import { TemplateView } from '../TView/TemplateView';

class elementNode {
    type: number = elementType.Element;
    tagName: string;
    native?: Element;
    directives: Function[] = new Array();
    component: Function[] = new Array();
    attributes = new Array();
    TView?: TemplateView;
    constructor(
        tagName: string,
        dynamicStyle: string[][],
        dynamicClasses: string[][],
        attributes: Object = {},
        events: Object = {},
        dynamicAttributes: { [propName: string]: string[] } = {}
    ) {
        this.tagName = tagName;
        this.attributes[AttributeType.dynamicStyle] = dynamicStyle.map(
            (fnConfig) => new Function(...fnConfig)
        );
        this.attributes[AttributeType.dynamicClass] = dynamicClasses.map(
            (fnConfig) => new Function(...fnConfig)
        );
        this.attributes[AttributeType.staticAttribute] = attributes;
        this.attributes[AttributeType.event] = events;
        this.attributes[AttributeType.dynamicAttrubute] = Object.create({});
        Object.keys(dynamicAttributes).map((key) => {
            this.attributes[AttributeType.dynamicAttrubute][key] = new Function(
                ...dynamicAttributes[key]
            );
        });
    }
}
class textNode {
    type: number = elementType.Text;
    content: string;
    constructor(content: string) {
        this.content = content;
    }
}
class commentNode {
    type: number = elementType.Comment;
    content: string;
    constructor(content: string) {
        this.content = content;
    }
}
export { elementNode, textNode, commentNode };
