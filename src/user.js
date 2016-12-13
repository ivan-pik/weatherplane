// ---------------------------------------------
// Modules

var express = require('express')
var router = express.Router()

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

router.get('/:userId/', function (req, res) {

  // Checking if user exists and callbacks
  (function () {
    let findUsersLocations = function () {
      console.log("Going to search for locations");
      res.send('This user exists! The dream is that you will see locations of user \"' + user + '\" here.');
    }

    let showError = function () {
      console.log("Sorry, this user doesn't exist");
      res.send('It seems that user \"' + user + '\" does not exist');
    }

    database.userExists(req.params.userId, findUsersLocations, showError);
  })();

})

// ---------------------------------------------
// User location page "/john-smith/yatton"

router.get('/:userId/:locationId', function (req, res) {

  // Checking if user exists and callbacks
  (function () {
    let findUsersLocations = function () {
      res.send("Asking for a location slug \"" + req.params.locationId + "\" of the existing user \"" + req.params.userId + "\". Don't know yet if the location exists though...Also need to check if the location is public - otherwise request login first! Callback hell. Please help");
    }

    let showError = function () {
      console.log("Sorry, this user doesn't exist");
      res.send('It seems that user \"' + user + '\" does not exist. Not sure what are you trying to do here.');
    }

    database.userExists(req.params.userId, findUsersLocations, showError );
  })();
})

// ---------------------------------------------
// Module exports

module.exports = router
