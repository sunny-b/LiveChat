const express = require('express');
const auth = require('express-basic-auth')
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
const server = require('http').createServer(app);

const port = process.env.PORT || 3000;
const io = require('socket.io')(server);
const ChatApp = require('./modules/chatapp');

const chat = new ChatApp(io);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, '/node_modules')));

// Initialize Socket
chat.init();

if (app.get('env') === 'staging') {
  const user = process.env.AUTH_USER;
  const pass = process.env.AUTH_PASS;
  const users = {};

  users[user] = pass;

  app.use(auth({
    users,
    challenge: true,
  }));
}

// GET '/'
app.get('/', (req, res) => {
  res.render('index');
});

// Start server
server.listen(port, () => {
  console.log(`listening on ${port}`);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res) => {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});


module.exports = app;
