## 一. 原型、Treeshaking、AST

Tree-shaking的本质是消除无用的js代码。

1. 读取代码文件， 将代码转换成AST抽象语法树
2. 遍历抽象语法树， 查找变量声明
3. 遍历抽象语法树，找出调用方法的语句， 将上一步找出的变量声明语句放在调用语句前
4. 处理导出

## 二. 节点遍历器

上面的代码比较简单(prototype/begin/source.js)，
```js
const a = () => 1
const b = () => 2
a()
``` 
一层作用域。没有任何嵌套的作用域，或者函数， 因此遍历AST比较简单。

但是对于正常的代码文件， 通常比较复杂， 因此需要实现节点遍历器，来遍历AST树。

这个节点遍历器其实就是遍历一个抽象语法树， 这个抽象语法树可以抽象成一个多叉树。
不过， 和普通的遍历树不同的是， 遍历抽象语法树时， 叶子节点不需要遍历到。

代码如下：
```js
function walk(ast, {enter, leave}) {
  visit(ast, null, enter, leave)
}

function visit(node, parent, enter, leave) {
  if (!node) return

  if (enter) {
    enter.call(null, node, parent)
  }

  // 对象遍历
  const children = Object.keys(node).filter(key => typeof node[key] === 'object')

  children.forEach(childKey => {
    const child = node[childKey]
    visit(child, node, enter, leave)
  })

  if (leave) {
    leave(node, parent)
  }
}


module.exports = walk

// 运行测试用例
// ./node_modules/.bin/jest ./lib/__tests__/walk.spec.js
```

### 练习
使用节点遍历器, 打印函数作用域
```js
const a = 1
function f1() {
    const b = 2
    function f2() {
        const c = 3
    }
}
```
输出为:
```js
variable: a
function: f1
    variable: b
    function: f2
        variable: c
```
参考 funcScope/index.js代码

## 三.构建作用域
通过节点遍历器，可以分析出函数作用域, 变量声明。
现在需要将分析出的函数作用域及变量声明存储起来。

构建一个树形作用域

## 四. 模块分析函数 
* 构建函数作用域
* 局部变量定义 _defines
* 变量依赖外部模块 _dependsOn 
* 此语句是否被引用 _included
* 语句内容 _source