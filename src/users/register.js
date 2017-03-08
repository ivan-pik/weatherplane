'use strict';

// ---------------------------------------------
// Modules
var express = require('express')
var router = express.Router()
var User = require('./models/user.js');
var mailer = require('./mailer.js');


// ---------------------------------------------
// User registration

router.post('/', function (req, res, next) {
  // @todo: Only allow a-z, 0-9,"_", "-", "." in userID
  // @todo: Add server side e-mail validation

  console.log(req.body);

  // -----------------------------
  // All data provided
  if (req.body.userID &&
      req.body.email &&
      req.body.password) {

      var UserData = {
        _userID: req.body.userID,
        email: req.body.email,
        password: req.body.password
      };

      User.create(UserData, function (error, user) {
        if (error) {
          let errors = [];
          errors.push({
            code: "U04",
            title: "User with this username or email already exists"
          });

          // On duplicate entry (user name or e-mail)
          if (error.code == 11000) {
            // Duplicated _userID
            if (error.errmsg.includes("_userID_1")) {
              errors.push({
                code: "U05",
                title: "User with this username already exists"
              });
            }
            // Duplicated email
            else if (error.errmsg.includes("email_1")) {
              errors.push({
                code: "U06",
                title: "User with this email already exists"
              });
            }

            return res.status(400).json( { errors: errors } );

          } else {
              // Any other error
              return next(error);
          }
        } else {
          // Yay, a new user is  created
          // send confirm mail
          mailer.sendRegistrationConfirmation(req);

          res.status(201).location(req.app.locals.siteURL + 'users/' + req.body.userID).json( {
            "success" : true,
            "data" : {
              "userID" : req.body.userID,
              "email" : req.body.email
            }
          } );
        }
      })
  // -----------------------------
  // Some data is missing
  } else {
    var errorMissingUserData = {
      code: "U00",
      title: "Not all required data were provided",
      description: "Required fields are: \'userID\', \'email\', \'password\'."
    };
    var errorMissingUserID = {
      code: "U01",
      title: "Missing \'userID\'"
    };
    var errorMissingEmail = {
      code: "U02",
      title: "Missing \'email\'"
    };
    var errorMissingPassword = {
      code: "U03",
      title: "Missing \'password\'"
    };

    let errors = [errorMissingUserData];

    if(!req.body.userID) {
      errors.push(errorMissingUserID);
    }
    if(!req.body.email) {
      errors.push(errorMissingEmail);
    }
    if(!req.body.password) {
      errors.push(errorMissingPassword);
    }

    res.status(400).json( { errors: errors } );
  }
})



// ---------------------------------------------
// Module exports

module.exports = router
