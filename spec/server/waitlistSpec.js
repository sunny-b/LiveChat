const WaitList = require('../../modules/waitlist');

describe('WaitList', () => {
  describe('constructor', () => {
    it('creates new instance of WaitList without error', () => {
      const waitlist = new WaitList();

      expect(waitlist instanceof WaitList).toBe(true);
    });

    it('assigns empty array to this.list', () => {
      const waitlist = new WaitList();

      expect(waitlist.list).toEqual([]);
    });
  });

  describe('add', () => {
    it('adds element to this.list array', () => {
      const waitlist = new WaitList();
      expect(waitlist.list.length).toBe(0);

      waitlist.add({});
      expect(waitlist.list.length).toBe(1);
    });

    it('adds specific user passed in to list array', () => {
      const waitlist = new WaitList();
      const user = {};

      waitlist.add(user);
      expect(waitlist.list[0]).toBe(user);
    });
  });

  describe('remove', () => {
    it('removes element from array', () => {
      const waitlist = new WaitList();
      const user = {};
      waitlist.add(user);
      expect(waitlist.list.length).toBe(1);

      waitlist.remove(user);
      expect(waitlist.list.length).toBe(0);
    });

    it('removes specific user passed in to list array', () => {
      const waitlist = new WaitList();
      const user = {};
      waitlist.add(user);
      expect(waitlist.list).toEqual([user]);

      waitlist.remove(user);
      expect(waitlist.list).toEqual([]);
    });

    it('does remove element if element is not in array', () => {
      const waitlist = new WaitList();
      const user1 = {id: 1};
      const user2 = {id: 2}
      waitlist.add(user1);
      expect(waitlist.list).toEqual([user1]);

      waitlist.remove(user2);
      expect(waitlist.list).toEqual([user1]);
    });
  });

  describe('findComplement', () => {
    const waitlist = new WaitList();
    const user = {};

    it('returns null if list is empty', () => {
      const user1 = {
        canConnectTo: () => { return false; }
      };

      expect(waitlist.findComplement(user1)).toBe(null);
    });

    it('returns null if cannot find complement', () => {
      const user1 = {
        canConnectTo: () => { return false; }
      };

      waitlist.add(user);
      expect(waitlist.findComplement(user1)).toBe(null);
    });

    it('returns the user if can find complement', () => {
      const user1 = {
        canConnectTo: () => { return true; }
      };

      waitlist.add(user);
      expect(waitlist.findComplement(user1)).toBe(user);
    });
  });
});
