class ChatMessage {
  constructor(text) {
    [ this.command, this.body ] = this._parse(text)
  }

  hasCommand() {
    return this.command.length > 0;
  }

  hasDelayCommand() {
    return this.command.split(' ')[0] === '/delay';
  }

  hasHopCommand() {
    return this.command.split(' ')[0] === '/hop';
  }

  delayTime() {
    return +this.command.split(' ')[1];
  }

  isEmpty() {
    return this.body.length === 0;
  }

  _parse(message) {
    const splitStr = message.split(' ');
    const command = splitStr[0];
    const delay = splitStr[1];

    switch(command) {
      case '/hop':
        return [command, ''];
      case '/delay':
        let messageBody = splitStr.slice(2).join(' ');

        if (this._validDelayCommand(delay, messageBody)) {
          return [`${command} ${delay}`, messageBody];
        } else {
          return ['', message];
        }
      default:
        return [ '', message];
    }
  }

  _validDelayCommand(delay, messageBody) {
    return String(parseInt(delay)) === delay && !!messageBody;
  }
}

export default ChatMessage;
