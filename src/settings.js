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
// Settings "/settings/change-email"

router.get('/change-email', mid.needsLogin, function (req, res) {

  User.findByUserID(req.session.userSlug, function (error, user) {
    if (error || !user) {
      // @todo handle error
      console.log(error);
    } else {
      let templateData = {
        user: {
          email: user.email
        }
      };
      return res.render('settings/change-email', templateData);
    }
  });

});

// ---------------------------------------------
// Settings "/settings/change-email"

router.post('/change-email', mid.needsLogin, function (req, res) {

  if (req.body.email) {
    // @todo validation of propper email format
    User.updateEmail(true, req.session.userId, req.body.email, function (error, user) {
      if (error) {
        // @todo handle error
      } else {
        let templateData = {
          message: {
            type: 'success',
            text: "Email has been changed"
          }
        }
        // @todo implement flash message with success message
        res.redirect('/settings');
      }
    });

  } else {
    var templateData = {
      message: {
        type: 'warning',
        text: "All fields need to be filled"
      }
    }
    res.render('settings/change-password', templateData);
  }

});


// ---------------------------------------------
// Settings "/settings/update-password"

router.get('/change-password', mid.needsLogin, function (req, res) {
  res.render('settings/change-password');
});

// ---------------------------------------------
// Settings "/settings/change-email"

router.post('/change-password', mid.needsLogin, function (req, res) {

  if (req.body.password && req.body.newPassword && req.body.confirmPassword) {
    User.authenticate(req.session.userSlug, req.body.password, function (error, user) {
      if (error || !user) {
        var templateData = {
          message: {
            type: 'danger',
            text: "Wrong current password"
          }
        }
        res.render('settings/change-password', templateData);
      } else {

        if (req.body.newPassword == req.body.confirmPassword) {
          User.updatePassword(true, req.session.userId, req.body.newPassword, function (error, user) {
            if (error) {
              // @todo handle error
            } else {
              let templateData = {
                message: {
                  type: 'success',
                  text: "Password has been changed"
                }
              }
              // @todo implement flash message with success message
              res.redirect('/settings');
            }
          });
        } else {
          var templateData = {
            message: {
              type: 'danger',
              text: "New passwords don\'t match"
            }
          }
          res.render('settings/change-password', templateData);
        }
      }
    });

  } else {
    var templateData = {
      message: {
        type: 'warning',
        text: "All fields need to be filled"
      }
    }
    res.render('settings/change-password', templateData);
  }

});



// ---------------------------------------------
// Module exports

module.exports = router
