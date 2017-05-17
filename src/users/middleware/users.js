'use strict';
var Token = require('../models/token.js');


var checkToken = require('../checkToken.js');


// ---------------------------------------------
// API token auth

// @todo: change this to only verify the token, not to check if allowed to see resource
// @todo: Then use it in 'identify'

function apiAuth (req, res, next) {

  // check header or url parameters or post parameters for token
  // decode token
		// verifies secret and checks exp
		checkToken.checkToken(req, function (err, token) {
			if (err) {
				//@todo: nice error
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else if (token) {
				
				// res.header('Access-Control-Allow-Origin', '*');
				// res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
				// res.header('Access-Control-Allow-Methods', '*');
				// res.header('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
				// res.header('Access-Control-Max-Age', '1000');
				next();
			}
		});


}






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
    return next();
  } else {
    // return next();
    res.status(403).json({
      errors : [
        {
          code: "E01",
          title : "Not authorised to access this data"
        }
      ]
    });
  }
}



// ---------------------------------------------
// needsLogin
/*
This is a new version of the function from above
// @todo remove old version
*/

function needsLogin (req, res, next) {
  if (req.session && req.session.userId) {
    return next(null);
  } else {
    var err = new Error("You need to be logged-in to see this page");
    err.status = 403;
    res.render('users/login',
      {
        message: {
          type: 'warning',
          text: err
        }
      }
    );
  }
}



// ---------------------------------------------
// Module exports

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
module.exports.needsLogin = needsLogin;
module.exports.apiAuth = apiAuth;
