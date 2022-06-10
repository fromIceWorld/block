# Block

## 进度

- [x] 数据与view绑定更新。
- [ ] 更好的分层, 代码逻辑
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

