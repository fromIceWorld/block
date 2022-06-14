# Block

## 进度

- [x] 数据与view绑定更新。
- [ ] 更好的分层, 代码逻辑,依赖注入
- [x] 父子传值
- [ ] 生命周期
- [ ] 更多的指令[for, if,...]
- [ ] slot
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

