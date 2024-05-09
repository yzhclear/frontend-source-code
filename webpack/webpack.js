const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const babel = require("@babel/core");

function getModuleInfo(file) {
  const fileContent = fs.readFileSync(file, 'utf-8')

  // 解析成ast语法树
  const ast = parser.parse(fileContent, {
    sourceType: 'module' //表示解析的是ES模块
  })

  // 遍历ast语法树, 找出所有的import, 标记为当前文件的依赖, 并拼接出路径
  let deps = {}
  traverse(ast, {
    ImportDeclaration({node}) {
      const dirname = path.dirname(file)
      const abspath = './' + path.join(dirname, node.source.value)
      deps[node.source.value] = abspath
    }
  })

   // ES6转成ES5
   const { code } = babel.transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
  });
  const moduleInfo = { file, deps, code };
  return moduleInfo;
}
// const info = getModuleInfo("./src/index.js");
// console.log("info:", info);

function getDeps(temp, {deps}) {
  Object.keys(deps).forEach(key => {
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

  temp.forEach((moduleInfo)=>{
    depsGraph[moduleInfo.file] = {
      code: moduleInfo.code,
      deps: moduleInfo.deps
    }
  })

  return depsGraph
}
// const content = parseModules('./src/index.js')
// console.log("content: ", content);

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

const content = bundle('./src/index.js')
!fs.existsSync('./dist') && fs.mkdirSync('./dist')
fs.writeFileSync('./dist/bundle.js', content)
