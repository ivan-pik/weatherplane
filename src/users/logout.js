'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');


// ---------------------------------------------
// User logout page "/logout"

router.get('/', function (req, res) {
  if (req.session) {
    req.session.destroy(function(err) {
      if(err) {
        return next(error);
      } else {
        return res.redirect('/')
      }
    });
  }
})



// ---------------------------------------------
// Module exports

module.exports = router
