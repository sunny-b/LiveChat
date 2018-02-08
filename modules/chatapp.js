class ChatApp {
  constructor(io) {
    this.io = io;
    this.numUsers = 0;
    this.addedUser = false;
  }

  init() {
    this.attachIOEvents();
  }
  // bind Socket.IO events to io connection
  attachIOEvents() {
    this.io.on('connection', (socket) => {
      this.socket = socket;

      socket.on('add user', this.addUser);
      socket.on('disconnect', this.dropUser);
      socket.on('new message', this.addMessage);
    });
  }

  addMessage(message) {
    // we tell the client to execute 'new message'
    this.socket.broadcast.emit('new message', {
      username: this.socket.username,
      message: data
    });
  }

  addUser(username) {
    if (this.addedUser) return;

    // we store the username in the socket session for this client
    this.socket.username = username;
    this.numUsers++;
    this.addedUser = true;
    this.socket.emit('login', {
      numUsers: numUsers
    });

    // echo globally (all clients) that a person has connected
    this.socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  }

  dropUser() {
    if (this.addedUser) {
      this.numUsers--;

      // echo globally that this client has left
      this.socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  }
}

module.exports = ChatApp;
