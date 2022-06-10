class firstDirective {
    name = '第一个指令';
    static selector = '[data-angular]';
    init() {
        console.log('init');
    }
    insert(parent: Element, current: Element) {
        console.log('insert', parent, current);
    }
    beforePropertyUpdate() {
        console.log('beforePropertyUpdate');
    }
    afterPropertyUpdate() {
        console.log('afterPropertyUpdate');
    }
    afterHostUpdate() {
        console.log('afterHostUpdate');
    }
}
export { firstDirective };
