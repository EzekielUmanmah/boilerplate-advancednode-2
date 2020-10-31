const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const ObjectID = require('mongodb').ObjectID;
const GitHubStrategy = require('passport-github').Strategy;

module.exports = function (app, myDataBase) {
    passport.serializeUser( (user, done) => { 
        done(null, user._id);
    });
    passport.deserializeUser( (id, done) => { 
      myDataBase.findOne({_id: new ObjectID(id)}, (err, doc) => {
         done(null, doc)
      });
    });

    passport.use(new LocalStrategy( (username, password, done) => {
      myDataBase.findOne({username: username}, (err, user) => {
        console.log(`User ${username} attempted to login.`);
        if(err) { 
          return done(err)
          };
        if(!user) { 
          return done(null, false)
          };
        if(!bcrypt.compareSync(password, user.password)) { 
          return done(null, false)
          }; 
        return done(null, user);
      });
    }));

    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB.CLIENT_ID,
      clientSecret: process.env.GITHUB.CLIENT_SECRET,
      callbackURL: 'https://boilerplate-advancednode.ezekielumanmah.repl.co/auth/github/callback'
    }, 
    function(accessToken, refreshToken, profile, cb){
      console.log(profile)
    }))
}