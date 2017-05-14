'use strict';
var jwt = require('jsonwebtoken');
var envSettings = require('../envSettings.json');

const checkToken = function(req, callback) {
	var token = req.body.token || req.query.token || req.headers.authorization;

	if (token) {
		jwt.verify(token, envSettings.secret, function(err, decoded) {
			if (err) {
				callback(err);


			} else if (decoded) {
				// if everything is good, save to request for use in other routes
				var err = false;
				callback(err, decoded);


			}
		});
	} else {
		let err = 'no-token-provided';
		callback(err);
	}


}


module.exports.checkToken = checkToken;
