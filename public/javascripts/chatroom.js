class ChatRoom {
  constructor() {
    this.login = document.querySelector('.login');
    this.chat = document.querySelector('.chat');
    this.messages = document.querySelector('.messages')
    this.usernameInput = document.querySelector('.username-input');
    this.messageInput = document.querySelector('.message-input');
    this.messageForm = document.querySelector('.message-form');
    this.sendButton = document.querySelector('.send-button');

    this.TYPING_TIMER_LENGTH = 400; //ms
    this.SLASH_COMMANDS = new Set(['/delay', '/hop']);
    this.connected = false;
    this.typing = false;
    this.socket = io();

    this.attachBrowserEvents();
    this.attachSocketEvents();
  }

  displayChat() {
    this.usernameInput.removeEventListener('keydown', this.addUser);
    this.login.classList.add('hide');
    this.chat.classList.remove('hide');
    this.messageInput.focus();
  }

  retrieveUsername() {
    return this.usernameInput.value.trim();
  }

  retrieveAndParseMessage() {
    const rawMessage = this.retrieveMessage();
    return this.parseMessage(rawMessage);
  }

  retrieveMessage() {
    return this.messageInput.value.trim();
  }

  parseMessage(message) {
    const splitStr = message.split(' ');
    const command = splitStr[0];
    const delay = splitStr[1];

    switch(command) {
      case '/hop':
        return [command];
      case '/delay':
        if (String(Number(delay)) === delay) {
          let messageBody = splitStr.slice(2).join(' ');

          return [`${command} ${delay}`, messageBody];
        } else {
          return ['', message];
        }
      default:
        return [ '', message];
    }
  }

  addUser(e) {
    if (e.which === 13) {
      const username = this.retrieveUsername();

      if (username) {
        this.username = username;
        this.displayChat();
        this.socket.emit('add user', username);
      }
    }
  }

  attachBrowserEvents() {
    this.usernameInput.addEventListener('keydown', this.addUser.bind(this));
    this.messageInput.addEventListener('keyup', this.toggleInput.bind(this));
    this.messageInput.addEventListener('keydown', this.updateTyping.bind(this));
    this.messageForm.addEventListener('submit', this.handleMessage.bind(this));
  }

  updateTyping(e) {
    if (this.connected) {
      if (!this.typing) {
        this.typing = true;
        this.socket.emit('typing');
      }

      this.lastTypingTime = (new Date()).getTime();

      setTimeout(() => {
        const typingTimer = (new Date()).getTime();
        const timeDiff = typingTimer - this.lastTypingTime;
        if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
          this.socket.emit('stop typing');
          this.typing = false;
        }
      }, this.TYPING_TIMER_LENGTH);
    }
  }

  toggleInput(e) {
    const message = this.retrieveMessage();

    if (message) {
      this.sendButton.disabled = false;
    } else {
      this.sendButton.disabled = true;
    }
  }

  handleMessage(e) {
    e.preventDefault();
    const [ command, message ] = this.retrieveAndParseMessage();

    if (command) {
      this.execute(command, message);
    } else if (message) {
      this.sendMessage(message);
    }
  }

  execute(command, message) {
    let [ slashCommand, delayTime ] = command.split(' ');

    if (slashCommand === '/delay' && message) {
      this.sendDelayedMessage(message, delayTime);
    } else if (slashCommand === '/delay') {
      this.sendMessage(command);
    } else if (slashCommand === '/hop') {
      this.handleHop();
    }
  }

  handleHop() {
    this.addLogMessage('Find you a new pair...');
    this.clearInputField();
    this.socket.emit('hop');
  }

  sendDelayedMessage(message, delay) {
    this.clearInputField();

    this.addChatMessage({
      message: message,
      username: this.username,
      isSameUser: true
    });

    setTimeout(() => {
      this.socket.emit('new message', message);
    }, delay);
  }

  clearInputField() {
    this.typing = false;
    this.lastTypingTime = (new Date()).getTime();
    this.messageInput.value = "";
    this.sendButton.disabled = true;
    this.socket.emit('stop typing');
  }

  sendMessage(message) {
    this.clearInputField();

    this.addChatMessage({
      message: message,
      username: this.username,
      isSameUser: true
    });

    this.socket.emit('new message', message);
  }

  addTypingMessage(data) {
    data.message = 'is typing...'
    data.typing = true;

    this.addChatMessage(data);
  }

  removeTypingMessage() {
    const typingEl = document.querySelector('.message.typing');
    if (typingEl) typingEl.parentNode.removeChild(typingEl);
  }

  addChatMessage(data) {
    const usernameSpan = document.createElement('span');
    const messageBody = document.createElement('span')
    const messageEl = document.createElement('li');

    if (data.isSameUser) usernameSpan.classList.add('same');
    usernameSpan.classList.add('username');
    usernameSpan.innerText = data.username;

    messageBody.classList.add('message-body');
    messageBody.innerText = data.message;

    if (data.typing) messageEl.classList.add('typing');
    messageEl.classList.add('message');
    messageEl.appendChild(usernameSpan);
    messageEl.appendChild(messageBody);

    this.addMessage(messageEl);
  }

  addLogMessage(message) {
    let logEl = document.createElement('li')
    logEl.classList.add('log');
    logEl.innerText = message;

    this.addMessage(logEl);
  }

  addMessage(element) {
    this.messages.appendChild(element);
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  attachSocketEvents() {
    // Whenever the server emits 'login', log the login message
    this.socket.on('login', () => {
      // Display the welcome message
      this.addLogMessage('Welcome to Wonder Chat!')
    });

    // Whenever the server emits 'new message', update the chat body
    this.socket.on('new message', (data) => {
      this.addChatMessage(data);
    });

    // Whenever server emits 'waiting', let user know they are next in line
    this.socket.on('waiting', () => {
      this.addLogMessage('You will be connected to the next available user.');
    });

    // Whenever the server emits 'user joined', log it in the chat body
    this.socket.on('user joined', (data) => {
      this.connected = true;
      this.addLogMessage(`You have been connected to ${data.username}.`);
    });

    // Whenever the server `emit`s 'user left', log it in the chat body
    this.socket.on('user left', (data) => {
      this.connected = false;
      this.removeTypingMessage();
      this.addLogMessage(`${data.username} has left.`);
      this.socket.emit('find new pair')
    });

    // Whenever the server emits 'typing', show the typing message
    this.socket.on('typing', (data) => {
      this.addTypingMessage(data);
    });

    // Whenever the server emits 'stop typing', kill the typing message
    this.socket.on('stop typing', (data) => {
      this.removeTypingMessage();
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.addLogMessage('you have been disconnected');
    });

    this.socket.on('reconnect', () => {
      this.addLogMessage('you have been reconnected');
      if (this.username) {
        this.connected = false;
        this.socket.emit('add user', this.username);
      }
    });

    this.socket.on('reconnect_error', () => {
      this.addLogMessage('attempt to reconnect has failed');
    });
  }
};
