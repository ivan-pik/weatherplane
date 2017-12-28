'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');


// ---------------------------------------------
// Settings "/settings/change-email"
// @todo: Rewrite to JSON API

router.post('/change-email', mid.apiAuthV2, function (req, res) {

	if (req.body.email) {
		// @todo validation of propper email format
		User.updateEmail(req.body.userID, req.body.email, function (error, user) {
			if (error) {
				res.json(error);
				// @todo handle error
			} else {
				return res.json({
					success : true,
				});
			}
		});

	} else {
		// @todo: send missing data error
	}

});





// ---------------------------------------------
// Settings "/settings/change-email"
// @todo: Rewrite to JSON API

router.post('/change-password', mid.apiAuthV2, function (req, res) {
	if (req.body.password && req.body.newPassword) {
		
		User.authenticate(req.token._doc._userID, req.body.password, function (error, user) {
			if (error || !user) {
				var templateData = {
					message: {
						type: 'danger',
						text: "Wrong current password"
					}
				}
				res.render('users/change-password', templateData);
			} else {

				User.updatePassword(req.token._doc._userID, req.body.newPassword, function (error, user) {
					if (error) {
						// @todo handle error
						debugger;
					} else {
						return res.json({
							success : true,
						});
					}
				});
			}
		});

	} else {
		var templateData = {
			message: {
				type: 'warning',
				text: "All fields need to be filled"
			}
		}
		res.render('users/change-password', templateData);
	}

});






// ---------------------------------------------
// Module exports

module.exports = router
