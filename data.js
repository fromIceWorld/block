let factory = function anonymous(
    elementStart,
    updateProperty,
    listener,
    creatText,
    updateText,
    elementEnd,
    createComment
) {
    let attributes = [
        [
            3,
            'data-angular',
            '',
            3,
            'name',
            'angular',
            1,
            'style',
            '(context)=>{\n                                                with(context){\n                                                    return {width: dataWidth}\n                                                }\n                                            }',
            6,
            'change',
            "go($event,'query')",
        ],
        null,
        [
            3,
            'style',
            'width: 100px;height: 100px;background-color:#e5e0e1;',
            1,
            'style',
            '(context)=>{\n                                                with(context){\n                                                    return {width: dataWidth}\n                                                }\n                                            }',
            0,
            'name',
            '(context)=>{\n                                                with(context){\n                                                    return block\n                                                }\n                                            }',
            6,
            'click',
            'emit($event,123)',
        ],
        [
            3,
            'class',
            'forP bindClass2',
            2,
            'class',
            '(context)=>{\n                                                with(context){\n                                                    return {bindClass1: class1,bindClass2: class2}\n                                                }\n                                            }',
        ],
        [],
    ];
    return {
        attributes,
        template: function anonymous(mode, ctx) {
            if (mode & 1) {
                elementStart('div', 0);
                listener('change', function ($event) {
                    return ctx['go']($event, 'query');
                });
                creatText(
                    1,
                    '' +
                        ctx['dataWidth'] +
                        '子元素:【' +
                        ctx['dataWidth'] +
                        '】' +
                        ctx['dataWidth'] +
                        ''
                );
                elementStart('div', 2);
                listener('click', function ($event) {
                    return ctx['emit']($event, 123);
                });
                elementEnd('div');
                elementEnd('div');
                elementStart('p', 3);
                elementEnd('p');
                elementStart('app-child', 4);
                elementEnd('app-child');
                createComment(5, ' 注释信息');
            }
            if (mode & 2) {
                updateProperty(0);
                updateText(
                    1,
                    '' +
                        ctx['dataWidth'] +
                        '子元素:【' +
                        ctx['dataWidth'] +
                        '】' +
                        ctx['dataWidth'] +
                        ''
                );
                updateProperty(2);
                updateProperty(3);
            }
        },
    };
};
let instruction = {
    componentDef: factory,
    instructionParams: new Set([
        'elementStart',
        'updateProperty',
        'listener',
        'creatText',
        'updateText',
        'elementEnd',
        'createComment',
    ]),
};
export { instruction };
