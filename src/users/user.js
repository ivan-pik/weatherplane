'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');



// ---------------------------------------------
// Views
// ---------------------------------------------

// ---------------------------------------------
// User home page "/"

router.get('/', mid.loggedOut, function (req, res) {
  res.redirect('/login');
})





// ---------------------------------------------
// User profile page "/john-smith"

router.get('/:userId/', mid.requiresLogin , function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        return res.render('users/profile', {'name': user._userID});
      }
    })

});

// ---------------------------------------------
// User location page "/john-smith/yatton"

router.get('/:userId/:locationId', function (req, res) {
  res.send("location page");


});


// ---------------------------------------------
// Module exports

module.exports = router
