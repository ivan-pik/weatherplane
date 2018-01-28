'use strict';

// ---------------------------------------------
// Modules
var express = require('express')
var router = express.Router()
var User = require('./models/user.js');
var mailer = require('./mailer.js');


// ---------------------------------------------
// User registration

router.post('/', function (req, res, next) {
	// @todo: Only allow a-z, 0-9,"_", "-", "." in userID
	// @todo: Add server side e-mail validation




	// -----------------------------
	// All data provided
	if (req.body.userID &&
			req.body.email &&
			req.body.password) {

			var UserData = {
				_userID: req.body.userID,
				email: req.body.email,
				password: req.body.password,
				windUnit : req.body.windUnit,
				timeFormat : req.body.timeFormat,
				temperatureUnit : req.body.temperatureUnit,
				weatherRange : req.body.weatherRange,
			};

			

			User.create(UserData, function (error, user) {
				
				if (error) {
					let errors = [];
					errors.push({
						code: "username-or-email-already-registered",
						title: "User with this username or email already exists"
					});

					// On duplicate entry (user name or e-mail)
					if (error.code == 11000) {
						// Duplicated _userID
						if (error.errmsg.includes("_userID_1")) {
							errors.push({
								code: "username-exists",
								title: "User with this username already exists"
							});
						}
						// Duplicated email
						// @this doesn't seem to work
						else if (error.errmsg.includes("email_1")) {
							errors.push({
								code: "user-email-exists",
								title: "User with this email already exists"
							});
						}

						return res.status(400).json( { errors: errors } );

					} else {
							// Any other error
							return next(error);
					}
				} else {
					// Yay, a new user is  created
					// send confirm mail
					mailer.sendRegistrationConfirmation(req);

					res.json(
						{
							success: true,
							message: 'New user created',
						}
					);
				}
			})
	// -----------------------------
	// Some data is missing
	} else {
		var errorMissingUserData = {
			code: "missing-data",
			title: "Not all required data were provided",
			description: "Required fields are: \'userID\', \'email\', \'password\'."
		};
		var errorMissingUserID = {
			code: "missing-userID",
			title: "Missing \'userID\'"
		};
		var errorMissingEmail = {
			code: "missing-email",
			title: "Missing \'email\'"
		};
		var errorMissingPassword = {
			code: "missing-password",
			title: "Missing \'password\'"
		};

		let errors = [errorMissingUserData];

		if(!req.body.userID) {
			errors.push(errorMissingUserID);
		}
		if(!req.body.email) {
			errors.push(errorMissingEmail);
		}
		if(!req.body.password) {
			errors.push(errorMissingPassword);
		}

		res.status(400).json( { errors: errors } );
	}
})



// ---------------------------------------------
// Module exports

module.exports = router
