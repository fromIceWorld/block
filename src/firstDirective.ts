class firstDirective {
    name = '第一个指令';
    static selector = '[data-angular]';
    OnInit() {
        console.log(
            '%cfirstDirective: %c指令初始化',
            'color: #2c5dc1',
            'color: blue'
        );
    }
    OnInsert(parent: Element, current: Element) {
        console.log(
            '%cfirstDirective: %chost插入parent后',
            parent,
            current,
            'color: #2c5dc1',
            'color: blue'
        );
    }
    OnInputChanges(changesObj) {
        console.log(
            '%cfirstDirective: %cOnIputChanges',
            'color:#2c5dc1',
            'color:#ff6500'
            changesObj,

        );
    }
    OnDestroy() {
        console.log(
            '%cmyComponent: %cOnDestroy','color:green',
            'color:red'
        );
    }
}
export { firstDirective };

