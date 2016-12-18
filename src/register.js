'use strict';

// ---------------------------------------------
// Modules
var express = require('express')
var router = express.Router()
var mid = require('./middleware/users');
var User = require('./models/user.js');
var mailer = require('./mailer.js');

// ---------------------------------------------
// User registration page "/register"

router.get('/',mid.loggedOut , function (req, res) {
  res.render('user/register');
})

// ---------------------------------------------
// User registration page "/john-smith" POST

router.post('/', function (req, res, next) {
  // @todo: Only allow a-z, 0-9,"_", "-", "." in userID
  // @todo: Add server side e-mail validation
  if (req.body.userID &&
    req.body.email &&
    req.body.password &&
    req.body.confirmPassword) {
      if (req.body.password != req.body.confirmPassword) {
        var err = new Error('Passwords don\'t match');
        err.status = 400;
        return res.render('user/register',
          {
            message: {
              type: 'warning',
              text: err
            },
            form: {
              prefill: {
                userID: req.body.userID || '',
                email: req.body.email || ''
              }
            }
          }
        );
      }

      var UserData = {
        _userID: req.body.userID,
        email: req.body.email,
        password: req.body.password
      };

      User.create(UserData, function (error, user) {
        if (error) {
          // On duplicate entry (user name or e-mail)
          if (error.code == 11000) {
            // Duplicated _userID
            if (error.errmsg.includes("_userID_1")) {
              var err = new Error('User \"' + req.body.userID + '\" already exists');
            }
            // Duplicated email
            else if (error.errmsg.includes("email_1")) {
              var err = new Error('User with email \"' + req.body.email + '\" already exists!');
            }
            // Fallback error in case the detection above fails
            else {
              var err = new Error('Sorry someone with this name or e-mail already exists');
            }

            err.status = 400;
            return res.render('user/register',
              {
                message: {
                  type: 'warning',
                  text: err
                }
              }
            );
          } else {
              // Any other error
              return next(error);
          }
        } else {
          // Yay, a new user is  created
          req.session.userId = user._id;
          req.session.userSlug = user._userID;

          // send mail
          mailer.sendRegistrationConfirmation(req);

          res.redirect('/user/'+req.session.userSlug);
        }
      })

  } else {
    var err = new Error('All fields required');
    err.status = 400;
    res.render('user/register',
      {
        message: {
          type: 'warning',
          text: err
        },
        form: {
          prefill: {
            userID: req.body.userID || '',
            email: req.body.email || ''
          }
        }
      }
    );
  }
})



// ---------------------------------------------
// Module exports

module.exports = router
