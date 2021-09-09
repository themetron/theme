class Channel {
  constructor(v = undefined) {
    this.v = v;
  }

  value(v = undefined) {
    return typeof v === 'undefined'
      ? this.v
      : (this.v = v) && this;
  }

  percent(p = undefined) {
    return typeof p === 'undefined'
      ? this.v / 255
      : (this.v = p * 255) && this || this;
  }
}

export default Channel;
