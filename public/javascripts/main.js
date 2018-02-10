import WonderChat from './wonderchat';
import ChatView from './view';
import io from 'socket.io-client';

new WonderChat(io(), new ChatView());
