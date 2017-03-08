'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');
var User = require('./models/user.js');
var Token = require('./models/token.js');
var mailer = require('./mailer.js');
var jwt = require('jsonwebtoken');
var envSettings = require('../envSettings.json');


// ---------------------------------------------


router.post('/', function (req, res, next) {
  if (req.body.userID && req.body.password) {
    User.authenticate(req.body.userID, req.body.password, function (error, user) {
      // if user is not found or password is wrong
      if (error || !user) {
        console.log("yahhooo");
        res.status(401).json(
          {
            errors : [{
              code : "A00",
              title : "Wrong combination of \'userID\' and \'password\'"
            }]
          }
        );
      // if user is found and password is right
      } else {
        req.session.userId = user._id;
        req.session.userSlug = user._userID;


        // create a token
        var token = jwt.sign(user, envSettings.secret, {
          expiresIn : 1440 // expires in 24 hours
        });

         res.json(
          {
            success: true,
            message: 'Enjoy your token!',
            token: token
          }
        );
      }
    });


  } else {
    let errors = [{
      code : "A01",
      title : "Missing \'userID\' and/or \'password\'"
    }];
    if (!req.body.userID) {
      errors.push({
        code : "A02",
        title : "Missing \'userID\'"
      });
    }
    if (!req.body.password) {
      errors.push({
        code : "A03",
        title : "Missing \'password\'"
      });
    }

    res.status(401).json({
      errors : errors
    });


  }
})


module.exports = router
