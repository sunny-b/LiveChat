class ChatRoom {
  constructor() {
    this.login = document.querySelector('.login');
    this.chat = document.querySelector('.chat');
    this.messages = document.querySelector('.messages')
    this.usernameInput = document.querySelector('.username-input');
    this.messageInput = document.querySelector('.message-input');
    this.messageForm = document.querySelector('.message-form');
    this.sendButton = document.querySelector('.send-button');
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

  retrieveMessage() {
    return this.messageInput.value.trim();
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
    this.messageForm.addEventListener('submit', this.sendMessage.bind(this));
  }

  toggleInput(e) {
    const message = this.retrieveMessage();

    if (message) {
      this.sendButton.disabled = false;
    } else {
      this.sendButton.disabled = true;
    }
  }

  sendMessage(e) {
    e.preventDefault();
    const message = this.retrieveMessage();

    if (message) {
      this.messageInput.value = "";
      this.sendButton.disabled = true;
      this.addChatMessage(message, this.username)
      this.socket.emit('new message', message);
    }
  }

  addChatMessage(message, username) {
    const usernameSpan = document.createElement('span');
    const messageBody = document.createElement('span')
    const messageEl = document.createElement('li');

    usernameSpan.classList.add('username');
    usernameSpan.innerText = username;

    messageBody.classList.add('message-body');
    messageBody.innerText = message;

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
  }

  attachSocketEvents() {
    // Whenever the server emits 'login', log the login message
    this.socket.on('login', () => {
      // Display the welcome message
      const message = "Welcome to Wonder Chat – ";
      this.addLogMessage(message);
    });

    // Whenever the server emits 'new message', update the chat body
    this.socket.on('new message', (data) => {
      this.addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    this.socket.on('user joined', (data) => {
      this.addLogMessage(data.username + ' joined');
    });

    // Whenever the server emits 'user left', log it in the chat body
    this.socket.on('user left', (data) => {
      this.addLogMessage(data.username + ' left');
    });

    // Whenever the server emits 'typing', show the typing message
    // socket.on('typing', function (data) {
    //   addChatTyping(data);
    // });

    // Whenever the server emits 'stop typing', kill the typing message
    // socket.on('stop typing', function (data) {
    //   removeChatTyping(data);
    // });

    this.socket.on('disconnect', () => {
      this.addLogMessage('you have been disconnected');
    });

    this.socket.on('reconnect', () => {
      this.addLogMessage('you have been reconnected');
      if (this.username) {
        socket.emit('add user', username);
      }
    });

    this.socket.on('reconnect_error', () => {
      this.addLogMessage('attempt to reconnect has failed');
    });
  }
};
