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
      socket.on('typing', this.addTyping(socket));
      socket.on('stop typing', this.stopTyping(socket));
    });
  }

  addTyping(socket) {
    return () => {
      if (!socket.pairId) return;

      socket.to(socket.pairId).emit('typing', {
        username: socket.username
      });
    }
  }

  stopTyping(socket) {
    return () => {
      if (!socket.pairId) return;

      socket.to(socket.pairId).emit('stop typing', {
        username: socket.username
      });
    }
  }

  addMessage(socket) {
    return (message) => {
      if (!socket.pairId) return;
      // send message to pair
      socket.to(socket.pairId).emit('new message', {
        username: socket.username,
        message: message
      });
    }
  }

  addUser(socket) {
    return (username) => {
      if (socket.addedUser) return;

      // we store the username in the socket session for this client
      socket.username = username;
      socket.addedUser = true;
      socket.emit('login');
      this.findPair(socket);
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

    userOne.pairId = userTwo.id;
    userTwo.pairId = userOne.id;

    userOne.to(userOne.pairId).emit('user joined', {
      username: userOne.username,
      pairId: userOne.id
    });

    userTwo.to(userTwo.pairId).emit('user joined', {
      username: userTwo.username,
      pairId: userTwo.id
    });
  }

  removePair(user) {

  }

  dropUser(socket) {
    return () => {
      if (socket.addedUser && socket.pairId) {
        socket.to(socket.pairId).emit('user left', {
          username: socket.username
        });

        this.removePair(socket);
      }
    }
  }
}

module.exports = ChatApp;
