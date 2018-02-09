'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

    this.TYPING_TIMER_LENGTH = 400; //ms
    this.SLASH_COMMANDS = new Set(['/delay', '/hop']);
    this.connected = false;
    this.typing = false;
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
    key: 'retrieveAndParseMessage',
    value: function retrieveAndParseMessage() {
      var rawMessage = this.retrieveMessage();
      return this.parseMessage(rawMessage);
    }
  }, {
    key: 'retrieveMessage',
    value: function retrieveMessage() {
      return this.messageInput.value.trim();
    }
  }, {
    key: 'parseMessage',
    value: function parseMessage(message) {
      var splitStr = message.split(' ');
      var command = splitStr[0];
      var delay = splitStr[1];

      switch (command) {
        case '/hop':
          return [command];
        case '/delay':
          if (String(Number(delay)) === delay) {
            var messageBody = splitStr.slice(2).join(' ');

            return [command + ' ' + delay, messageBody];
          } else {
            return ['', message];
          }
        default:
          return ['', message];
      }
    }
  }, {
    key: 'addUser',
    value: function addUser(e) {
      if (e.which === 13) {
        var username = this.retrieveUsername();

        if (username) {
          this.username = username;
          this.displayChat();
          this.socket.emit('add user', username);
        }
      }
    }
  }, {
    key: 'attachBrowserEvents',
    value: function attachBrowserEvents() {
      this.usernameInput.addEventListener('keydown', this.addUser.bind(this));
      this.messageInput.addEventListener('keyup', this.toggleInput.bind(this));
      this.messageInput.addEventListener('keydown', this.updateTyping.bind(this));
      this.messageForm.addEventListener('submit', this.handleMessage.bind(this));
    }
  }, {
    key: 'updateTyping',
    value: function updateTyping(e) {
      var _this = this;

      if (this.connected) {
        if (!this.typing) {
          this.typing = true;
          this.socket.emit('typing');
        }

        this.lastTypingTime = new Date().getTime();

        setTimeout(function () {
          var typingTimer = new Date().getTime();
          var timeDiff = typingTimer - _this.lastTypingTime;
          if (timeDiff >= _this.TYPING_TIMER_LENGTH && _this.typing) {
            _this.socket.emit('stop typing');
            _this.typing = false;
          }
        }, this.TYPING_TIMER_LENGTH);
      }
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
    key: 'handleMessage',
    value: function handleMessage(e) {
      e.preventDefault();

      var _retrieveAndParseMess = this.retrieveAndParseMessage(),
          _retrieveAndParseMess2 = _slicedToArray(_retrieveAndParseMess, 2),
          command = _retrieveAndParseMess2[0],
          message = _retrieveAndParseMess2[1];

      if (command) {
        this.execute(command, message);
      } else if (message) {
        this.sendMessage(message);
      }
    }
  }, {
    key: 'execute',
    value: function execute(command, message) {
      var _command$split = command.split(' '),
          _command$split2 = _slicedToArray(_command$split, 2),
          slashCommand = _command$split2[0],
          delayTime = _command$split2[1];

      if (slashCommand === '/delay' && message) {
        this.sendDelayedMessage(message, delayTime);
      } else if (slashCommand === '/delay') {
        this.sendMessage(command);
      } else if (slashCommand === '/hop') {
        this.handleHop();
      }
    }
  }, {
    key: 'handleHop',
    value: function handleHop() {
      this.addLogMessage('Find you a new pair...');
      this.clearInputField();
      this.socket.emit('hop');
    }
  }, {
    key: 'sendDelayedMessage',
    value: function sendDelayedMessage(message, delay) {
      var _this2 = this;

      this.clearInputField();

      this.addChatMessage({
        message: message,
        username: this.username,
        isSameUser: true
      });

      setTimeout(function () {
        _this2.socket.emit('new message', message);
      }, delay);
    }
  }, {
    key: 'clearInputField',
    value: function clearInputField() {
      this.typing = false;
      this.lastTypingTime = new Date().getTime();
      this.messageInput.value = "";
      this.sendButton.disabled = true;
      this.socket.emit('stop typing');
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      this.clearInputField();

      this.addChatMessage({
        message: message,
        username: this.username,
        isSameUser: true
      });

      this.socket.emit('new message', message);
    }
  }, {
    key: 'addTypingMessage',
    value: function addTypingMessage(data) {
      data.message = 'is typing...';
      data.typing = true;

      this.addChatMessage(data);
    }
  }, {
    key: 'removeTypingMessage',
    value: function removeTypingMessage() {
      var typingEl = document.querySelector('.message.typing');
      if (typingEl) typingEl.parentNode.removeChild(typingEl);
    }
  }, {
    key: 'addChatMessage',
    value: function addChatMessage(data) {
      var usernameSpan = document.createElement('span');
      var messageBody = document.createElement('span');
      var messageEl = document.createElement('li');

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
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }, {
    key: 'attachSocketEvents',
    value: function attachSocketEvents() {
      var _this3 = this;

      // Whenever the server emits 'login', log the login message
      this.socket.on('login', function () {
        // Display the welcome message
        _this3.addLogMessage('Welcome to Wonder Chat!');
      });

      // Whenever the server emits 'new message', update the chat body
      this.socket.on('new message', function (data) {
        _this3.addChatMessage(data);
      });

      // Whenever server emits 'waiting', let user know they are next in line
      this.socket.on('waiting', function () {
        _this3.addLogMessage('You will be connected to the next available user.');
      });

      // Whenever the server emits 'user joined', log it in the chat body
      this.socket.on('user joined', function (data) {
        _this3.connected = true;
        _this3.addLogMessage('You have been connected to ' + data.username + '.');
      });

      // Whenever the server `emit`s 'user left', log it in the chat body
      this.socket.on('user left', function (data) {
        _this3.connected = false;
        _this3.removeTypingMessage();
        _this3.addLogMessage(data.username + ' has left.');
        _this3.socket.emit('find new pair');
      });

      // Whenever the server emits 'typing', show the typing message
      this.socket.on('typing', function (data) {
        _this3.addTypingMessage(data);
      });

      // Whenever the server emits 'stop typing', kill the typing message
      this.socket.on('stop typing', function (data) {
        _this3.removeTypingMessage();
      });

      this.socket.on('disconnect', function () {
        _this3.connected = false;
        _this3.addLogMessage('you have been disconnected');
      });

      this.socket.on('reconnect', function () {
        _this3.addLogMessage('you have been reconnected');
        if (_this3.username) {
          _this3.connected = false;
          _this3.socket.emit('add user', _this3.username);
        }
      });

      this.socket.on('reconnect_error', function () {
        _this3.addLogMessage('attempt to reconnect has failed');
      });
    }
  }]);

  return ChatRoom;
}();

;
