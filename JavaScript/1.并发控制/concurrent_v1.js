/** 
 * 使用 Promise.all
 * 
 * Promise.all 没有并发控制能力，一瞬间会将全部请求发出，从而造成前面提到的浏览器卡顿问题
 */

function get(id) {
  return new Promise((resolve) => {
    setTimeout(() => {resolve({id})}, Math.ceil(Math.random() * 5) * 1000)
  })
}

function gets(ids, max) {
  return Promise.all(ids.map(id => get(id)))
}


// ============= 测试用例 =============
async function test() {
  console.time('测试耗时');
  
  // 准备测试数据
  const ids = Array.from({length: 100}, (_, i) => i + 1);
  
  try {
    // 执行并发请求
    const results = await gets(ids, 3);
    console.log('请求结果:', results);
  } catch (err) {
    console.error('测试出错:', err);
  }
  
  console.timeEnd('测试耗时');
}

// 运行测试
test();