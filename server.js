'use strict';
//require('dotenv').config();
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true,useUnifiedTopology: true })
  .then(async client => {

    const myDataBase = await client.db('database').collection('users');

    io.on('connection', socket => {
      console.log('A user has connected.')
    });

    routes(app, myDataBase)
    auth(app, myDataBase)
    
  })
  .catch(e => {
  app.route('/').get((req, res) => { 
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});


http.listen(process.env.PORT || 4000, () => {
  console.log("Listening on port " + process.env.PORT);
});