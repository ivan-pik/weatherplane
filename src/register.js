'use strict';

// ---------------------------------------------
// Modules
var express = require('express')
var router = express.Router()
var mid = require('./middleware/users');
var User = require('./models/user.js');



// ---------------------------------------------
// User registration page "/register"

router.get('/',mid.loggedOut , function (req, res) {
  res.render('user/register');
})

// ---------------------------------------------
// User registration page "/john-smith" POST

router.post('/', function (req, res, next) {
  if (req.body.userID &&
    req.body.email &&
    req.body.password &&
    req.body.confirmPassword) {
      if (req.body.password != req.body.confirmPassword) {
        var err = new Error('Passwords don\'t match');
        err.status = 400;
        return next(err);
      }

      var UserData = {
        _userID: req.body.userID,
        email: req.body.email,
        password: req.body.password
      };

      console.log(UserData);

      User.create(UserData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          req.session.userId = user._id;
          req.session.userSlug = user._userID;
          req.app.locals.currentUserSlug = user._userID;
          res.redirect('/user/'+req.session.userSlug);
        }
      })

  } else {
    var err = new Error('All fields required');
    err.status = 400;
    return next(err);
  }
})



// ---------------------------------------------
// Module exports

module.exports = router
