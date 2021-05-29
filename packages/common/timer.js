class Timer {
  constructor(name) {
    this.name = name;
    this.startTime = Date.now();
  }
  end() {
    const now = Date.now();
    const timeDiff = (now - this.startTime) / 1000;
    console.log(this.name, timeDiff);
  }
}
module.exports = Timer;