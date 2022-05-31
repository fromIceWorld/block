# 简介
解析template的token树,生成指令集函数;

```typescript
一个组件会生成一个template函数(指令集函数)。分为两种模式[create, update]。
`create`:创建元素。
`update`:更新由于数据更改引起的页面元素更改。
```

实例：

```javascript
let tree = [
    {
        tagName: 'div',
        type: 1,
        attributes: [
            'data-angular',
            'name',
            '=',
            'angular',
            '&style',
            '=',
            '{width: dataWidth}',
            '@change',
            '=',
            "go($event,'query')",
        ],
        children: [
            {
                content: '{{dataWidth}}子元素:【{{dataWidth}}】{{dataWidth}}',
                type: 3,
            },
            {
                tagName: 'div',
                type: 1,
                attributes: [
                    'style',
                    '=',
                    'width: 100px;height: 100px;background-color:#e5e0e1;',
                    '&style',
                    '=',
                    '{width: dataWidth}',
                    '&name',
                    '=',
                    'block',
                    '@click',
                    '=',
                    'emit($event,123)',
                ],
            },
        ],
    },
    {
        tagName: 'p',
        type: 1,
        attributes: [
            'class',
            '=',
            'forP bindClass2',
            '&class',
            '=',
            '{bindClass1: class1,bindClass2: class2}',
        ],
    },
    {
        tagName: 'app-child',
        type: 1,
        attributes: [],
    },
    {
        type: 8,
        content: ' 注释信息',
    },
     {
        tagName: 'app-child',
        type: 1,
        attributes: [],
    },
];
```

## 指令集

```json
(function anonymous(elementStart,
                     propertyFn,
                     updateProperty,
                     listener,
                     creatText,
                     updateText,
                     elementEnd,
                     createComment,
                     cacheInstructionIFrameStates,
                     componentType
) {

            let attributes = [
                [3,"data-angular","",3,"name","angular",6,"change","go($event,'query')"],
                [3,"style","width: 100px;height: 100px;background-color:#e5e0e1;",6,"click","emit($event,123)"],
                [3,"class","forP bindClass2"],
                []];
            return {
                attributes,
                template:function anonymous(mode,ctx
) {

                if(mode & 1){ 
                        elementStart('div', 0);
                        propertyFn(0,1,'style',(context)=>{
                                                with(context){
                                                    return {width: dataWidth}
                                                }
                                            });
                        listener('change',function($event){
                                            return ctx['go']($event,'query');
                                        });
                        creatText(1,'' + ctx["dataWidth"] + '子元素:【' + ctx["dataWidth"] + '】' + ctx["dataWidth"] + '');
                        elementStart('div', 1);
                        propertyFn(1,1,'style',(context)=>{
                                                with(context){
                                                    return {width: dataWidth}
                                                }
                                            });
                        propertyFn(1,0,'name',(context)=>{
                                                with(context){
                                                    return block
                                                }
                                            });
                        listener('click',function($event){
                                            return ctx['emit']($event,123);
                                        });
                        elementEnd('div');
                        elementEnd('div');
                        elementStart('p', 2);
                        propertyFn(2,2,'class',(context)=>{
                                                with(context){
                                                    return {bindClass1: class1,bindClass2: class2}
                                                }
                                            });
                        elementEnd('p');
                        elementStart('app-child', 3);
                        elementEnd('app-child');
                        createComment(4,  注释信息);
                };
                if(mode & 2){ 
                        updateProperty(0);updateText(1,'' + ctx["dataWidth"] + '子元素:【' + ctx["dataWidth"] + '】' + ctx["dataWidth"] + '');
                        updateProperty(1);
                        updateProperty(2);
                };
            
}
            }
        
})
```
