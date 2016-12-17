'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();




// ---------------------------------------------
// define the home page route
router.get('/', function (req, res) {
  res.render('home');
})



// ---------------------------------------------
// Module exports

module.exports = router
