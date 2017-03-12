'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');
var User = require('./models/user.js');
var Token = require('./models/token.js');
var mailer = require('./mailer.js');

// @todo: Rewrite to JSON API
router.post('/forgot-password', mid.loggedOut, function (req, res, next) {
  if (req.body.userID) {
    User.findByUserID(req.body.userID, function (error, user) {
      if (error || !user) {
        var err = new Error('Sorry, user \"' + req.body.userID + '\" was not found');
        // @todo: correct status
        err.status = 404;
        return res.render('users/forgot-password',
          {message: {
            type: 'warning',
            text: err
          }}
        );
      } else {
        var plainToken = "";
        // First remove all existing tokens for this user

        Token.find({ userID:req.body.userID }).remove(goOn);
        // @todo, making a mess here, rewrite with promise
        function goOn () {
          var generateToken = Token.generateToken(req.body.userID)
            .then(function (token) {
              plainToken = token;
              return new Promise(function (resolve, reject) {
                var TokenData = {
                  userID: req.body.userID,
                  token: token
                };
                Token.create(TokenData, function (error, tokenDoc) {
                  if (error) {
                    return next(error);
                  }
                  resolve(tokenDoc.token);
                });

              });
            })
            .then(function (token) {
              return new Promise(function (resolve, reject) {
                mailer.sendLostPassword({
                    "_userID": user._userID,
                    "email": user.email,
                    "token": plainToken
                  },
                  req,
                  function (error, sent) {
                    if (error) {
                      return next(error);
                    }
                    resolve(sent);
                  });
              });

            }).then(function (sent) {
              return res.render('users/login',
                {
                  message: {
                    type: 'success',
                    text: 'Please check your email with instructions how to reset your password.'
                  }
                }
              );
            });
            // todo handle promise error .catch
          }
      }
    });
  // When form is not filled in
  } else {
    var err = new Error('Please enter your username');
    err.status = 401;
    res.render('users/forgot-password',
      {message: {
        type: 'warning',
        text: err
      }}
    );
  }
});

// ---------------------------------------------
// Forgotten username "login/forgot-user-name"
// @todo: Rewrite to JSON API

router.get('/forgot-user-name', mid.loggedOut, function (req, res) {
  res.render('users/forgot-user-name');
});

router.post('/forgot-user-name', mid.loggedOut, function (req, res, next) {
  if (req.body.email) {
    User.findByEmail(req.body.email, function (error, user) {
      if (error || !user) {
        var err = new Error('Sorry, user with email \"' + req.body.email + '\" was not found');
        // @todo: correct status
        err.status = 404;
        return res.render('users/forgot-user-name',
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

        return res.render('users/forgot-user-name',
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
    res.render('users/forgot-user-name',
      {message: {
        type: 'warning',
        text: err
      }}
    );
  }
});




// @todo: Rewrite to JSON API

router.get('/new-password', [mid.loggedOut, mid.newPasswordTokenCheck], function (req, res) {
  // this is so I can validate it again after sending
  // @todo I would be better off just making the form post
  // to /new-password/token123456
  var form = {
    form: {
      token : req.query.token,
      username : req.query.userID
    }
  }

  res.render('users/new-password', form);
});


// @todo: Rewrite to JSON API

router.post('/new-password', mid.newPasswordTokenCheck, function (req, res) {
  // Handle input errors first
  if (req.body.password && req.body.confirmPassword) {
    if (req.body.password != req.body.confirmPassword) {
      var err = new Error('Passwords don\'t match');
      err.status = 400;
      return res.render('users/new-password',
        {
          message: {
            type: 'warning',
            text: err
          },
          form: {
            token : req.body.token,
            username : req.body.userID
          }
        }
      );
    } else {


      // @todo Change the password
      // authorised, userID, newPassword, callback
      User.updatePassword(true, req.body.userID, req.body.password, function (error, user) {
        if (error) {
          // @todo handle error

        } else {
          Token.delete(req.body.userID, function(error) {
            if (error) {
              // @todo handle error
            } else {
              var templateData = {
                message: {
                  type: 'success',
                  text: 'Password has been changed'
                },
                form: {
                  prefill: {
                    userId: req.body.userID
                  }
                }
              }

              // @todo redirect to /login
              // and display success message via flash message (yet to be implemented) "connect-flash" ?
              // res.redirect('/login/');

              // Meanwhile, keeping the same URL will do...

              res.render('users/login', templateData);
            }
          });
        }
      });



    }
  } else {
    var err = new Error('All fields are required');
    err.status = 400;
    res.render('users/new-password',
      {
        message: {
          type: 'warning',
          text: err
        },
        form: {
          token : req.body.token,
          username : req.body.userID
        }
      }
    );
  }




});

// ---------------------------------------------
// Module exports

module.exports = router
