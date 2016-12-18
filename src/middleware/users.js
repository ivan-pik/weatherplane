'use strict';

function loggedOut (req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/user/'+req.session.userSlug);
  }
  return next();
}

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
