'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');

// ---------------------------------------------
// Utilities

var database = require('./database');


// ---------------------------------------------
// Views
// ---------------------------------------------

// ---------------------------------------------
// Settings "/settings"

router.get('/', function (req, res) {
  // User is logged in
  if (res.locals.currentUser) {
    console.log(req);
    User.findByUserID(req.session.userSlug, function (error, user) {
      if (error || !user) {
        // @todo handle error
        console.log(error);
      } else {
        console.log(user);
        let templateData = {
          user: {
            email: user.email
          }
        };
        return res.render('settings', templateData);
      }
    });
  } else {
    var err = new Error("You need to login to see this page");
    err.status = 403;
    res.render('user/login',
      {
        message: {
          type: 'warning',
          text: err
        }
      }
    );
  }
})

// ---------------------------------------------
// Settings "/settings/update-password"

router.post('/change-password', function (req, res) {

})


// ---------------------------------------------
// Module exports

module.exports = router
