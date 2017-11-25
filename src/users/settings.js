'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');


// ---------------------------------------------
// Views
// ---------------------------------------------



// ---------------------------------------------
// Settings "/settings/change-email"
// @todo: Rewrite to JSON API

router.get('/change-email', mid.needsLogin, function (req, res) {

	User.findByUserID(req.session.userSlug, function (error, user) {
		if (error || !user) {
			// @todo handle error
		} else {
			let templateData = {
				user: {
					email: user.email
				}
			};
			return res.render('users/change-email', templateData);
		}
	});

});

// ---------------------------------------------
// Settings "/settings/change-email"
// @todo: Rewrite to JSON API

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
		res.render('users/settings/change-password', templateData);
	}

});


// ---------------------------------------------
// Settings "/settings/update-password"
// @todo: Rewrite to JSON API

router.get('/change-password', mid.needsLogin, function (req, res) {
	res.render('users/change-password');
});

// ---------------------------------------------
// Settings "/settings/change-email"
// @todo: Rewrite to JSON API

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
				res.render('users/change-password', templateData);
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
					res.render('users/change-password', templateData);
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
		res.render('users/change-password', templateData);
	}

});






// ---------------------------------------------
// Module exports

module.exports = router
