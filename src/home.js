// ---------------------------------------------
// Modules
var express = require('express')
var router = express.Router()

// ---------------------------------------------
// define the home page route
router.get('/', function (req, res) {
  res.send('home page - no user logged in (not that I can tell now, hehe). try  /user/ivanpik/yatton in URL');
})

// ---------------------------------------------
// Module exports

module.exports = router
