# Block

## 进度

- [x] 数据与view绑定更新。
- [ ] 更好的分层, 代码逻辑, 生命周期, 依赖注入
- [x] 父子传值  `@Input` `@Output`
- [ ] 组件生命周期
- [ ] 指令生命周期
- [x] 依赖注入  `@inject`
- [x] 更多的结构性指令[for, if,...]
- [x] slot
- [ ] 路由
- [ ] 服务端渲染
- [ ] web components支持
- [ ] ...



## view

`EmbeddedView`, `TemplateView`,`viewContainer`

```typescript
`1.`静态视图
	 无数据绑定，无指令，组件存在的节点;
`2.`组件视图
	 组件存在的节点
`3.`嵌入视图
	 结构性指令附着的节点
```

## 指令

根据功能分两种：结构性指令，属性性指令

### 结构性指令

【控制节点的结构，但不控制生命周期】

`for`,`if`

控制template,形成一层虚拟的上下文，控制view的 显示/不渲染/循环。

```
for：根据@Input的值，去虚拟一层上下文
```

### 属性性指令

【控制节点的生命周期，但不控制结构】

```typescript
在特定的生命周期处理自定义事件
```

## 核心逻辑

将template编译成指令集，从而将组件区分成两种状态[create, update]。

1. create
   1. 创建静态节点，在节点数据中解析出指令，组件
2. update
   1. 更新绑定数据的节点上的属性
3. 指令更新
4. 组件的更新

## 逻辑分层

### platform[core]

```typescript
平台控制Block的核心能力: 
`parseHtml`: 解析template
`Instruction`:根据nodeTree，生成view的指令集
`Injector`: 依赖注入
```

### environment[dynamic]

```typescript
运行环境[browser/...]
`renderDomAPI`:将抽象数据渲染成真实节点的API     
```

### application

```
一个运行的实例。
```

### module

```typescript
用于隔离组件,指令,pipe等, 使代码之间耦合度更低，方便低代码拆分。
```

## 组件传值

### @Input

获取节点上的所有属性，但只接收特定的属性。

```typescript
`@Input(inputKey)
 localKey
`
1.引入时机，在组件实例化前,因为init时可能使用
2.在父组件更新后，因为需要给子组件最新值所以在attach，detecchange运行前更新最新值



```

### @Output

```typescript
1.区分原生事件和自定义事件 [修饰符<vue>,]
2.不区分事件类型,通过配置确定事件的传播范围[√]。
	装饰器记录emit的key值，在实例化组件时，获取key值，生成自定义事件及所绑定的dom,在emit时触发dispatch事件
```

## slot

```html
'父组件':
<app-component>
	<span slot="first-slot"></span>
</app-component>
'子组件':
<slot name = 'first-slot'></slot>

1.组件记录子节点在父视图上的索引[TViewIndex.Slots],在slot节点渲染时，在父视图的slot中查找name匹配的节点
```

## 生命周期

### 指令

```typescript
`普通指令`:操作所附着的节点
	init:指令初始化[native被创建],输入到指令的值是静态的的值
	inserted:当前指令附加的节点及子节点创建后[已经有native及children节点]
	inputChanges: 当前节点数据更新
    viewUpdateed:当前指令所在的view更新后
    destroy：指令销毁[节点上的指令属性消失，节点销毁]
    
`结构性指令`:只控制结构
	*forOf
	*if
```

### 组件

## View

视图：`EmbeddedView`, `TemplateView`

### EmbeddedView

`嵌入视图`：结构性指令有关[for, if,....]

```typescript
结构性指令可对view产生影响, 独立出来更容易处理;
----------------------------------------------
`1`: 结构性指令 --创建--> viewContainer 
`2`: view生命周期 --触发--> viewContainer生命周期
`3`: viewContainer生命周期 --触发--> 更新指令的@Input属性
`4`: 指令更改后的上下文 传递给 viewContainer 作为diff

`diff，比较数据`
```

### TemplateView

`广度优先`

```typescript
生命周期依据指令集函数分离`create`, `update`,
------------------------------------------
OnInit: 当前view初始化
OnSlotInit: 插槽内容初始化
OnViewInit: 子view初始化
OnInputChanges: 输入属性更改[第一次更改后的更改]
OnSlotChecked: 插槽内容检查更新后
OnViewChecked: 子view检查更新后

OnDestroy: view被销毁时

`create`: OnInit, OnSlotInit, OnViewInit
`update`: OnInputChanges, OnSlotChecked, OnViewChecked

`destroy`: OnDestroy
```

## 结构性指令

- [x] for 
- [x] if
- [ ] 多指令串行
- [ ] 子组件递归

## css选择器

将组件/指令 与template上的节点结合。

```typescript
`1.` 支持基础选择器 ✔
	   只解析基础的css selecor，放弃后代选择器及更复杂的选择器
`2.` 支持queryselector❌
		当页面中元素过多时，需要查询较复杂
```

## template上下文

### 组件

```typescript
组件实例 -> @Input数据，@Output数据 -> prototype
```

### 指令

```typescript
渲染上下文：@Input -> 所在的view上下文
```

## 坑

1. template节点只能[clone、importNode]内联的事件，无法复制`addEventListener`的事件

   ```html
   1. 内联 <div onClick="console.log"></div>
   2. addEventListener
   ```

2. template.content内只能加入node，node的事件无法留存


# TODO

## 插值语法✔ 

```typescript
`1.` 无插值
`2.` 普通插值:   {{ desc1 }},{{desc2}},更多的插值{{desc3}}
`3.` 对象插值:  {{ obj.desc }},{{obj.desc2}},更多的插值{{obj['desc3']}}
`4.` 数组插值:  {{ arr[1] }}，数组插值{{ arr[2] }}
`5.` 作用域插值: {{ arr[index] }} 
`6.` 1-5组合：  {{obj.arr[index]}}

`支持的语法较多,语法解析较复杂，采取作用域：`
将表达式解析成纯函数：with(ctx){
    ....
}

`缺点`：with语句，执行速度慢
```

## 多指令并行✔

```typescript
`1.`简单节点: <div *for="arr", *if="item"><div>
`2.`组件节点: <app-child *for="arr", *if="item"><app-child>  
    
'1' 多指令pipe处理上下文：`多层嵌套时处理同一个view，指令的生命周期交叉`
	 指令处理的是context，如果pipe处理，逻辑不通畅
        
'2' 不支持多指令并行： `缺少逻辑，例如 for if 无法操作一个标签`

'3' 将结构性指令分层处理：`上下文需要分层, 上下文处理`
		在编译时分层指令✔
        节点绑定的事件上下文已经改变为指令上下文 ❌
```

## 组件/指令 生命周期



## 流畅的数据及逻辑流转

