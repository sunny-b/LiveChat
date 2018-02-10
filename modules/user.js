class User {
  constructor(socket) {
    this.exceptions = new Set();
    this.added = false;
    this.socket = socket;
    this.pairId = null;
    this.username = null;
    this.id = socket.id;
  }

  addException(id) {
    this.exceptions.add(id);
  }

  canConnectTo(otherUser) {
    return !this.exceptions.has(otherUser.id) &&
           !otherUser.exceptions.has(this.socket.id);
  }

  emit(evt, data) {
    this.socket.emit(evt, data);
  }

  broadcast(evt, data, pairId = this.pairId) {
    this.socket.to(pairId).emit(evt, data);
  }
}

module.exports = User;
