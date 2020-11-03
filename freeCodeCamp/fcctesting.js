/*
*
*
*
*
*
*
*
*
*
*
*
*       DO NOT EDIT THIS FILE
*       For FCC testing purposes!
*
*
*
*
*
*
*
*
*
*
*
*/

/*
*  THIS FILE IS FOR freeCodeCamp TO BE ABLE TO TEST YOUR CODE PROPERLY
*
*  ~DO NOT EDIT!~
*
*/


'use strict';

const fs = require('fs');

const allowedOriginsMatcher = /^https?:\/\/([\w-]+\.)*freecodecamp.org/;

module.exports = function (app) {
  
  app.use(function (req, res, next) {
      const origin = req.get('origin');
      if (allowedOriginsMatcher.test(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', true);
      next();
  });
  
  app.route('/_api/server.js')
    .get(function(req, res, next) {
      console.log('requested');
      fs.readFile(process.cwd() + '/server.js', function(err, data) {
        if(err) return next(err);
        res.send(data.toString());
      });
    });

    app.route('/_api/routes.js')
    .get(function (req, res, next) {
      console.log('requested');
      fs.readFile(process.cwd() + '/routes.js', function (err, data) {
        if (err) return next(err);
        res.send(data.toString());
      })
    })

  app.route('/_api/auth.js')
    .get(function (req, res, next) {
      console.log('requested');
      fs.readFile(process.cwd() + '/auth.js', function (err, data) {
        if (err) return next(err);
        res.send(data.toString());
      })
    })
  
  app.route('/_api/package.json')
    .get(function(req, res, next) {
      console.log('requested');
      fs.readFile(process.cwd() + '/package.json', function(err, data) {
        if(err) return next(err);
        res.type('txt').send(data.toString());
      });
    });  
    
  app.get('/_api/app-info', function(req, res) {
    var hs = Object.keys(res._headers)
      .filter(h => !h.match(/^access-control-\w+/));
    var hObj = {};
    hs.forEach(h => {hObj[h] = res._headers[h]});
    delete res._headers['strict-transport-security'];
    res.json({headers: hObj});
  });
  
};