'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();




// ---------------------------------------------
// define the home page route
router.get('/', function (req, res) {
  res.json({
    success : true,
    message : "hi"
  });
})


// ---------------------------------------------
// define the home page route
router.get('/', function (req, res) {
    res.json({
        success : true,
        message : "hi"
    });
})



// ---------------------------------------------
// Module exports

module.exports = router
