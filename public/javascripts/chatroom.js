class ChatRoom {
  constructor() {
    this.login = document.querySelector('.login');
    this.chat = document.querySelector('.chat');
    this.messages = document.querySelector('.messages')
    this.usernameInput = document.querySelector('.username-input');
    this.messageInput = document.querySelector('.message-form');
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

  addUser(e, _this) {
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
    this.messageInput.addEventListener('submit', this.addMessage.bind(this));
  }

  addChatMessage(username, message) {
    
  }

  addLogMessage(message) {
    let logEl = document.createElement(li).classList.add('log');
    logEl.innerText = message;

    this.messages.appendChild(logEl);
  }

  attachSocketEvents() {
    // Whenever the server emits 'login', log the login message
    socket.on('login', function (data) {
      // Display the welcome message
      var message = "Welcome to Wonder Chat – ";
      addLogMessage(message);
    });

    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', function (data) {
      addChatMessage(data);
    });

    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', function (data) {
      addLogMessage(data.username + ' joined');
    });

    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', function (data) {
      addLogMessage(data.username + ' left');
    });

    // Whenever the server emits 'typing', show the typing message
    // socket.on('typing', function (data) {
    //   addChatTyping(data);
    // });

    // Whenever the server emits 'stop typing', kill the typing message
    // socket.on('stop typing', function (data) {
    //   removeChatTyping(data);
    // });

    socket.on('disconnect', function () {
      addLogMessage('you have been disconnected');
    });

    socket.on('reconnect', function () {
      addLogMessage('you have been reconnected');
      if (username) {
        socket.emit('add user', username);
      }
    });

    socket.on('reconnect_error', function () {
      log('attempt to reconnect has failed');
    });
  }
};
