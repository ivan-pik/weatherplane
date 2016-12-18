'use strict';

// ---------------------------------------------
// loggedOut
/*
When user is logged-in, redirect to profile page
otherwise call next.
Typically used so that logged-in user doesn't see login
or register pages
*/
function loggedOut (req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/user/'+req.session.userSlug);
  }
  return next();
}

// ---------------------------------------------
// requiresLogin
/*
When unaunthenticated user is acessing unauthorised pages
redirect to login form. When authenticated user is accessing other
user's profile, show error.
*/

function requiresLogin (req, res, next) {
  if (req.session && req.session.userId) {
    if (req.params.userId != req.session.userSlug) {
      var err = new Error("This is not your profile. Please log out and log in as \"" + req.params.userId + "\" to access this profile.");
      err.status = 403;
      return next(err);
    }
    return next();
  } else {
    var err = new Error("You need to login to see this page");
    err.status = 403;
    res.render('user/login',
      {
        message: {
          type: 'warning',
          text: err
        },
        form: {
          prefill: {
            userId: req.params.userId
          }
        }
      }
    );
  }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
