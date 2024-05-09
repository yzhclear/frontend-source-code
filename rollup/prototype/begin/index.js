const fs = require('fs')
const acorn = require('acorn')
const MagicString =require('magic-string')

const code = fs.readFileSync('./source.js').toString()

const ast = acorn.parse(code, {
  sourceType: 'module',
  ecmaVersion: 7,
})
// console.log(ast)

const declarations = {}
const statement = []

// 遍历， 查找变量声明
ast.body
  .filter((v) => v.type === 'VariableDeclaration')
  .map((v) => {
    declarations[v.declarations[0].id.name] = v
  })
// console.log(declarations)

// 遍历， 将声明放在调用前
ast.body.filter((v) => v.type !== 'VariableDeclaration').map(node => {
  statement.push(declarations[node.expression.callee.name])
  statement.push(node)
})
// console.log(statement);

// 导出
const m = new MagicString(code)
console.log('-----------');
statement.map(node => {
  console.log(m.snip(node.start, node.end).toString());
})
console.log('-----------');
