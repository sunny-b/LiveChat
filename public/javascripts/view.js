import EventEmitter from 'eventemitter3';

// View class the encapsulates all browser and view logic
class ChatView extends EventEmitter {
  constructor() {
    super();
    this.login = document.querySelector('.login');
    this.chat = document.querySelector('.chat');
    this.messages = document.querySelector('.messages')
    this.usernameInput = document.querySelector('.username-input');
    this.messageInput = document.querySelector('.message-input');
    this.messageForm = document.querySelector('.message-form');
    this.sendButton = document.querySelector('.send-button');

    this.TYPING_TIMER_LENGTH = 400; //ms
    this.typing = false;

    this.attachEventListeners();
  }

  // attach Browser Event Listeners
  attachEventListeners() {
    this.usernameInput.addEventListener('keydown', this.addUser.bind(this));
    this.messageInput.addEventListener('keyup', this.toggleInput.bind(this));
    this.messageInput.addEventListener('keydown', this.updateTyping.bind(this));
    this.messageForm.addEventListener('submit', this.handleMessage.bind(this));
  }

  // Display chat board when user creates username
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

  // when user submits username, check if valid and emit event
  addUser(e) {
    if (e.which === 13) {
      const username = this.retrieveUsername();

      if (username) {
        this.displayChat();
        this.emit('add user', username);
      }
    }
  }

  // update typing status of user and emit event if status changes
  updateTyping(e) {
    if (!this.typing) {
      this.typing = true;
      this.emit('typing');
    }

    this.lastTypingTime = (new Date()).getTime();

    setTimeout(typingTimeout, this.TYPING_TIMER_LENGTH);
  }

  // detects if user has stopped typing and updates typing status
  typingTimeout() {
    const typingTimer = (new Date()).getTime();
    const timeDiff = typingTimer - this.lastTypingTime;
    if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
      this.emit('stop typing');
      this.typing = false;
    }
  }

  // toggles disabled status of message depending if input is empty
  toggleInput(e) {
    const message = this.retrieveMessage();

    if (message) {
      this.sendButton.disabled = false;
    } else {
      this.sendButton.disabled = true;
    }
  }

  // when message is submitted, retrieve the string and emit event
  handleMessage(e) {
    e.preventDefault();
    const message = this.retrieveMessage();
    this.emit('new message', message)
  }

  // clears message input and emits stop typing event.
  clearInputField() {
    this.typing = false;
    this.lastTypingTime = (new Date()).getTime();
    this.messageInput.value = "";
    this.sendButton.disabled = true;
    this.emit('stop typing');
  }

  // removes "User is typing..." message
  removeTypingMessage() {
    const typingEl = document.querySelector('.message.typing');
    if (typingEl) typingEl.parentNode.removeChild(typingEl);
  }

  // when user submits a message, clear their input and add to chat
  sameUserMessage(message, username) {
    this.clearInputField();

    this.addChatMessage({
      message: message,
      username: username,
      isSameUser: true
    });
  }

  // Creates HTML for chat message and adds to chat
  addChatMessage(data) {
    const usernameSpan = this.createUsernameSpan(data);
    const messageBody = this.createMessageSpan(data);
    const chatMessage = this.createChatMessage(data, usernameSpan, messageBody);

    this.addMessage(chatMessage);
  }

  // generates HTML span for username
  createUsernameSpan(data) {
    const usernameSpan = document.createElement('span');

    if (data.isSameUser) usernameSpan.classList.add('same');
    usernameSpan.classList.add('username');
    usernameSpan.innerText = data.username;

    return usernameSpan;
  }

  // generates HTML span for message body
  createMessageSpan(data) {
    const messageBody = document.createElement('span');

    messageBody.classList.add('message-body');
    messageBody.innerText = data.message;

    return messageBody;
  }

  // generates list item that combines username and message
  createChatMessage(data, usernameSpan, messageBody) {
    const messageEl = document.createElement('li');

    if (data.typing) messageEl.classList.add('typing');
    messageEl.classList.add('message');
    messageEl.appendChild(usernameSpan);
    messageEl.appendChild(messageBody);

    return messageEl;
  }

  // Add a status log message to chat
  addLogMessage(message) {
    let logEl = document.createElement('li')
    logEl.classList.add('log');
    logEl.innerText = message;

    this.addMessage(logEl);
  }

  // Add 'User is typing...' message to chat
  addTypingMessage(data) {
    data.message = 'is typing...'
    data.typing = true;

    this.addChatMessage(data);
  }

  // Appends HTML chat message to chat and scrolls to bottom
  addMessage(element) {
    this.messages.appendChild(element);
    this.messages.scrollTop = this.messages.scrollHeight;
  }
}

export default ChatView;
