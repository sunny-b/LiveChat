class ChatApp {
  constructor(io) {
    this.pairs = [];
    this.waitingList = [];
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
      socket.exceptions = new Set();

      socket.on('add user', this.addUser(socket));
      socket.on('disconnect', this.dropUser(socket));
      socket.on('new message', this.addMessage(socket));
    });
  }

  addMessage(socket) {
    let localSocket = socket;

    return (message, pairId) => {
      // we tell the client to execute 'new message'
      localSocket.to(pairId).emit('new message', {
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
      this.findPair(localSocket);

      // echo globally (all clients) that a person has connected
      // localSocket.broadcast.emit('user joined', {
      //   username: localSocket.username
      // });
    }
  }

  findPair(user) {
    let complement = this.findComplement(user);

    if (complement) {
      this.removeFromWaiting(complement);
      this.createPair(user, complement);
    } else {
      this.waitingList.push(user);
    }
  }

  removeFromWaiting(user) {
    let idx = this.waitingList.indexOf(user);
    this.waitingList.splice(idx, 1);
  }

  findComplement(user) {
    for (let i = 0; i < this.waitingList.length; i++) {
      let complement = this.waitingList[i];
      if (this.canConnect(user, complement)) {
        return complement;
      }
    }

    return null;
  }

  canConnect(userOne, userTwo) {
    return !userOne.exceptions.has(userTwo.id) &&
           !userTwo.exceptions.has(userOne.id);
  }

  createPair(userOne, userTwo) {
    const pair = [userOne, userTwo];
    this.pairs.push(pair);

    userOne.to(userTwo.id).emit('user joined', {
      username: userOne.username,
      pairId: userOne.id
    });

    userTwo.to(userOne.id).emit('user joined', {
      username: userTwo.username,
      pairId: userTwo.id
    });
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
