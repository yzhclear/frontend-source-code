const Scope = require('../scope.js')

describe('测试Scope', () => {
  it('简单父子关系', () => {
    /**
     * const a = 1
     * function f(){
     *    b = 2
     * }
     */
    const root = new Scope({})
    root.add('a')
    const child = new Scope({
      parent: root
    })
    child.add('b')

    expect(child.cantains('b')).toBe(true)
    expect(child.cantains('a')).toBe(true)
    expect(child.findDefiningScope('a')).toBe(root)
    expect(child.findDefiningScope('b')).toBe(child)
  })
})