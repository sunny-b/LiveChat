class ChatApp {
  constructor(io) {
    this.io;
    this.attachIOEvents()
  }

  // bind Socket.IO events to io connection
  attachIOEvents() {
    this.io.on()
  }
}

module.exports = ChatApp;
