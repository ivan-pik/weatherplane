'use strict';

function loggedOut (req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('user/'+req.session.userSlug);
  }
  return next();
}

function requiresLogin (req, res, next) {
  if (req.session && req.session.userId) {
    if (req.params.userId != req.session.userSlug) {
      var err = new Error("This is not your profile");
      err.status = 403;
      return next(err);
    }
    return next();
  } else {
    var err = new Error("not logged in!!!");
    err.status = 403;
    return next(err);
  }
}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
