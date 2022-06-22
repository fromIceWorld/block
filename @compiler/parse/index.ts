import { elementType } from '../Enums/index';
import { CommentANode, ElementANode, TextANode } from './ANode/index';
import { Position } from './position/index';
const EscapeCharacter = ['\n'];
/**
 * 解析template,生成 tokenTree
 * @param template html字符串
 */
class ParseTemplate {
    template: string = '';
    startIndex = 0;
    endIndex: number = 0;
    row = 1;
    column = 1;
    root: Array<Element> = [];
    elements: Array<any> = [];
    errors: Array<any> = [];
    constructor() {}
    parse(template: string) {
        this.init(template);
        while (this.startIndex <= this.endIndex) {
            // 以 <开头的 标签
            if (this.template[this.startIndex] == '<') {
                if (this.template.startsWith('<!--', this.startIndex)) {
                    // 注释
                    this.attempNotes();
                } else if (
                    this.startIndex + 2 <= this.endIndex &&
                    this.template[this.startIndex + 1] == '/' &&
                    this.template[this.startIndex + 1] !== ' '
                ) {
                    // 闭合标签
                    this.attemptClosedElement();
                } else if (
                    this.startIndex + 1 <= this.endIndex &&
                    this.template[this.startIndex + 1] !== ' '
                ) {
                    // 可能是标签 <div>
                    this.attemptOpenTag();
                } else {
                    // 无效的标签，就是文本 =>【< div>】
                    this.attempText();
                }
            } else {
                // 文本
                this.attempText();
            }
        }
        return this.root;
    }
    init(template: string) {
        this.template = template;
        this.startIndex = 0;
        this.endIndex = template.length - 1;
        this.row = 1;
        this.column = 1;
        this.root = [];
        this.elements = [];
        this.errors = [];
    }
    linkParentChild(element: any) {
        if (this.elements.length > 0) {
            let parent = this.elements[this.elements.length - 1];
            parent.children.push(element);
            element.parent = parent;
        }
        this.insert(element);
    }
    // 是否将节点推入栈中
    insert(element: any) {
        let { type, parent } = element;
        if (type !== elementType.Text && type !== elementType.Comment) {
            this.elements.push(element);
        } else {
            if (!parent) {
                this.root.push(element);
            }
        }
    }
    // 过滤空字符,存储有效的attribute
    filterWhiteSpace(container: Array<string>, str: string) {
        if (str !== '') {
            container.push(str);
        }
    }
    closedElement(tagName: string) {
        let endPosition = this.position();
        if (this.elements.length > 0) {
            if (this.elements[this.elements.length - 1].tagName == tagName) {
                let element = this.elements.pop();
                element.endPosition = endPosition;
                this.column++;
                if (this.elements.length == 0) {
                    this.root.push(element);
                }
                return;
            }
        }
        throw Error(
            `${tagName} 未找到匹配的开始标签。行:${this.row};列:${this.column};`
        );
    }
    // 闭合标签: </tagName>
    attemptClosedElement() {
        let closed = this.matchString('>');
        if (closed) {
            let { index, nextColumn, nextRow } = closed;
            let closeTagName = this.template.substring(
                this.startIndex + 2,
                index
            );
            this.row = nextRow;
            this.column = nextColumn;
            this.startIndex = index + 1;
            this.closedElement(closeTagName);
        } else {
            this.attempText();
        }
    }
    // 处理文本数据
    attempText() {
        // 找下一个 <
        let nextTag = this.matchString('<'),
            startPosition = this.position(),
            endPosition,
            elementText;
        if (nextTag) {
            let { index, nextColumn, nextRow } = nextTag;
            endPosition = this.position(nextRow, nextColumn);
            elementText = new TextANode(
                this.template.substring(this.startIndex, index).trim(),
                startPosition,
                endPosition
            );
            this.row = nextRow;
            this.column = nextColumn;
            this.startIndex = index;
        } else {
            endPosition = this.position(Infinity, Infinity);
            elementText = new TextANode(
                this.template.substring(this.startIndex).trim(),
                startPosition,
                endPosition
            );
            this.column = Infinity;
            this.startIndex = this.template.length;
        }
        // 可能遇到无效文本:[\n]
        if (elementText.content && elementText.content.trim()) {
            // 将当前元素插入树
            this.linkParentChild(elementText);
        }
    }
    // 找到value的闭合区域： name = "**" 中的 value: "**"
    attemptValue(start: number) {
        let endIndex = this.template.indexOf(this.template[start], start + 1);
        return endIndex;
    }
    // 开始标签
    attemptOpenTag() {
        let from = this.startIndex + 1,
            row = this.row,
            column = this.column; // 越过 '<'
        let key = '',
            attrs: Array<any> = [];
        let elementStart;
        while (from <= this.endIndex) {
            let code = this.template[from];
            // 处理单/双引号
            if (code == '"' || code == "'") {
                let marks = this.matchString(code, from + 1, column, row);
                if (marks) {
                    let { index, nextColumn, nextRow } = marks;
                    let value = this.template.substring(from + 1, index);
                    column = nextColumn;
                    row = nextRow;
                    attrs.push(value);
                    from = index + 1;
                } else {
                    // 无闭合的双引号，就是文本
                    key += code;
                    from++;
                    column++;
                }
            } else if (
                code == ' ' ||
                code == '\n' ||
                code == '=' ||
                code == '>'
            ) {
                if (code == ' ' || code == '\n') {
                    if (code == '\n') {
                        row++;
                        column = 1;
                    }
                    this.filterWhiteSpace(attrs, key);
                    key = '';
                } else if (code == '=') {
                    attrs.push(key, '=');
                    key = '';
                } else if (code == '>') {
                    // 遇到结束符号>, 存储最后解析的属性,越过无效字符【' ','\n'】
                    this.filterWhiteSpace(attrs, key);
                    from++;
                    column++;
                    break;
                }
                let { nextFrom, nextColumn, nextRow } = this.crossWhiteSpace(
                    from + 1,
                    row,
                    column + 1
                );
                from = nextFrom;
                column = nextColumn;
                row = nextRow;
            } else {
                key += code;
                from++;
                column++;
            }
        }
        // 当解析属性时，越界，说明未遇到>,当前解析的字符非标签，而是文本
        if (from == this.template.length) {
            elementStart = new TextANode(
                this.template.substring(this.startIndex),
                this.position(row, column),
                this.position(Infinity, Infinity)
            );
        } else {
            let tagName = attrs[0],
                closed = attrs[attrs.length - 1] == '/',
                attributes = attrs.slice(
                    1,
                    closed ? attrs.length - 1 : attrs.length
                );
            if (tagName !== ' ') {
                let startPosition = this.position();
                this.row = row;
                this.column = column;
                // 检测标签有效性
                elementStart = new ElementANode(
                    tagName,
                    attributes,
                    closed,
                    startPosition
                );
                // 自闭和标签
                if (closed) {
                    this.closedElement(tagName);
                } else {
                    this.linkParentChild(elementStart);
                }
                // 移动光标
                this.startIndex = from;
            } else {
                // 标签无效时，按照文本处理；
                this.attempText();
            }
        }
    }
    // 解析注释
    attempNotes() {
        // 注释/文本
        let closed = this.matchString('-->');
        if (closed) {
            let { index, nextRow, nextColumn } = closed;
            let startoPosition = this.position(),
                content = this.template.substring(this.startIndex + 4, index);
            this.column = nextColumn;
            this.row = nextRow;
            let endPosition = this.position(),
                ElementComment = new CommentANode(
                    content,
                    startoPosition,
                    endPosition
                );
            this.linkParentChild(ElementComment);
            this.startIndex = index + 3;
            this.column++;
        } else {
            this.attempText();
        }
    }
    /**
     * 替代 indexOf函数【需要统计 row，column】
     *
     * @param str 查找的目标字符
     * @param from 起始点
     * @param column 行
     * @param row 列
     * @returns  index 目标索引; nextRow:行; nextColumn:列; offset: 下一个起始点
     *
     */
    matchString(
        str: string,
        from = this.startIndex,
        column = this.column,
        row = this.row
    ) {
        let length = str.length;
        let i = from,
            j = from + length;
        while (i <= this.endIndex) {
            if (this.template.substring(i, j) == str) {
                return {
                    index: i,
                    nextRow: row,
                    nextColumn: column + length - 1,
                };
            } else {
                // 换行字符
                if (EscapeCharacter.includes(this.template[i])) {
                    row++;
                    column = 1;
                } else {
                    column++;
                }
            }
            i++;
            j++;
        }
        return false;
    }
    position(row = this.row, column = this.column) {
        return new Position(row, column);
    }
    // 去除多余空白字符
    crossWhiteSpace(start: number, row: number, column: number) {
        while (this.template[start] == ' ' || this.template[start] == '\n') {
            if (this.template[start] == ' ') {
                column++;
            }
            if (this.template[start] == '\n') {
                row++;
                column = 1;
            }
            start++;
        }
        return {
            nextFrom: start,
            nextRow: row,
            nextColumn: column,
        };
    }
}
(window as any)['parse'] = ParseTemplate;

export { ParseTemplate };
