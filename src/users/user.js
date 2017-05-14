'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');


// ---------------------------------------------
// Users  "/users"

router.get('/' , function (req, res, next) {
  // @todo
  res.json({
    success : true,
    message : "list of resources will be here"

  });

});


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
      // return res.render('users/profile', {'name': user._userID});
    }
  });

});



// ---------------------------------------------
// Module exports

module.exports = router
