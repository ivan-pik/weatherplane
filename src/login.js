'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');
var User = require('./models/user.js');
var mailer = require('./mailer.js');


// ---------------------------------------------
// User registration page "/register"

router.get('/', mid.loggedOut, function (req, res) {
  if (req.query && req.query.username) {
    var prefill = {
      form: {
        prefill: {
          userId: req.query.username
        }
      }
    }
  }
  res.render('user/login', prefill);
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
// Forgotten password "login/forgot-password"

router.get('/forgot-password', mid.loggedOut, function (req, res) {
  res.render('user/forgot-password');
});

router.post('/forgot-password', mid.loggedOut, function (req, res, next) {
  if (req.body.userID) {
    User.findByUserID(req.body.userID, function (error, user) {
      if (error || !user) {
        var err = new Error('Sorry, user \"' + req.body.userID + '\" was not found');
        // @todo: correct status
        err.status = 404;
        return res.render('user/forgot-password',
          {message: {
            type: 'warning',
            text: err
          }}
        );
      } else {
        // @todo generate auth token


        // var generateToken = User.generateToken(req.body.userID)
        //   .then(function (value) {
        //     console.log("Token generated", value);
        //   });



        // save token with this _userID
        // study how to make token generation secret, otherwise someone could generate their own
        // pass token to the email

        mailer.sendLostPassword({
          "_userID": user._userID,
          "email": user.email
        }, req);
        return res.render('user/forgot-password',
          {
            message: {
              type: 'success',
              text: 'Please check your email with instructions how to reset your password.'
            }
          }
        );
      }
    });
  // When form is not filled in
  } else {
    var err = new Error('Please enter your username');
    err.status = 401;
    res.render('user/forgot-password',
      {message: {
        type: 'warning',
        text: err
      }}
    );
  }
});

// ---------------------------------------------
// Forgotten username "login/forgot-user-name"

router.get('/forgot-user-name', mid.loggedOut, function (req, res) {
  res.render('user/forgot-user-name');
});

router.post('/forgot-user-name', mid.loggedOut, function (req, res, next) {
  if (req.body.email) {
    User.findByEmail(req.body.email, function (error, user) {
      if (error || !user) {
        var err = new Error('Sorry, user with email \"' + req.body.email + '\" was not found');
        // @todo: correct status
        err.status = 404;
        return res.render('user/forgot-user-name',
          {message: {
            type: 'warning',
            text: err
          }}
        );
      } else {

        mailer.sendLostUserName({
          "_userID": user._userID,
          "email": user.email
        }, req);

        return res.render('user/forgot-user-name',
          {
            message: {
              type: 'success',
              text: 'Your username was sent to your email '+ user.email
            }
          }
        );
      }
    });
  // When form is not filled in
  } else {
    var err = new Error('Please enter the email address');
    err.status = 401;
    res.render('user/forgot-user-name',
      {message: {
        type: 'warning',
        text: err
      }}
    );
  }
});

router.get('/new-password', [mid.loggedOut, mid.newPasswordTokenCheck], function (req, res) {
  res.render('user/new-password');
});

// ---------------------------------------------
// Module exports

module.exports = router
