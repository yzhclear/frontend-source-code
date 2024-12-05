/** 
 * 使用 Promise.all 分批次更新。
 * 
 * 这种方法的优势在于实现相对简单，容易理解。
 * 但是它的缺点是，每一批请求中的最慢的请求会决定整个批次的完成时间，
 * 这可能会导致一些批次的其他请求早早完成后需要等待，从而降低整体的并发效率
 * 
 */

function get(id) {
    return new Promise((resolve) => {
      setTimeout(() => {resolve({id})}, Math.ceil(Math.random() * 5) * 100)
    })
  }

// 并发控制实现方法， 每次并发 max 个请求， 使用递归实现
function gets(ids, max) {
    let result = []
    let index = 0

    function nextBatch() {
        const batch = ids.slice(index, index + max)
        index += max

        return Promise.all(batch.map(id => get(id))).then(res => {
            result.push(...res)
            if (index < ids.length) {
                return nextBatch()
            }
            return result
        })
    }

    return nextBatch()
}

// ============= 测试用例 =============
async function test() {
    console.time('测试耗时');
    
    // 准备测试数据
    const ids = Array.from({length: 100}, (_, i) => i + 1);
    
    try {
      // 执行并发请求
      const results = await gets(ids, 10);
      console.log('请求结果:', results);
    } catch (err) {
      console.error('测试出错:', err);
    }
    
    console.timeEnd('测试耗时');
  }
  
// 运行测试
test();

