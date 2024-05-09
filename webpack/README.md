需要实现的效果：

```js
// index.js
var add = require('add.js').default
console.log(add(1, 2))

// add.js
exports.default = function (a, b) {
  return a + b
}
```

### 1. 模拟 exports

```js
exports = {}
eval('exports.default = function(a,b) {return a + b}')
exports.default(1, 3)
```

使用自运行函数来封装一下, 避免变量污染全局

```js
var exports = {}(function (exports, code) {
  eval(code)
})(exports, 'exports.default = function(a,b){return a + b}')
```

### 2. 模拟 require 函数

```js
function require(file) {
  var exports = {}
  ;(function (exports, code) {
    eval(code)
  })(exports, 'exports.default = function(a,b){return a + b}')
  return exports
}
var add = require('add.js').default
console.log(add(1, 2))
```

根据传入的文件名加载不同的模块

```js
;(function (list) {
  function require(file) {
    var exports = {}
    ;(function (exports, code) {
      eval(code)
    })(exports, list[file])
    return exports
  }

  // 入口文件
  require('index.js')
})({
  'index.js': `
    var add = require('add.js').default
    console.log(add(1 , 2))
        `,
  'add.js': `exports.default = function(a,b){return a + b}`,
})
```

## 实现步骤

### 1. 分析模块

借助 babel, 将模块解析成抽象语法树(AST)

```shell
npm i @babel/parser @babel/traverse @babel/core @babel/preset-env -S
```

- 读取文件
- 收集依赖
- 编译与 AST 解析

```js
function getModuleInfo(file) {
  const fileContent = fs.readFileSync(file, 'utf-8')

  // 解析成ast语法树
  const ast = parser.parse(fileContent, {
    sourceType: 'module', //表示解析的是ES模块
  })

  // 遍历ast语法树, 找出所有的import, 标记为当前文件的依赖, 并拼接出路径
  let deps = {}
  traverse(ast, {
    ImportDeclaration({ node }) {
      const dirname = path.dirname(file)
      const abspath = './' + path.join(dirname, node.source.value)
      deps[node.source.value] = abspath
    },
  })

  // ES6转成ES5
  const { code } = babel.transformFromAst(ast, null, {
    presets: ['@babel/preset-env'],
  })
  const moduleInfo = { file, deps, code }
  return moduleInfo
}
const info = getModuleInfo('./src/index.js')
console.log('info:', info)
```

### 2. 收集依赖

从入口模块开始根据依赖关系进行递归解析。最后将依赖关系构成为依赖图（Dependency Graph）

```js
function getDeps(temp, { deps }) {
  Object.keys(deps).forEach((key) => {
    const child = getModuleInfo(deps[key])
    temp.push(child)
    getDeps(temp, child)
  })
}

function parseModules(file) {
  const entry = getModuleInfo(file)
  const temp = [entry]
  const depsGraph = {}

  getDeps(temp, entry)

  temp.forEach((moduleInfo) => {
    depsGraph[moduleInfo.file] = {
      code: moduleInfo.code,
      deps: moduleInfo.deps,
    }
  })

  return depsGraph
}
const content = parseModules('./src/index.js')
console.log('content: ', content)
```

### 3. 生成 bundle 文件

将前两步编写的执行函数和依赖图合成起来输出最后的打包文件

```js
function bundle(file) {
  const depsGraph = JSON.stringify(parseModules(file))
  return `(function (graph) {
        function require(file) {
            function absRequire(relPath) {
                return require(graph[file].deps[relPath])
            }
            var exports = {};
            (function (require,exports,code) {
                eval(code)
            })(absRequire,exports,graph[file].code)
            return exports
        }
        require('${file}')
    })(${depsGraph})`
}

!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', content)
```
