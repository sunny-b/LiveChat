import ChatMessage from './message';

// Main Application class that serves as controller between server and view
class WonderChat {
  constructor(socket, view) {
    this.username = null;
    this.socket = socket;
    this.view = view;

    this.attachSocketListeners();
    this.attachViewListeners();
  }

  // Attach listeners to events emitted from view
  attachViewListeners() {
    this.view.on('add user', (username) => this.handleAddUser(username));
    this.view.on('new message', (message) => this.handleNewMessage(message));
    this.view.on('typing', () => this.socket.emit('typing'));
    this.view.on('stop typing', () => this.socket.emit('stop typing'));
  }

  // Handles user login. Assigns username and emits to server
  handleAddUser(username) {
    this.username = username;
    this.socket.emit('add user', username);
  }

  // Create new message and detect if slash commands are present
  handleNewMessage(messageStr) {
    const message = new ChatMessage(messageStr);

    if (message.hasCommand()) {
      this.execute(message);
    } else if (!message.isEmpty()) {
      this.sendMessage(message.body);
    }
  }

  // Execute the slash command
  execute(message) {
    if (message.hasDelayCommand()) {
      this.sendDelayedMessage(message.body, message.delayTime());
    } else if (message.hasHopCommand()) {
      this.handleHop();
    }
  }

  // Tells user new pair is being found and tells server to "hop"
  handleHop() {
    this.view.clearInputField();
    this.view.addLogMessage('Finding you a new pair...');
    this.socket.emit('hop');
  }

  // sends delayed message to server
  sendDelayedMessage(message, delay) {
    this.view.sameUserMessage(message, this.username);

    setTimeout(() => {
      this.socket.emit('new message', message);
    }, delay);
  }

  // sends normal chat message to server
  sendMessage(message) {
    this.view.sameUserMessage(message, this.username);

    this.socket.emit('new message', message);
  }

  // attachs listeners to socket.io events from server.
  attachSocketListeners() {
    this.socket.on('login', () => this.view.addLogMessage('Welcome to Wonder Chat!'));
    this.socket.on('new message', (data) => this.view.addChatMessage(data));

    this.socket.on('waiting', () => {
      this.view.addLogMessage('You will be connected to the next available user.');
    });

    this.socket.on('user joined', (data) => {
      this.view.addLogMessage(`You have been connected to ${data.username}.`);
    });

    // Whenever user leaves room, remove their typing message and let other user know
    this.socket.on('user left', (data) => {
      this.view.removeTypingMessage();
      this.view.addLogMessage(`${data.username} has left.`);
      this.socket.emit('find new pair');
    });

    this.socket.on('typing', (data) => {
      this.view.addTypingMessage(data);
    });

    this.socket.on('stop typing', () => {
      this.view.removeTypingMessage();
    });

    this.socket.on('disconnect', () => {
      this.view.addLogMessage('you have been disconnected');
    });

    this.socket.on('reconnect', () => {
      this.view.addLogMessage('you have been reconnected');
      if (this.username) {
        this.socket.emit('add user', this.username);
      }
    });

    this.socket.on('reconnect_error', () => {
      this.view.addLogMessage('attempt to reconnect has failed');
    });
  }
}

export default WonderChat;
