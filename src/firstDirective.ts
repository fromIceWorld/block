class firstDirective {
    name = '第一个指令';
    static selector = '[data-angular]';
    OnInit() {
        console.log(
            '%cfirstDirective: %cOnInit',
            'color: #2c5dc1',
            'color: blue'
        );
    }
    OnInserted(parent: Element, current: Element) {
        console.log(
            `%cfirstDirective: %chost插入parent后`,
            'color: #2c5dc1',
            'color: blue'
        );
        console.log(parent, current);
    }
    OnInputChanges(changesObj: any) {
        console.log(
            '%cfirstDirective: %cOnInputChanges',
            'color:#2c5dc1',
            'color:#ff6500',
            changesObj
        );
    }
    OnDestroy() {
        console.log('%cmyComponent: %cOnDestroy', 'color:green', 'color:red');
    }
}
export { firstDirective };
