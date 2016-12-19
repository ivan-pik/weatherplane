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

// ---------------------------------------------
// newPasswordTokenCheck
/*
This checks if user has a valid token to be
able to change a password on "login/new-password".
This can be used to prevent displaying this page
to missing/invalid tokens and for authenticating the POST
request for the actual change.
*/
function newPasswordTokenCheck (req, res, next) {
  if (req.query && req.query.auth) {
    
    // @todo: search for a user with this token associated
      // Check if the req token is expired
        // IF (actual time - token time > token.expiration)
          // Error: This link is no longer valid and redirect to the login page

      // check if some user has it
      // IF (no associated token found)
        // Error: This link is no longer valid and redirect to the login page
      // ELSE
        // All good, callback

    next();
  }

  // When no token is present, just go to "/login"
  return res.redirect('/login');
}

// ---------------------------------------------
// Module exports

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.newPasswordTokenCheck = newPasswordTokenCheck;
