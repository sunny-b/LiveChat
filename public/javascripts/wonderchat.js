import ChatMessage from './message';
import ChatView from './view';

class WonderChat {
  constructor() {
    this.username = null;
    this.socket = io();
    this.view = new ChatView()

    this.attachSocketEvents();
    this.attachViewEvents();
  }

  attachViewEvents() {
    this.view.on('add user', username => this.handleAddUser(username));
    this.view.on('new message', message => this.handleNewMessage(message));
    this.view.on('typing', () => this.socket.emit('typing'));
    this.view.on('stop typing', () => this.socket.emit('stop typing'));
  }

  handleAddUser(username) {
    this.username = username;
    this.socket.emit('add user', username);
  }

  handleNewMessage(messageStr) {
    const message = new ChatMessage(messageStr);

    if (message.hasCommand()) {
      this.execute(message);
    } else if (!message.isEmpty()) {
      this.sendMessage(message.body);
    }
  }

  execute(message) {
    if (message.hasDelayCommand()) {
      this.sendDelayedMessage(message.body, message.delayTime());
    } else if (message.hasHopCommand()) {
      this.handleHop();
    }
  }

  handleHop() {
    this.view.clearInputField();
    this.view.addLogMessage('Finding you a new pair...');
    this.socket.emit('hop');
  }

  sendDelayedMessage(message, delay) {
    this.view.sameUserMessage(message, this.username);

    setTimeout(() => {
      this.socket.emit('new message', message);
    }, delay);
  }

  sendMessage(message) {
    this.view.sameUserMessage(message, this.username);

    this.socket.emit('new message', message);
  }

  attachSocketEvents() {
    // Whenever the server emits 'login', log the login message
    this.socket.on('login', () => {
      // Display the welcome message
      this.view.addLogMessage('Welcome to Wonder Chat!')
    });

    // Whenever the server emits 'new message', update the chat body
    this.socket.on('new message', (data) => {
      this.view.addChatMessage(data);
    });

    // Whenever server emits 'waiting', let user know they are next in line
    this.socket.on('waiting', () => {
      this.view.addLogMessage('You will be connected to the next available user.');
    });

    // Whenever the server emits 'user joined', log it in the chat body
    this.socket.on('user joined', (data) => {
      this.view.addLogMessage(`You have been connected to ${data.username}.`);
    });

    // Whenever the server `emit`s 'user left', log it in the chat body
    this.socket.on('user left', (data) => {
      this.view.removeTypingMessage();
      this.view.addLogMessage(`${data.username} has left.`);
      this.socket.emit('find new pair')
    });

    // Whenever the server emits 'typing', show the typing message
    this.socket.on('typing', (data) => {
      this.view.addTypingMessage(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    this.socket.on('stop typing', (data) => {
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
};

export default WonderChat;
