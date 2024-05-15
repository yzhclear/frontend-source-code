const acorn = require('acorn');
const MagicString = require('magic-string');
const analyse = require('../analyse');

function getCode(code) {
  return {
    ast: acorn.parse(code, {
      locations: true,
      ranges: true,
      sourceType: 'module',
      ecmaVersion: 7
    }),
    magicString: new MagicString(code)
  }
}

describe('测试 analyse', () => {
  it('_scopes _defines', () => {
    const {ast, magicString}= getCode('const a = 1')
    analyse(ast, magicString)
    // ast._scope
    expect(ast._scope.cantains('a')).toBe(true)
    expect(ast._scope.findDefiningScope('a')).toEqual(ast._scope)
    expect(ast.body[0]._defines).toEqual({a: true})
  })

  describe('_dependsOn', () => {
    it('单语句', () => {
      const {ast, magicString}= getCode('const a = 1')
      analyse(ast, magicString)
      // ast._scope
      expect(ast.body[0]._dependsOn).toEqual({a: true})
    })

    it('单语句', () => {
      const {ast, magicString}= getCode(`
      const a = 1
      function f() {
        const b = 2
      }
      `)
      analyse(ast, magicString)
      // ast._scope
      expect(ast.body[0]._dependsOn).toEqual({a: true})
      expect(ast.body[1]._dependsOn).toEqual({f: true, b: true})
    })
  })
})