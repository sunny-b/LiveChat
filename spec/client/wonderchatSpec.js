import WonderChat from '../../public/javascripts/wonderchat';
import ChatMessage from '../../public/javascripts/message';
import ChatView from '../../public/javascripts/view';

describe('WonderChat', () => {
  describe('handleAddUser', () => {
    const chat = new WonderChat();

    it('sets username property to string passed in', () => {
      const username = 'test';
      chat.handleAddUser(username);
      expect(chat.username).toBe(username);
    });
  });
});
