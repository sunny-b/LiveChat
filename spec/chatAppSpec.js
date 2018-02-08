const ChatApp = require('../modules/chatapp');

describe('ChatApp', () => {
  describe('initialization', () => {
    it('creates new instance of ChatApp without error', () => {
      let io = {};
      let chat = new ChatApp(io);
      expect(chat instanceof ChatApp).toBe(true);
    });

    it('assigns this.io to io object passed in', () => {
      let io = {};
      let chat = new ChatApp(io);

      expect(chat.io).toBe(io);
    });

    it('assigns this.io to io object passed in', () => {
      let io = {};
      let chat = new ChatApp(io);

      expect(chat.numUsers).toBe(0);
    });
  });

  describe('init', () => {
    it('calls attachIOEvents', () => {
      let io = {
        on: () => {}
      }
      let chat = new ChatApp(io);
      spyOn(chat, 'attachIOEvents');
      chat.init();

      expect(chat.attachIOEvents).toHaveBeenCalled();
    });
  });

  describe('attachIOEvents', () => {
    it('calls the on method of the io object', () => {
      let io = {
        on: () => {}
      }
      let chat = new ChatApp(io);
      spyOn(io, 'on');
      chat.attachIOEvents();

      expect(io.on).toHaveBeenCalled();
    });
  });
});
