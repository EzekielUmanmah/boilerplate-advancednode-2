'use strict';
require('dotenv').config();
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
app.set('view engine', 'pug');

const passport = require('passport');
const session = require('express-session');

fccTesting(app); //For FCC testing purposes
app.use("/public", express.static(process.cwd() + "/public"));

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const routes = require('./routes');
const auth = require('./auth');

//packages to enable authentication with Socket.IO
const passportSocketIo = require('passport.socketio');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const store = new MongoStore({ url: process.env.DATABASE });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false },
  key: 'express.sid',
  store: store,
}));

app.use(passport.initialize());
app.use(passport.session());

io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'express.sid',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSucess,
    fail: onAuthorizeFail
    })
  );

MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true,useUnifiedTopology: true })
  .then(async client => {

    const myDataBase = await client.db('database').collection('users');

    routes(app, myDataBase);
    auth(app, myDataBase);

    let currentUsers = 0;
    io.on('connection', socket => {

      ++currentUsers;
      io.emit('user', {
        name: socket.request.user.name,
        currentUsers,
        connected: true
      });
      console.log(`User ${socket.request.user.name} has connected.`)

      socket.on('disconnect', () => {
        --currentUsers;
        io.emit('user', {connected: false});
        console.log(`User ${socket.request.user.name} has disconnected.`);
      });

      socket.on('chat message', message => {
        io.emit('chat message', {
          name: socket.request.user.name, 
          message
          });
      });
      
    });

    
  })
  .catch(e => {
  app.route('/').get((req, res) => { 
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});

function onAuthorizeSucess(data, accept){

  console.log('Successful connection to socket.io.');
  accept(null, true);

};

function onAuthorizeFail(data, message, error, accept){

  if(error) throw new Error(message);
  console.log('Failed connection to socket.io:', message);
  accept(null, false);

};


http.listen(process.env.PORT || 4000, () => {
  console.log("Listening on port " + process.env.PORT);
});