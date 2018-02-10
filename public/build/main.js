'use strict';

var _wonderchat = require('./wonderchat');

var _wonderchat2 = _interopRequireDefault(_wonderchat);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

var _socket = require('socket.io-client');

var _socket2 = _interopRequireDefault(_socket);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _wonderchat2.default((0, _socket2.default)(), new _view2.default());