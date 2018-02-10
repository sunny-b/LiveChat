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