// Class that wraps around chat message and provides helper methods
class ChatMessage {
  // parses string into command and message body when initialized
  constructor(text) {
    [ this.command, this.body ] = this._parse(text)
  }

  // check if slash command is present
  hasCommand() {
    return this.command.length > 0;
  }

  // check if delay slash command is present
  hasDelayCommand() {
    return this.command.split(' ')[0] === '/delay';
  }

  // check if hop slash command is present
  hasHopCommand() {
    return this.command.split(' ')[0] === '/hop';
  }

  // retrieve the integer value for delay time in ms for delay slash command
  delayTime() {
    return +this.command.split(' ')[1];
  }

  // check is message is empty
  isEmpty() {
    return this.body.length === 0;
  }

  // parses message into the command and the message body that will to shown in chat
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

  // check if delay command has valid delay time and message afterwards
  _validDelayCommand(delay, messageBody) {
    return String(parseInt(delay)) === delay && !!messageBody;
  }
}

export default ChatMessage;
