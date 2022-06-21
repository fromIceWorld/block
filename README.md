# Block

## 进度

- [x] 数据与view绑定更新。
- [ ] 更好的分层, 代码逻辑,依赖注入
- [x] 父子传值
- [x] 组件生命周期
- [ ] 指令生命周期
- [ ] 更多的指令[for, if,...]
- [x] slot
- [ ] 路由
- [ ] web components支持
- [ ] ...



## 更新逻辑

将template编译成指令集，从而将组件区分成两种状态[create, update]。

`create`: 创建静态DOM。

`update`: 由于数据的更改，引发页面的更改,精准更新对应DOM[ 编译支持 ]。

## 分层

### platform

```
平台控制Block的核心能力: parseHtml, Instruction, renderDomAPI,Injector。
```

### application

```
一个运行中的项目。
```

### module

```
用于隔离组件,指令,pipe等。
```

## 父子传值

### 父->子

获取节点上的所有属性，但只接收特定的属性。

```typescript
`@Input(inputKey)
 localKey
`
1.引入时机，在组件实例化前,因为init时可能使用
2.在父组件更新后，因为需要给子组件最新值所以在attach，detecchange运行前更新最新值



```

### 子->父

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

### component

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

### directive

```typescript
功能：
1.更改属性 
2.拓展模板 for，if,同组件迁移模板

`OnInserted`: host插入到parent后
`OnInputChanges`: 输入属性更改时
`OnInit`: 初始化
`OnDestroy`: host属性更改引起的指令销毁

```

