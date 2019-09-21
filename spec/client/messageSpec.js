import Message from '../../public/javascripts/message';

describe('Message', () => {
  describe('_parse', () => {
    const message = new Message('');
    it('returns empty command if no commands present', () => {
      const [command] = message._parse('test');
      expect(command).toBe('');
    });

    it('returns empty message if empty string is passed in', () => {
      const [, messageBody] = message._parse('');
      expect(messageBody).toBe('');
    });

    it('returns message if there is a message present', () => {
      const text = 'test';
      const [, messageBody] = message._parse(text);
      expect(messageBody).toBe(text);
    });

    it('returns "/hop" for command if message contains "/hop" command', () => {
      const text = '/hop';
      const [command] = message._parse(text);
      expect(command).toEqual(text);
    });

    it('returns "/delay {time}" for command if message contains "/delay {time} {message}"', () => {
      const text = '/delay 1000 hi';
      const [command] = message._parse(text);
      expect(command).toEqual('/delay 1000');
    });

    it('returns "{message}" for message if message contains "/delay {time} {message}"', () => {
      const text = '/delay 1000 hi';
      const [, messageBody] = message._parse(text);
      expect(messageBody).toEqual('hi');
    });

    it('returns "/delay {time}" for message if message is only "/delay {time}"', () => {
      const text = '/delay 1000';
      const [, messageBody] = message._parse(text);
      expect(messageBody).toEqual(text);
    });

    it('returns "" for command if message is only "/delay {time}"', () => {
      const text = '/delay 1000';
      const [command] = message._parse(text);
      expect(command).toEqual('');
    });
  });

  describe('_validDelayCommand', () => {
    const message = new Message('');
    it('returns false if delay is not integer', () => {
      expect(message._validDelayCommand('test', 'test')).toBe(false);
    });

    it('returns false if delay is float', () => {
      expect(message._validDelayCommand('5.5', 'test')).toBe(false);
    });

    it('returns false if message body is empty', () => {
      expect(message._validDelayCommand('5', '')).toBe(false);
    });

    it('returns true if delay is integer message body is not empty', () => {
      expect(message._validDelayCommand('5', 'hi')).toBe(true);
    });
  });

  describe('hasCommand', () => {
    it('returns true if command property is not empty', () => {
      const message = new Message('/hop');
      expect(message.hasCommand()).toBe(true);
    });

    it('returns false if command property is empty string', () => {
      const message = new Message('');
      expect(message.hasCommand()).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('returns true if message body property is empty', () => {
      const message = new Message('');
      expect(message.isEmpty()).toBe(true);
    });

    it('returns false if message body is not empty string', () => {
      const message = new Message('test');
      expect(message.isEmpty()).toBe(false);
    });
  });

  describe('hasDelayCommand', () => {
    it('returns true if message contains valid delay command', () => {
      const message = new Message('/delay 1000 hi');
      expect(message.hasDelayCommand()).toBe(true);
    });

    it('returns false if message contains invalid delay command', () => {
      const message = new Message('/delay 1000');
      expect(message.hasDelayCommand()).toBe(false);
    });
  });

  describe('hasHopCommand', () => {
    it('returns true if message contains valid hop command', () => {
      const message = new Message('/hop');
      expect(message.hasHopCommand()).toBe(true);
    });

    it('returns false if message does not contain hop command', () => {
      const message = new Message('test');
      expect(message.hasHopCommand()).toBe(false);
    });
  });

  describe('delayTime', () => {
    it('returns integer value for the delay command', () => {
      const message = new Message('/delay 1000 hi');
      expect(message.delayTime()).toBe(1000);
    });
  });
});
