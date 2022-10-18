class AsyncQueue {
  constructor(channels, onProcess) {
    this.channels = channels;
    this.onProcess = onProcess;
    this.processingCount = 0;
    this.waitList = [];
  }

  add(task) {
    if (this.processingCount < this.channels)
      return this.next(task);
    this.waitList.push(task);
  }

  next(task) {
    this.processingCount += 1;
    this.onProcess(task, () => {
      this.processingCount -= 1;
      if (this.waitList.length > 0) {
        const nextTask = this.waitList.shift();
        this.next(nextTask);
      }
    });
  }
}

module.exports = AsyncQueue;