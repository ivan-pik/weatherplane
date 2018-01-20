'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var TemporaryWeather = require('./models/temporaryWeather.js');

// @todo: move to settings
const DEFAULT_WEATHER_PROVIDER = "darksky";



// ---------------------------------------------
//

router.get('/', function (req, res, next) {
	
	let range = req.query.range || 3;

	if (req.query && req.query.lat &&  req.query.lng) {
		TemporaryWeather.getTemporaryWeather(req.query.lat, req.query.lng, range, function (error, weather) {
			
			if (error) {
				// @todo: Handle the error
			}

			if (weather) {
				res.json({
					success: true,
					message: 'Enjoy the weather',
					data: {
						weather : weather
					}
				});
			}

			

		});
	} else {
		// @todo: return error, missing query
	}

});



// ---------------------------------------------
// Module exports

module.exports = router
