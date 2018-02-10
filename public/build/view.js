'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = function View() {
  _classCallCheck(this, View);

  this.login = document.querySelector('.login');
  this.chat = document.querySelector('.chat');
  this.messages = document.querySelector('.messages');
  this.usernameInput = document.querySelector('.username-input');
  this.messageInput = document.querySelector('.message-input');
  this.messageForm = document.querySelector('.message-form');
  this.sendButton = document.querySelector('.send-button');
};