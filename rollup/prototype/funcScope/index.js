const fs = require('fs')
const acorn = require('acorn')

const code = fs.readFileSync('./source.js').toString()

const ast = acorn.parse(code, {
  locations: true,
  ranges: true,
  sourceType: 'module',
  ecmaVersion: 7,
})

// console.log(ast);
const walk = require('../../lib/walk')
let indent = 0

walk(ast, {
  enter(node) {
    if (node.type === 'VariableDeclarator') {
      console.log('%svar:', ' '.repeat(indent * 4), node.id.name);
    }

    if (node.type === 'FunctionDeclaration') {
      console.log('%sfun:', ' '.repeat(indent * 4), node.id.name);
      indent ++
    }
  },
  leave(node) {
    if (node.type === 'FunctionDeclaration') {
      indent --
    }
  }
})

