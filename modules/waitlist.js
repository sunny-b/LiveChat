class WaitList {
  constructor() {
    this.list = [];
  }

  add(user) {
    this.list.push(user);
  }

  remove(user) {
    const idx = this.list.indexOf(user);
    if (idx >= 0) this.list.splice(idx, 1);
  }

  findComplement(user) {
    for (let i = 0; i < this.list.length; i += 1) {
      const complement = this.list[i];

      if (user.canConnectTo(complement)) {
        return complement;
      }
    }

    return null;
  }
}

module.exports = WaitList;
