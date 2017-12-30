'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');





// ---------------------------------------------
// User profile page "/john-smith"

router.get('/:userId/', mid.apiAuth , function (req, res, next) {


  User.findByUserID(req.params.userId, function (error, user) {
    if (error) {
      return res.json({
        errors: [
          {
            success : false,
            title : "This user does not exist!"
          }
        ]
      });
    } else {
      return res.json({
        success : true,
				data : {
					userID : user._userID,
					email : user.email
				}
      });
    }
  });

});



// ---------------------------------------------
// Module exports

module.exports = router
