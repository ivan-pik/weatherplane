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
// User home page "/"

router.get('/', function (req, res) {
  res.send('user home page')
})





// ---------------------------------------------
// User profile page "/john-smith"

router.get('/:userId/', mid.requiresLogin , function (req, res, next) {
  User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        return res.render('user/profile', {'name': user._userID});
      }
    })

});

// ---------------------------------------------
// User location page "/john-smith/yatton"

router.get('/:userId/:locationId', function (req, res) {

  // Checking if user exists and callbacks


});


// ---------------------------------------------
// Module exports

module.exports = router
