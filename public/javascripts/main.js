import io from 'socket.io-client';
import WonderChat from './wonderchat';
import ChatView from './view';

new WonderChat(io(), new ChatView());
