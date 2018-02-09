'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChatRoom = function () {
  function ChatRoom() {
    _classCallCheck(this, ChatRoom);

    this.login = document.querySelector('.login');
    this.chat = document.querySelector('.chat');
    this.messages = document.querySelector('.messages');
    this.usernameInput = document.querySelector('.username-input');
    this.messageInput = document.querySelector('.message-input');
    this.messageForm = document.querySelector('.message-form');
    this.sendButton = document.querySelector('.send-button');
    this.socket = io();

    this.attachBrowserEvents();
    this.attachSocketEvents();
  }

  _createClass(ChatRoom, [{
    key: 'displayChat',
    value: function displayChat() {
      this.usernameInput.removeEventListener('keydown', this.addUser);
      this.login.classList.add('hide');
      this.chat.classList.remove('hide');
      this.messageInput.focus();
    }
  }, {
    key: 'retrieveUsername',
    value: function retrieveUsername() {
      return this.usernameInput.value.trim();
    }
  }, {
    key: 'retrieveMessage',
    value: function retrieveMessage() {
      return this.messageInput.value.trim();
    }
  }, {
    key: 'addUser',
    value: function addUser(e) {
      if (e.which === 13) {
        var _username = this.retrieveUsername();

        if (_username) {
          this.username = _username;
          this.displayChat();
          this.socket.emit('add user', _username);
        }
      }
    }
  }, {
    key: 'attachBrowserEvents',
    value: function attachBrowserEvents() {
      this.usernameInput.addEventListener('keydown', this.addUser.bind(this));
      this.messageInput.addEventListener('keyup', this.toggleInput.bind(this));
      this.messageForm.addEventListener('submit', this.sendMessage.bind(this));
    }
  }, {
    key: 'toggleInput',
    value: function toggleInput(e) {
      var message = this.retrieveMessage();

      if (message) {
        this.sendButton.disabled = false;
      } else {
        this.sendButton.disabled = true;
      }
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(e) {
      e.preventDefault();
      var message = this.retrieveMessage();

      if (message) {
        this.messageInput.value = "";
        this.sendButton.disabled = true;
        this.addChatMessage(message, this.username, true);
        this.socket.emit('new message', message);
      }
    }
  }, {
    key: 'addChatMessage',
    value: function addChatMessage(message, username) {
      var isSameUser = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var usernameSpan = document.createElement('span');
      var messageBody = document.createElement('span');
      var messageEl = document.createElement('li');

      if (isSameUser) usernameSpan.classList.add('same');
      usernameSpan.classList.add('username');
      usernameSpan.innerText = username;

      messageBody.classList.add('message-body');
      messageBody.innerText = message;

      messageEl.classList.add('message');
      messageEl.appendChild(usernameSpan);
      messageEl.appendChild(messageBody);

      this.addMessage(messageEl);
    }
  }, {
    key: 'addLogMessage',
    value: function addLogMessage(message) {
      var logEl = document.createElement('li');
      logEl.classList.add('log');
      logEl.innerText = message;

      this.addMessage(logEl);
    }
  }, {
    key: 'addMessage',
    value: function addMessage(element) {
      this.messages.appendChild(element);
    }
  }, {
    key: 'attachSocketEvents',
    value: function attachSocketEvents() {
      var _this = this;

      // Whenever the server emits 'login', log the login message
      this.socket.on('login', function () {
        // Display the welcome message
        var welcomeMessages = ['Welcome to Wonder Chat!', 'You will be connected to the next available user.'];

        welcomeMessages.forEach(function (message) {
          return _this.addLogMessage(message);
        });
      });

      // Whenever the server emits 'new message', update the chat body
      this.socket.on('new message', function (data) {
        _this.addChatMessage(data.message, data.username);
      });

      // Whenever the server emits 'user joined', log it in the chat body
      this.socket.on('user joined', function (data) {
        _this.addLogMessage(data.username + ' joined');
      });

      // Whenever the server emits 'user left', log it in the chat body
      this.socket.on('user left', function (data) {
        _this.addLogMessage(data.username + ' left');
      });

      // Whenever the server emits 'typing', show the typing message
      // socket.on('typing', function (data) {
      //   addChatTyping(data);
      // });

      // Whenever the server emits 'stop typing', kill the typing message
      // socket.on('stop typing', function (data) {
      //   removeChatTyping(data);
      // });

      this.socket.on('disconnect', function () {
        _this.addLogMessage('you have been disconnected');
      });

      this.socket.on('reconnect', function () {
        _this.addLogMessage('you have been reconnected');
        if (_this.username) {
          socket.emit('add user', username);
        }
      });

      this.socket.on('reconnect_error', function () {
        _this.addLogMessage('attempt to reconnect has failed');
      });
    }
  }]);

  return ChatRoom;
}();

;
