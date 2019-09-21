import ChatView from '../../public/javascripts/view';

describe('ChatView', () => {
  global.document = {
    querySelector: () => ({
      addEventListener: () => {},
      remoteEventListener: () => {},
    }),
  };

  describe('constructor', () => {
    it('creates new instance of ChatView without error', () => {
      const view = new ChatView();
      expect(view instanceof ChatView).toBe(true);
    });

    it('sets typing property to false', () => {
      const view = new ChatView();
      expect(view.typing).toBe(false);
    });

    it('sets TYPING_TIMER_LENGTH property on view', () => {
      const view = new ChatView();
      expect(view.TYPING_TIMER_LENGTH).toBeTruthy();
    });
  });
});
