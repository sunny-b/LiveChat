import WonderChat from '../../public/javascripts/wonderchat';

describe('WonderChat', () => {
  const socket = {
    on: () => {},
    emit: () => {},
  };
  const view = {
    on: () => {},
    clearInputField: () => {},
    addLogMessage: () => {},
    sameUserMessage: () => {},
  };
  const chat = new WonderChat(socket, view);

  describe('handleAddUser', () => {
    it('sets username property to string passed in', () => {
      const username = 'test';
      chat.handleAddUser(username);
      expect(chat.username).toBe(username);
    });

    it('calls emit on socket with add user data', () => {
      const username = 'test';
      spyOn(socket, 'emit');
      chat.handleAddUser(username);
      expect(socket.emit).toHaveBeenCalledWith('add user', username);
    });
  });

  describe('handleHop', () => {
    it('calls clearInputField on view', () => {
      spyOn(chat.view, 'clearInputField');
      chat.handleHop();
      expect(chat.view.clearInputField).toHaveBeenCalled();
    });

    it('calls addLogMessage on view', () => {
      spyOn(chat.view, 'addLogMessage');
      chat.handleHop();
      expect(chat.view.addLogMessage).toHaveBeenCalledWith('Finding you a new pair...');
    });

    it('calls emit on socket', () => {
      spyOn(chat.socket, 'emit');
      chat.handleHop();
      expect(chat.socket.emit).toHaveBeenCalledWith('hop');
    });
  });
});
