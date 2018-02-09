const WaitList = require('./waitlist');
const User = require('./user');

class ChatApp {
  constructor(io) {
    this.waitlist = new WaitList();
    this.io = io;
  }

  init() {
    this.attachIOEvents();
  }

  // bind Socket.IO events to io connection
  attachIOEvents() {
    this.io.on('connection', (socket) => {
      let user = new User(socket);

      socket.on('add user', this.addUser(user));
      socket.on('disconnect', this.dropUser(user));
      socket.on('new message', this.addMessage(user));
      socket.on('typing', this.addTyping(user));
      socket.on('stop typing', this.stopTyping(user));
      socket.on('hop', this.handleHop(user));
      socket.on('find new pair', this.findNewPairFor(user));
    });
  }

  handleHop(user) {
    return () => {
      if (!user.pairId) return;
      let pairId = user.pairId;

      user.addException(pairId);
      user.pairId = null;
      this.findPair(user);

      user.broadcast('user left', {
        username: user.username
      });
    }
  }

  findNewPairFor(user) {
    return () => {
      user.pairId = null;
      this.findPair(user);
    }
  }

  addTyping(user) {
    return () => {
      if (!user.pairId) return;

      user.broadcast('typing', {
        username: user.username
      });
    }
  }

  stopTyping(user) {
    return () => {
      if (!user.pairId) return;

      user.broadcast('stop typing', {
        username: user.username
      });
    }
  }

  addMessage(user) {
    return (message) => {
      if (!user.pairId) return;
      // send message to pair
      user.broadcast('new message', {
        username: user.username,
        message: message
      });
    }
  }

  addUser(user) {
    return (username) => {
      if (user.added) return;
      // we store the username in the user session for this client
      user.username = username;
      user.added = true;
      user.emit('login');
      this.findPair(user);
    }
  }

  findPair(user) {
    let complement = this.waitlist.findComplement(user);

    if (complement) {
      this.waitlist.remove(complement);
      this.createPair(user, complement);
    } else {
      this.waitlist.add(user);
      user.emit('waiting');
    }
  }

  createPair(userOne, userTwo) {
    userOne.pairId = userTwo.id;
    userTwo.pairId = userOne.id;

    userOne.broadcast('user joined', {
      username: userOne.username,
      pairId: userOne.id
    });

    userTwo.broadcast('user joined', {
      username: userTwo.username,
      pairId: userTwo.id
    });
  }

  dropUser(user) {
    return () => {
      this.waitlist.remove(user);
      if (user.added && user.pairId) {
        user.broadcast('user left', {
          username: user.username
        });
      }
    }
  }
}

module.exports = ChatApp;
