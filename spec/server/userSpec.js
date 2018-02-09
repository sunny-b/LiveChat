const User = require('../../modules/user');

describe('User', () => {
  describe('constructor', () => {
    const socket = {
      id: 1
    }
    const user = new User(socket);


    it('creates an exceptions Set', () => {
      expect(user.exceptions).toBeTruthy();
      expect(user.exceptions instanceof Set).toBe(true);
    });

    it('creates a "added" property set to false', () => {
      expect(user.added).toBe(false);
    });

    it('creates a "pairId" property set to null', () => {
      expect(user.pairId).toBe(null);
    });

    it('creates a "username" property set to null', () => {
      expect(user.username).toBe(null);
    });

    it('creates a "socket" property set to socket passed in', () => {
      expect(user.socket).toBe(socket);
    });

    it('creates an "id" property set to the id of socket', () => {
      expect(user.id).toBe(socket.id);
    });
  });

  describe('addException', () => {
    const socket = {
      id: 1
    }
    const user = new User(socket);

    it('adds an id to exception set', () => {
      user.addException(2);

      expect(user.exceptions.has(2)).toBe(true);
    });
  });

  describe('canConnectTo', () => {
    const socket = {
      id: 1
    }
    const user = new User(socket);
    const otherUser = { id: 2 };

    it("returns false if other user's id is in exceptions", () => {
      user.addException(2);
      otherUser.exceptions = new Set([]);

      expect(user.canConnectTo(otherUser)).toBe(false);
    });

    it("returns false if user's id is in other user's exceptions", () => {
      otherUser.exceptions = new Set([1]);

      expect(user.canConnectTo(otherUser)).toBe(false);
    });

    it("returns true if neither user has the id in their exceptions", () => {
      otherUser.exceptions = new Set([]);

      expect(user.canConnectTo(otherUser)).toBe(true);
    });

    afterEach(() => {
      user.exceptions = new Set();
    });
  });

  describe('emit', () => {
    const socket = {
      id: 1,
      emit: (evt, data) => {}
    }
    const user = new User(socket);

    beforeEach(() => {
      spyOn(user.socket, 'emit');
    });

    it('it calls "emit" method with the event and data passed in', () => {
      const evt = 'test';
      const data = {}

      user.emit(evt, data)
      expect(user.socket.emit).toHaveBeenCalledWith(evt, data);
    });
  });
});
