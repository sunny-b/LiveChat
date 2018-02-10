(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}

},{}],2:[function(require,module,exports){
'use strict';

var _wonderchat = require('./wonderchat');

var _wonderchat2 = _interopRequireDefault(_wonderchat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _wonderchat2.default();
},{"./wonderchat":5}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ChatMessage = function () {
  function ChatMessage(text) {
    _classCallCheck(this, ChatMessage);

    var _parse2 = this._parse(text);

    var _parse3 = _slicedToArray(_parse2, 2);

    this.command = _parse3[0];
    this.body = _parse3[1];
  }

  _createClass(ChatMessage, [{
    key: 'hasCommand',
    value: function hasCommand() {
      return this.command.length > 0;
    }
  }, {
    key: 'hasDelayCommand',
    value: function hasDelayCommand() {
      return this.command.split(' ')[0] === '/delay';
    }
  }, {
    key: 'hasHopCommand',
    value: function hasHopCommand() {
      return this.command.split(' ')[0] === '/hop';
    }
  }, {
    key: 'delayTime',
    value: function delayTime() {
      return +this.command.split(' ')[1];
    }
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.body.length === 0;
    }
  }, {
    key: '_parse',
    value: function _parse(message) {
      var splitStr = message.split(' ');
      var command = splitStr[0];
      var delay = splitStr[1];

      switch (command) {
        case '/hop':
          return [command, ''];
        case '/delay':
          var messageBody = splitStr.slice(2).join(' ');

          if (this._validDelayCommand(delay, messageBody)) {
            return [command + ' ' + delay, messageBody];
          } else {
            return ['', message];
          }
        default:
          return ['', message];
      }
    }
  }, {
    key: '_validDelayCommand',
    value: function _validDelayCommand(delay, messageBody) {
      return String(parseInt(delay)) === delay && !!messageBody;
    }
  }]);

  return ChatMessage;
}();

exports.default = ChatMessage;
},{}],4:[function(require,module,exports){
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
      if (!this.typing) {
        this.typing = true;
        this.emit('typing');
      }

      this.lastTypingTime = new Date().getTime();

      setTimeout(typingTimeout, this.TYPING_TIMER_LENGTH);
    }

    // detects if user has stopped typing and updates typing status

  }, {
    key: 'typingTimeout',
    value: function typingTimeout() {
      var typingTimer = new Date().getTime();
      var timeDiff = typingTimer - this.lastTypingTime;
      if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
        this.emit('stop typing');
        this.typing = false;
      }
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
  }, {
    key: 'clearInputField',
    value: function clearInputField() {
      this.typing = false;
      this.lastTypingTime = new Date().getTime();
      this.messageInput.value = "";
      this.sendButton.disabled = true;
      this.emit('stop typing');
    }
  }, {
    key: 'removeTypingMessage',
    value: function removeTypingMessage() {
      var typingEl = document.querySelector('.message.typing');
      if (typingEl) typingEl.parentNode.removeChild(typingEl);
    }
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
  }, {
    key: 'addChatMessage',
    value: function addChatMessage(data) {
      var usernameSpan = this.createUsernameSpan(data);
      var messageBody = this.createMessageSpan(data);
      var chatMessage = this.createChatMessage(data, usernameSpan, messageBody);

      this.addMessage(chatMessage);
    }
  }, {
    key: 'createUsernameSpan',
    value: function createUsernameSpan(data) {
      var usernameSpan = document.createElement('span');

      if (data.isSameUser) usernameSpan.classList.add('same');
      usernameSpan.classList.add('username');
      usernameSpan.innerText = data.username;

      return usernameSpan;
    }
  }, {
    key: 'createMessageSpan',
    value: function createMessageSpan(data) {
      var messageBody = document.createElement('span');

      messageBody.classList.add('message-body');
      messageBody.innerText = data.message;

      return messageBody;
    }
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
  }, {
    key: 'addLogMessage',
    value: function addLogMessage(message) {
      var logEl = document.createElement('li');
      logEl.classList.add('log');
      logEl.innerText = message;

      this.addMessage(logEl);
    }
  }, {
    key: 'addTypingMessage',
    value: function addTypingMessage(data) {
      data.message = 'is typing...';
      data.typing = true;

      this.addChatMessage(data);
    }
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
},{"eventemitter3":1}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Main Application class that serves as controller between server and view
var WonderChat = function () {
  function WonderChat() {
    _classCallCheck(this, WonderChat);

    this.username = null;
    this.socket = io();
    this.view = new _view2.default();

    this.attachSocketListeners();
    this.attachViewListeners();
  }

  // Attach listeners to events emitted from view


  _createClass(WonderChat, [{
    key: 'attachViewListeners',
    value: function attachViewListeners() {
      var _this = this;

      this.view.on('add user', function (username) {
        return _this.handleAddUser(username);
      });
      this.view.on('new message', function (message) {
        return _this.handleNewMessage(message);
      });
      this.view.on('typing', function () {
        return _this.socket.emit('typing');
      });
      this.view.on('stop typing', function () {
        return _this.socket.emit('stop typing');
      });
    }

    // Handles user login. Assigns username and emits to server

  }, {
    key: 'handleAddUser',
    value: function handleAddUser(username) {
      this.username = username;
      this.socket.emit('add user', username);
    }

    // Create new message and detect if slash commands are present

  }, {
    key: 'handleNewMessage',
    value: function handleNewMessage(messageStr) {
      var message = new _message2.default(messageStr);

      if (message.hasCommand()) {
        this.execute(message);
      } else if (!message.isEmpty()) {
        this.sendMessage(message.body);
      }
    }

    // Execute the slash command

  }, {
    key: 'execute',
    value: function execute(message) {
      if (message.hasDelayCommand()) {
        this.sendDelayedMessage(message.body, message.delayTime());
      } else if (message.hasHopCommand()) {
        this.handleHop();
      }
    }

    // Tells user new pair is being found and tells server to "hop"

  }, {
    key: 'handleHop',
    value: function handleHop() {
      this.view.clearInputField();
      this.view.addLogMessage('Finding you a new pair...');
      this.socket.emit('hop');
    }

    // sends delayed message to server

  }, {
    key: 'sendDelayedMessage',
    value: function sendDelayedMessage(message, delay) {
      var _this2 = this;

      this.view.sameUserMessage(message, this.username);

      setTimeout(function () {
        _this2.socket.emit('new message', message);
      }, delay);
    }

    // sends normal chat message to server

  }, {
    key: 'sendMessage',
    value: function sendMessage(message) {
      this.view.sameUserMessage(message, this.username);

      this.socket.emit('new message', message);
    }

    // attachs listeners to socket.io events from server.

  }, {
    key: 'attachSocketListeners',
    value: function attachSocketListeners() {
      var _this3 = this;

      this.socket.on('login', function () {
        return _this3.view.addLogMessage('Welcome to Wonder Chat!');
      });
      this.socket.on('new message', function (data) {
        return _this3.view.addChatMessage(data);
      });

      this.socket.on('waiting', function () {
        _this3.view.addLogMessage('You will be connected to the next available user.');
      });

      this.socket.on('user joined', function (data) {
        _this3.view.addLogMessage('You have been connected to ' + data.username + '.');
      });

      // Whenever user leaves room, remove their typing message and let other user know
      this.socket.on('user left', function (data) {
        _this3.view.removeTypingMessage();
        _this3.view.addLogMessage(data.username + ' has left.');
        _this3.socket.emit('find new pair');
      });

      this.socket.on('typing', function (data) {
        _this3.view.addTypingMessage(data);
      });

      this.socket.on('stop typing', function (data) {
        _this3.view.removeTypingMessage();
      });

      this.socket.on('disconnect', function () {
        _this3.view.addLogMessage('you have been disconnected');
      });

      this.socket.on('reconnect', function () {
        _this3.view.addLogMessage('you have been reconnected');
        if (_this3.username) {
          _this3.socket.emit('add user', _this3.username);
        }
      });

      this.socket.on('reconnect_error', function () {
        _this3.view.addLogMessage('attempt to reconnect has failed');
      });
    }
  }]);

  return WonderChat;
}();

;

exports.default = WonderChat;
},{"./message":3,"./view":4}]},{},[2]);
