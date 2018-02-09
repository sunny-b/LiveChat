class ChatApp {
  constructor(io) {
    this.io = io;
    this.addedUser = false;
  }

  init() {
    this.attachIOEvents();
  }
  // bind Socket.IO events to io connection
  attachIOEvents() {
    this.io.on('connection', (socket) => {
      socket.addedUser = false;

      socket.on('add user', this.addUser(socket));
      socket.on('disconnect', this.dropUser(socket));
      socket.on('new message', this.addMessage(socket));
    });
  }

  addMessage(socket) {
    let localSocket = socket;

    return (message) => {
      console.log(localSocket, message);
      // we tell the client to execute 'new message'
      localSocket.broadcast.emit('new message', {
        username: localSocket.username,
        message: message
      });
    }
  }

  addUser(socket) {
    let localSocket = socket;

    return (username) => {
      if (localSocket.addedUser) return;

      // we store the username in the socket session for this client
      localSocket.username = username;
      localSocket.addedUser = true;
      localSocket.emit('login');

      // echo globally (all clients) that a person has connected
      localSocket.broadcast.emit('user joined', {
        username: localSocket.username
      });
    }
  }

  dropUser(socket) {
    let localSocket = socket;

    return () => {
      if (localSocket.addedUser) {
        // echo globally that this client has left
        localSocket.broadcast.emit('user left', {
          username: localSocket.username
        });
      }
    }
  }
}

module.exports = ChatApp;
