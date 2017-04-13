'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');
var User = require('./models/user.js');
var Token = require('./models/token.js');
var mailer = require('./mailer.js');
var resetPasswordTokenCheck = require('./resetPasswordTokenCheck');

// @todo: Rewrite to JSON API
router.post('/forgot-password', mid.loggedOut, function (req, res, next) {
  if (req.body.userID) {
    User.findByUserID(req.body.userID, function (error, user) {
      if (error || !user) {
        return res.status(403).send({
            success: false,
            message: 'User \"' + req.body.userID + '\" was not found',
            errors: [
                {
                    title : "This username was not found",
                    code : "username-not-found"
                }
            ]
        });
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
              return res.send({
                  success: true,
                  message: 'User exists and password reset e-mail has been sent'

              });
            });
            // todo handle promise error .catch
          }
      }
    });
  // When form is not filled in
  } else {
    return res.status(403).send({
        success: false,
        message: 'Username was not provided',
        errors: [
            {
                title : "Username was not provided",
                code : "username-not-provided"
            }
        ]
    });
  }
});

// ---------------------------------------------
// Forgotten username "login/forgot-user-name"

router.post('/forgot-user-name', function (req, res, next) {
  if (req.body.email) {
    User.findByEmail(req.body.email, function (error, user) {
      if (error || !user) {

          return res.status(403).send({
              success: false,
              message: 'No user found with this email',
              errors: [
                  {
                      title : "No user found with this email",
                      code : "email-not-found"
                  }
              ]
          });
      } else {

        mailer.sendLostUserName({
          "_userID": user._userID,
          "email": user.email
        }, req);



        return res.send({
            success: true,
            message: 'Your username was sent to your email'
        });
      }
    });
  // When form is not filled in
  } else {


      return res.status(403).send({
          success: false,
          message: 'Email was not provided',
          errors: [
              {
                  title : "Email not provided",
                  code : "email-not-provided"
              }
          ]
      });
  }
});






// @todo: Rewrite to JSON API

router.post('/reset-password',  function (req, res) {


    // Check if we have all we need to go ahead
    if(!req.body.token || !req.body.userID || !req.body.password) {
        // @todo: return more specific errors
        return res.status(403).send({
            success: false,
            message: 'Some data missing',
            errors: [
                {
                    title : "Some required data is missing",
                    code : "data-missing"
                }
            ]
        });
    }

    resetPasswordTokenCheck.newPasswordTokenCheck(req.body.token, req.body.userID, function(error, success) {

        if (error) {
            if(error.code == 'token-expired') {
                return res.status(403).send({
                    success: false,
                    message: 'Token expired',
                    errors: [
                        {
                            title : "Token expired",
                            code : "token-expired"
                        }
                    ]
                });
            } else if (error.code == 'token-is-invalid') {
                return res.status(403).send({
                    success: false,
                    message: 'Token is invalid',
                    errors: [
                        {
                            title : "Token is invalid",
                            code : "token-is-invalid"
                        }
                    ]
                });
            }
        } else if (success) {

            // userID, newPassword, callback
            User.updatePassword(req.body.userID, req.body.password, function (error, user) {
                if (error) {
                    // @todo handle error
                    // console.log(error)


                } else {
                    Token.delete(req.body.userID, function(error) {
                        if (error) {
                            // @todo handle error
                        } else {
                            return res.send({
                                success: true,
                                message: 'Password has been changes'
                            });
                        }
                    });
                }
            });
        }
    });
});

// ---------------------------------------------
// Module exports

module.exports = router
