/**
 * 一个更高效的思路是使用异步并发控制，而不是简单的批处理。
 * 这种方法可以在任何时刻都保持最大数量的并发请求，而不需要等待整个批次完成。
 * 这需要我们维护一个请求池，在每个请求完成时，将下一个请求添加到请求池中，示例代码如下：
 * 
 * gets函数返回一个promise，在请求全部完成后，promise变为fulfilled状态；
 * 内部采用递归，每个请求成功和失败后，发送下一个请求；
 * 在最下面先发送max个请求到请求池中。
 */


function get(id) {
  return new Promise((resolve) => {
    setTimeout(() => {resolve({id})}, Math.ceil(Math.random() * 5) * 100)
  })
}



function gets(ids, max) {
  return new Promise((resolve) => {
    let result = []

    let curIndex = 0
    let loadCount = 0

    function load(id, index) {
      return get(id).then(
        (data) => {
          loadCount ++
          curIndex ++
          result[index] = data
          if (loadCount === ids.length) {
            resolve(result)
          }
          
          // 检查边界情况
          if (curIndex < ids.length) {
            load(ids[curIndex], curIndex)
          }
        },
        (err) => {
          result[index] = err
          loadCount++
          curIndex++
          load(ids[curIndex], curIndex)
        }
      )
    }
    
    // 先发送max个请求到请求池中
    for(let i = 0; i < max && i < ids.length; i ++){
      curIndex = i
      load(ids[i], i)
    }
  })
}


// ============= 测试用例 =============
async function test() {
  console.time('测试耗时');
  
  // 准备测试数据
  const ids = Array.from({length: 20}, (_, i) => i + 1);
  
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