const ChatApp = require('../../modules/chatapp');
const WaitList = require('../../modules/waitlist');

describe('ChatApp', () => {
  describe('initialization', () => {
    it('creates new instance of ChatApp without error', () => {
      const io = {};
      const chat = new ChatApp(io);
      expect(chat instanceof ChatApp).toBe(true);
    });

    it('assigns this.io to io object passed in', () => {
      const io = {};
      const chat = new ChatApp(io);

      expect(chat.io).toBe(io);
    });

    it('assigns this.waitlist to new instance of WaitList', () => {
      const io = {};
      const chat = new ChatApp(io);

      expect(chat.waitlist instanceof WaitList).toBe(true);
    });
  });

  describe('init', () => {
    it('calls attachIOEvents', () => {
      const io = {
        on: () => {},
      };
      const chat = new ChatApp(io);
      spyOn(chat, 'attachIOEvents');
      chat.init();

      expect(chat.attachIOEvents).toHaveBeenCalled();
    });
  });

  describe('attachIOEvents', () => {
    it('calls the on method of the io object', () => {
      const io = {
        on: () => {},
      };
      const chat = new ChatApp(io);
      spyOn(io, 'on');
      chat.attachIOEvents();

      expect(io.on).toHaveBeenCalled();
    });
  });

  describe('findPair', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user1 = {
      emit: () => {},
      broadcast: () => {},
    };
    const user2 = {
      broadcast: () => {},
    };

    it('calls findComplement on waitlist with user passed in', () => {
      spyOn(chat.waitlist, 'findComplement');
      chat.findPair(user1);
      expect(chat.waitlist.findComplement).toHaveBeenCalledWith(user1);
    });

    it("calls 'add' on waitlist if complement cannot be found", () => {
      user1.canConnectTo = () => false;

      spyOn(chat.waitlist, 'add');
      chat.findPair(user1);

      expect(chat.waitlist.add).toHaveBeenCalledWith(user1);
    });

    it("calls 'emit' on user if complement cannot be found", () => {
      const evt = 'waiting';
      user1.canConnectTo = () => false;

      spyOn(user1, 'emit');
      chat.findPair(user1);

      expect(user1.emit).toHaveBeenCalledWith(evt);
    });

    it("calls 'remove' on waitlist if complement can be found", () => {
      chat.waitlist.add(user2);

      user1.canConnectTo = () => true;
      spyOn(chat.waitlist, 'remove');
      chat.findPair(user1);

      expect(chat.waitlist.remove).toHaveBeenCalledWith(user2);
    });

    it("calls 'createPair' on chat if complement can be found", () => {
      chat.waitlist.add(user2);

      user1.canConnectTo = () => true;
      spyOn(chat, 'createPair');
      chat.findPair(user1);

      expect(chat.createPair).toHaveBeenCalledWith(user1, user2);
    });

    afterEach(() => {
      chat.waitlist.list = [];
    });
  });

  describe('createPair', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user1 = {
      id: 1,
      username: 'test1',
      broadcast: () => {},
    };
    const user2 = {
      id: 2,
      username: 'test2',
      broadcast: () => {},
    };

    it('assigns user1.id to user2.pairId', () => {
      chat.createPair(user1, user2);
      expect(user2.pairId).toBe(user1.id);
    });

    it('assigns user2.id to user1.pairId', () => {
      chat.createPair(user1, user2);
      expect(user1.pairId).toBe(user2.id);
    });

    it('calls broadcast on user1', () => {
      const evt = 'user joined';
      const data = {
        username: user1.username,
        pairId: user1.id,
      };

      spyOn(user1, 'broadcast');
      chat.createPair(user1, user2);
      expect(user1.broadcast).toHaveBeenCalledWith(evt, data);
    });

    it('calls broadcast on user2', () => {
      const evt = 'user joined';
      const data = {
        username: user2.username,
        pairId: user2.id,
      };

      spyOn(user2, 'broadcast');
      chat.createPair(user1, user2);
      expect(user2.broadcast).toHaveBeenCalledWith(evt, data);
    });
  });

  describe('handleHop closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      addException: () => {},
      username: 'test1',
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.handleHop(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call addException if pairId is null', () => {
      const { pairId } = user;
      user.pairId = null;
      spyOn(user, 'addException');
      closure();

      expect(user.addException).not.toHaveBeenCalledWith(pairId);
    });

    it('calls addException on user with pairId', () => {
      const { pairId } = user;
      spyOn(user, 'addException');
      closure();

      expect(user.addException).toHaveBeenCalledWith(pairId);
    });

    it('sets pairId on user to null', () => {
      closure();
      expect(user.pairId).toBe(null);
    });

    it('calls findPair on chat', () => {
      spyOn(chat, 'findPair');
      closure();
      expect(chat.findPair).toHaveBeenCalledWith(user);
    });

    it('calls broadcast on user', () => {
      const evt = 'user left';
      const data = {
        username: user.username,
      };
      const { pairId } = user;

      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).toHaveBeenCalledWith(evt, data, pairId);
    });

    afterEach(() => {
      user.pairId = 2;
    });
  });

  describe('findNewPairFor closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      addException: () => {},
      username: 'test1',
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.findNewPairFor(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('sets pairId on user to null', () => {
      closure();
      expect(user.pairId).toBe(null);
    });

    it('calls findPair on chat', () => {
      spyOn(chat, 'findPair');
      closure();
      expect(chat.findPair).toHaveBeenCalledWith(user);
    });

    afterEach(() => {
      user.pairId = 2;
    });
  });

  describe('addTyping closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      addException: () => {},
      username: 'test1',
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.addTyping(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call broadcast if pairId is null', () => {
      const evt = 'typing';
      const data = {
        username: user.username,
      };

      user.pairId = null;
      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).not.toHaveBeenCalledWith(evt, data);
    });

    it('calls broadcast on user', () => {
      const evt = 'typing';
      const data = {
        username: user.username,
      };

      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).toHaveBeenCalledWith(evt, data);
    });

    afterEach(() => {
      user.pairId = 2;
    });
  });

  describe('stopTyping closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      addException: () => {},
      username: 'test1',
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.stopTyping(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call broadcast if pairId is null', () => {
      const evt = 'stop typing';
      const data = {
        username: user.username,
      };

      user.pairId = null;
      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).not.toHaveBeenCalledWith(evt, data);
    });

    it('calls broadcast on user', () => {
      const evt = 'stop typing';
      const data = {
        username: user.username,
      };

      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).toHaveBeenCalledWith(evt, data);
    });

    afterEach(() => {
      user.pairId = 2;
    });
  });

  describe('addMessage closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      addException: () => {},
      username: 'test1',
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.addMessage(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call broadcast if pairId is null', () => {
      const evt = 'new message';
      const data = {
        username: user.username,
        message: 'test',
      };

      user.pairId = null;
      spyOn(user, 'broadcast');
      closure(data.message);

      expect(user.broadcast).not.toHaveBeenCalledWith(evt, data);
    });

    it('calls broadcast on user', () => {
      const evt = 'new message';
      const data = {
        username: user.username,
        message: 'test',
      };

      spyOn(user, 'broadcast');
      closure(data.message);

      expect(user.broadcast).toHaveBeenCalledWith(evt, data);
    });

    afterEach(() => {
      user.pairId = 2;
    });
  });

  describe('addUser closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      added: false,
      addException: () => {},
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.addUser(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call emit if added is true', () => {
      const evt = 'login';

      user.added = true;
      spyOn(user, 'emit');
      closure('username');

      expect(user.emit).not.toHaveBeenCalledWith(evt);
    });

    it('calls emit on user', () => {
      const evt = 'login';

      spyOn(user, 'emit');
      closure('username');

      expect(user.emit).toHaveBeenCalledWith(evt);
    });

    it('assigns username passed in to .username property', () => {
      const username = 'username';
      closure(username);
      expect(user.username).toBe(username);
    });

    it('assigns added property to true', () => {
      const username = 'username';
      closure(username);
      expect(user.added).toBe(true);
    });

    it('calls findPair on chat', () => {
      const username = 'username';
      spyOn(chat, 'findPair');
      closure(username);
      expect(chat.findPair).toHaveBeenCalledWith(user);
    });

    afterEach(() => {
      user.added = false;
    });
  });

  describe('dropUser closure', () => {
    const io = {
      on: () => {},
    };
    const chat = new ChatApp(io);
    const user = {
      id: 1,
      pairId: 2,
      username: 'test',
      added: true,
      addException: () => {},
      broadcast: () => {},
      emit: () => {},
      canConnectTo: () => false,
    };
    const closure = chat.dropUser(user);

    it('returns a closure', () => {
      expect(typeof closure).toBe('function');
    });

    it('does not call broadcast if added is false', () => {
      const evt = 'user left';
      const data = {
        username: user.username,
      };

      user.added = false;
      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).not.toHaveBeenCalledWith(evt, data);
    });

    it('does not call broadcast if pairId is null', () => {
      const evt = 'user left';
      const data = {
        username: user.username,
      };
      user.pairId = null;
      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).not.toHaveBeenCalledWith(evt, data);
    });

    it('calls broadcast if added true and pairId is not null', () => {
      const evt = 'user left';
      const data = {
        username: user.username,
      };

      spyOn(user, 'broadcast');
      closure();

      expect(user.broadcast).toHaveBeenCalledWith(evt, data);
    });

    it('calls remove on waitlist', () => {
      spyOn(chat.waitlist, 'remove');
      closure();

      expect(chat.waitlist.remove).toHaveBeenCalledWith(user);
    });

    afterEach(() => {
      user.added = true;
      user.pairId = 2;
    });
  });
});
