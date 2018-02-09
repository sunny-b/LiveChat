const ChatApp = require('../../modules/chatapp');
const WaitList = require('../../modules/waitlist');
const User = require('../../modules/user');

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

    it('assigns this.waitlist to new instance of WaitList', () => {
      let io = {};
      let chat = new ChatApp(io);

      expect(chat.waitlist instanceof WaitList).toBe(true);
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

  // describe('findPair', () => {
  //   beforeEach(() => {
  //     let io = {
  //       on: () => {}
  //     }
  //     let chat = new ChatApp(io);
  //     let user1 = {
  //
  //     };
  //   });
  //
  //   it("calls findComplement")
  // });
});
