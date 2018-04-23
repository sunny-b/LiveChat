# Wonder Chat

![WonderChat demo](/public/images/wonderchat.gif)

[View the production application here](https://wonderful-chat.herokuapp.com/)

## Description

This is my submission for the a take home challenge. It is written in Node.JS and Express on the backend and ES6 vanilla Javascript on the front end. I used Socket.IO to establish connections between users so that they can chat.

This chat application supports two slash commands:

* `/hop`
* `/delay {timeDelay} {message}`

The '/delay' command takes two parameters, a timeDelay and message. It will only be executed if both those arguments are present, otherwise it will be sent as a normal message.

If a user uses the '/hop' command, they will never reconnected to the other user even if they are the only one available.

The front-end and styling of this chat were mainly inspired by the [Chat demo](https://socket.io/demos/chat/) from Socket.IO website.

## Architecture

### Client-Side

The client-side Javascript is split into three classes:

* WonderChat (main class)
* ChatView
* ChatMessage

The WonderChat class acts as a controller. It receives events from the server and passes it to the view. It also receives events from the view and passes it to the server.

The ChatView class encapulates all the browser and view logic to keep it out of the WonderChat class. It is responsible for updating and changing the view and detecting view events.

The ChatMessage class is a wrapper for the chat message text and provides helper methods.

I used babel and browserify to transpile the code and modularize it into a single file. This can be done in the console using this command:

    $ npm run build

### Server-Side

The server-side Node.JS is split into three modules:

* ChatApp (main)
* User
* Waitlist

The ChatApp class is a wrapper for the websocket connections. It manages all the connections and detects events when they come from the front end.

The User class encapulates a single socket connection.

The Waitlist is a module that takes care of finding pairs for users and manage which user should be connected next.

## What I would improve

Firstly, I would convert the front-end to use React. Due to the short timeframe to build this chat app, I decided to use vanilla Javascript because it takes very little configuration and it's quicker in the short run. React requires the configuration of Webpack and is prone to developer error.

I would also expand the test suite. I provided some simple unit tests for all the classes to demonstrate that they are testable. I did not have time to create functional/integration tests so I had to do all of that manually.

## Tests

I provided unit tests for most classes, though there is less coverage for the client-side classes. To run the tests, run this command in the console:

    $ npm run test
