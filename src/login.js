'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var mid = require('./middleware/users');
var router = express.Router();
var User = require('./models/user.js');



// ---------------------------------------------
// User registration page "/register"

router.get('/', mid.loggedOut, function (req, res) {
  res.render('user/login');
})

// ---------------------------------------------
// User login page "/login" POST

router.post('/', function (req, res, next) {
  if (req.body.userID && req.body.password) {
    User.authenticate(req.body.userID, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong e-mail or password.');
        err.status = 401;
        res.render('user/login',
          {message: {
            type: 'warning',
            text: err
          }}
        );
      } else {
        req.session.userId = user._id;
        req.session.userSlug = user._userID;
        return res.redirect('/user/'+user._userID);
      }
    });


  } else {
    var err = new Error('All fields required');
    err.status = 401;
    console.log(req.body.userId);
    res.render('user/login',
      {
        message: {
          type: 'warning',
          text: err
        },
        form: {
          prefill: {
            userId: req.body.userID || ''
          }
        }
      }
    );
  }
})



// ---------------------------------------------
// Module exports

module.exports = router
