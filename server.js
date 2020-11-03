'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');

const app = express();
//lets Express know which template engine is being used
app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require('passport');
const session = require('express-session');

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const routes = require('./routes');
const auth = require('./auth');
 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

MongoClient.connect(process.env.DATABASE, { useUnifiedTopology: true })
  .then(async client => {

    const myDataBase = await client.db('database').collection('users');

    routes(app, myDataBase)
    auth(app, myDataBase)
  })
  .catch(e => {
  app.route('/').get((req, res) => { 
    res.render('pug', { title: e, message: 'Unable to login' });
  });
});


app.listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT);
});