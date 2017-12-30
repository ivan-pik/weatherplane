'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var User = require('./models/user.js');
var mid = require('./middleware/users');



// ---------------------------------------------
// Settings "/settings/:ivanpik"
// This is used to fetch PUBLIC units and formats settings
// when displaying a public place while logged out

router.get('/:userID/', function (req, res) {
	// @todo validation of propper email format
	User.getPublicSettings(req.params.userID, function (error, user) {
		if (error) {
			res.json(error);
			// @todo handle error
		} else {
			return res.json({
				success : true,
				data: user
			});
		}
	});

});


// ---------------------------------------------
// Settings "/settings/change-email"

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
// Settings "/settings/change-date-format"

router.post('/change-date-format', mid.apiAuthV2, function (req, res) {
	if (req.body.dateFormat) {
		// @todo validation of propper email format
		User.updateDateFormat(req.token._doc._userID, req.body.dateFormat, function (error, user) {
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
// Settings "/settings/change-wind-unit"

router.post('/change-wind-unit', mid.apiAuthV2, function (req, res) {
	if (req.body.windUnit) {
		// @todo validation of propper email format
		User.updateWindUnit(req.token._doc._userID, req.body.windUnit, function (error, user) {
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
// Settings "/settings/change-time-format"

router.post('/change-time-format', mid.apiAuthV2, function (req, res) {
	if (req.body.timeFormat) {
		// @todo validation of propper email format
		User.updateTimeFormat(req.token._doc._userID, req.body.timeFormat, function (error, user) {
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
// Settings "/settings/change-temperature-unit"

router.post('/change-temperature-unit', mid.apiAuthV2, function (req, res) {
	if (req.body.temperatureUnit) {
		// @todo validation of propper email format
		User.updateTemperatureUnit(req.token._doc._userID, req.body.temperatureUnit, function (error, user) {
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
