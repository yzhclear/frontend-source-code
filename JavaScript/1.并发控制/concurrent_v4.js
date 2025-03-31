class TaskPool {
  constructor(maxConcurrent = 20) {
    this.maxConcurrent = maxConcurrent
    this.running = 0
    this.tasks = []
  }

  async add(task) {
    if (this.running >= this.maxConcurrent) {
      await new Promise((resolve) => this.tasks.push(resolve))
    }
    this.running++
    try {
      await task()
    } finally {
      this.running--
      if (this.tasks.length > 0) {
        const next = this.tasks.shift()
        next()
      }
    }
  }
}


// ============= 测试用例 =============
async function testTaskPool() {
  const maxConcurrent = 3
  const pool = new TaskPool(maxConcurrent)
  let activeTasks = 0
  let completedTasks = 0
  const totalTasks = 10

  function createTask(id) {
    return async () => {
      const delay = Math.floor(Math.random() * 2000) + 5000 // 生成 300ms ~ 1000ms 之间的随机时间
      activeTasks++
      console.log(`Task ${id} started, active tasks: ${activeTasks}, estimated time: ${delay}ms`)
      if (activeTasks > maxConcurrent) {
        console.error(`Error: More than ${maxConcurrent} tasks running!`)
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
      activeTasks--
      completedTasks++
      console.log(`Task ${id} completed, remaining active: ${activeTasks}`)
      console.log('completedTasks count: ', completedTasks);
    }
  }

  for (let i = 0; i < totalTasks; i++) {
    pool.add(createTask(i))
  }
}

testTaskPool()
