'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventemitter = require('eventemitter3');

var _eventemitter2 = _interopRequireDefault(_eventemitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// View class the encapsulates all browser and view logic
var ChatView = function (_EventEmitter) {
  _inherits(ChatView, _EventEmitter);

  function ChatView() {
    _classCallCheck(this, ChatView);

    var _this = _possibleConstructorReturn(this, (ChatView.__proto__ || Object.getPrototypeOf(ChatView)).call(this));

    _this.login = document.querySelector('.login');
    _this.chat = document.querySelector('.chat');
    _this.messages = document.querySelector('.messages');
    _this.usernameInput = document.querySelector('.username-input');
    _this.messageInput = document.querySelector('.message-input');
    _this.messageForm = document.querySelector('.message-form');
    _this.sendButton = document.querySelector('.send-button');

    _this.TYPING_TIMER_LENGTH = 400; //ms
    _this.typing = false;

    _this.attachEventListeners();
    return _this;
  }

  // attach Browser Event Listeners


  _createClass(ChatView, [{
    key: 'attachEventListeners',
    value: function attachEventListeners() {
      this.usernameInput.addEventListener('keydown', this.addUser.bind(this));
      this.messageInput.addEventListener('keyup', this.toggleInput.bind(this));
      this.messageInput.addEventListener('keydown', this.updateTyping.bind(this));
      this.messageForm.addEventListener('submit', this.handleMessage.bind(this));
    }

    // Display chat board when user creates username

  }, {
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

    // when user submits username, check if valid and emit event

  }, {
    key: 'addUser',
    value: function addUser(e) {
      if (e.which === 13) {
        var username = this.retrieveUsername();

        if (username) {
          this.displayChat();
          this.emit('add user', username);
        }
      }
    }

    // update typing status of user and emit event if status changes

  }, {
    key: 'updateTyping',
    value: function updateTyping(e) {
      var _this2 = this;

      if (!this.typing) {
        this.typing = true;
        this.emit('typing');
      }

      this.lastTypingTime = new Date().getTime();

      // detects if user has stopped typing and updates typing status
      setTimeout(function () {
        var typingTimer = new Date().getTime();
        var timeDiff = typingTimer - _this2.lastTypingTime;
        if (timeDiff >= _this2.TYPING_TIMER_LENGTH && _this2.typing) {
          _this2.emit('stop typing');
          _this2.typing = false;
        }
      }, this.TYPING_TIMER_LENGTH);
    }

    // toggles disabled status of message depending if input is empty

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

    // when message is submitted, retrieve the string and emit event

  }, {
    key: 'handleMessage',
    value: function handleMessage(e) {
      e.preventDefault();
      var message = this.retrieveMessage();
      this.emit('new message', message);
    }

    // clears message input and emits stop typing event.

  }, {
    key: 'clearInputField',
    value: function clearInputField() {
      this.typing = false;
      this.lastTypingTime = new Date().getTime();
      this.messageInput.value = "";
      this.sendButton.disabled = true;
      this.emit('stop typing');
    }

    // removes "User is typing..." message

  }, {
    key: 'removeTypingMessage',
    value: function removeTypingMessage() {
      var typingEl = document.querySelector('.message.typing');
      if (typingEl) typingEl.parentNode.removeChild(typingEl);
    }

    // when user submits a message, clear their input and add to chat

  }, {
    key: 'sameUserMessage',
    value: function sameUserMessage(message, username) {
      this.clearInputField();

      this.addChatMessage({
        message: message,
        username: username,
        isSameUser: true
      });
    }

    // Creates HTML for chat message and adds to chat

  }, {
    key: 'addChatMessage',
    value: function addChatMessage(data) {
      var usernameSpan = this.createUsernameSpan(data);
      var messageBody = this.createMessageSpan(data);
      var chatMessage = this.createChatMessage(data, usernameSpan, messageBody);

      this.addMessage(chatMessage);
    }

    // generates HTML span for username

  }, {
    key: 'createUsernameSpan',
    value: function createUsernameSpan(data) {
      var usernameSpan = document.createElement('span');

      if (data.isSameUser) usernameSpan.classList.add('same');
      usernameSpan.classList.add('username');
      usernameSpan.innerText = data.username;

      return usernameSpan;
    }

    // generates HTML span for message body

  }, {
    key: 'createMessageSpan',
    value: function createMessageSpan(data) {
      var messageBody = document.createElement('span');

      messageBody.classList.add('message-body');
      messageBody.innerText = data.message;

      return messageBody;
    }

    // generates list item that combines username and message

  }, {
    key: 'createChatMessage',
    value: function createChatMessage(data, usernameSpan, messageBody) {
      var messageEl = document.createElement('li');

      if (data.typing) messageEl.classList.add('typing');
      messageEl.classList.add('message');
      messageEl.appendChild(usernameSpan);
      messageEl.appendChild(messageBody);

      return messageEl;
    }

    // Add a status log message to chat

  }, {
    key: 'addLogMessage',
    value: function addLogMessage(message) {
      var logEl = document.createElement('li');
      logEl.classList.add('log');
      logEl.innerText = message;

      this.addMessage(logEl);
    }

    // Add 'User is typing...' message to chat

  }, {
    key: 'addTypingMessage',
    value: function addTypingMessage(data) {
      data.message = 'is typing...';
      data.typing = true;

      this.addChatMessage(data);
    }

    // Appends HTML chat message to chat and scrolls to bottom

  }, {
    key: 'addMessage',
    value: function addMessage(element) {
      this.messages.appendChild(element);
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }]);

  return ChatView;
}(_eventemitter2.default);

exports.default = ChatView;