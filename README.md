# Block

## 进度

- [x] 数据与view绑定更新。
- [ ] 更好的分层, 代码逻辑, 生命周期, 依赖注入
- [x] 父子传值  `@Input` `@Output`
- [x] 组件生命周期
- [x] 指令生命周期
- [x] 依赖注入  `@inject`
- [x] 更多的结构性指令[for, if,...]
- [x] slot
- [x] 内置form指令
- [ ] 路由
- [ ] 服务端渲染
- [ ] web components支持[输出]
- [ ] ...

## view

`EmbeddedView`, `TemplateView`,`viewContainer`

```typescript
`1.` TemplateView[组件视图] 
	    组件生成的视图
`2.` viewContainer[结构性指令生成的视图]    
		作为中间层,修改结构，生成 EmbeddedView
`3.` EmbeddedView[结构性指令作用后生成的视图]
	    嵌入视图，作为后续的view
```

### TemplateView

```typescript
编译函数将组件编译成只有`create`, `update`两个函数的指令集,
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

### EmbeddedView

```typescript
结构性指令可对view产生影响, 独立出来更容易处理;
----------------------------------------------
`1`: 结构性指令 --创建--> viewContainer                 【创建指令集时】
`2`: view生命周期 --触发--> viewContainer生命周期        【指令集执行时】
`3`: viewContainer生命周期 --触发--> 更新指令的@Input属性 【attach】
`4`: 指令更改后的上下文 传递给 viewContainer 作为diff      【detectChange】

`diff，比较数据`
```

### viewContainer

```typescript
每一个结构性指令都会创建一个`viewContainer`,作为TemplateView的 child,
当TemplateView在 detectChange时，`viewContainer`会更新指令上下文，指令根据上下文去处理数据，再把处理完的数据给`viewContainer`,`viewContainer`执行diff，控制EmbeddedView的create/update/destroy
```

## 指令

`结构性指令`，`属性性指令`

### 结构性指令

【控制节点的结构，但不控制生命周期】

`for`,`if`

```typescript
`劫持`了template的部分节点,形成一层上下文，控制view的 显示/不渲染/循环。

`劫持`：渲染的上下文与template无关，只与指令实例有关

`forOf`：根据@Input的值，去虚拟一层上下文
`if`:
```

### 属性性指令

【在节点的生命周期中执行业务逻辑，但不控制结构】

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

```typescript
一个运行的实例。运行模式：
`1.` 注册router的应用
`2.` 未注册router的基础应用
```

### module

```typescript
将业务隔离，不同的业务存在于特定的模块中,使代码之间耦合度更低，方便低代码拆分。
`1.` 单独的module渲染
`2.` 作为router中的某一个模块的module

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
	OnBind:当在节点上解析到指令时
    OnInserted:host插入到页面
	OnInit:指令初始化生命周期
		OnInputChanges: 当前节点数据更新(@Input数据)

	OnViewInit:当前指令所在的view初始化
    	OnViewUpdated:当前指令所在的view更新后(view)
    OnDestroy：指令销毁[节点上的指令属性消失，节点销毁]
    
`结构性指令`:只控制结构
	*forOf
	*if
```

### 组件

```typescript
`OnInit`          当前view初始化
`OnViewInit`      子view初始化后
`OnInputChanges`  @Input更改时
`OnViewUpdated`   子view检查更新后【OnInputChanges】
`OnDestroy`       view销毁
```

## css选择器

将组件/指令 与template上的节点结合。

```typescript
`1.` 支持queryselector❌
		当页面中元素过多时，需要查询较复杂
`2.` 支持基础选择器 ✔
	   只解析基础的css selecor，放弃后代选择器及更复杂的选择器

1 tagName              => [tagName,'*']
2 '#id'                => [id,'*']
3 [attribute]          => [attribute,null]
4 [attribute=value]    => [attribute,'value']

`只支持静态属性匹配,不考虑动态属性`        
```

## 组件/指令上下文

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

3. input节点在渲染到页面上才能启用focus函数聚焦，不然无效

   ```typescript
   
   ```

   

4. 12

## 路由体系

路由范围

```typescript
`1.` 应用 [应用注册路由, 路由引导模块,模块延申新路由]
`2.` 模块 [模块定义路由,不同的模块定义不同的路由段,在Router中延申新路由]
`3.` 应用+模块 [应用定义base路由,模块延申路由]   `可通过应用组合多个单独抽出来的module`
```

router

```typescript

```

路由定义

```typescript
规定：
`0.` 明确的组件<router-view>是渲染组件的位置
`1.` <router-view>，不接受输入属性，可以通过 queryParams传值,router配置策略,

`方式1`：
	自定义def,在def里面自定义函数检测路由的变化,自定义更新时机[router-view组件劫持了原系统,更偏底层]
`方式2`：
	增加一个container,专门操作router[混入严重]
`方式3`：
	指令保存viewContainer,在特定的时期操作viewContainer变更组件
    
```

## 组件-指令的渲染上下文

```typescript
`组件`:是组件实例 + @Input + @Inject + @Output
`结构性指令`:所在指令的context及一个虚拟上下文[index,item]。【与指令的生命周期分开讨论】
		   `指令的实例只用作生命周期`
`属性性指令`:不渲染，因此与context无关
```

## 数据 <==> view

```typescript
数据的流转/view的更新: 
	数据更改 ->view变化(触发事件) ->数据更改。这样的数据流转需要[守卫⚔]检察。
                vue[set/get，proxy],Angular[zone]。
但是低代码在 结构上是：组件拼接, 
    	  view逻辑上：view更新只有4个来源,
    组件更新来源： @Input:数据来源于parent，所以只要parent数据更新时发现会影响下级组件,调动下级检查更新
		        @Output:正常触发
				event: 更新数据 =>更新当前view =>如果数据是子级组件的@input ? =>更新子级组件	
				http: 更新数据 =>更新当前view =>如果数据是子级组件的@input ? =>更新子级组件

```

## 双向数据绑定

```typescript
% = "value": 依靠instruction指令解析成两个：
    	&value=value 
		@input = "($event)=>value = $event.target.value;this.cd.detectChanges();" 

%onChange = "value" 绑定event:change

`1.` input
	  &value/@input
`2.` text/textarea 
		&value/@input
`3.` checkbox/radio
		&checked/@change 
`4.` select
		&value/@change
```



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

## input,textarea,select✔

```typescript
双向数据绑定 % 
```

## 流畅的数据及逻辑流转

