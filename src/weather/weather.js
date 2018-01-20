'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var Weather = require('./models/weather.js');


// @todo: move to settings
const DEFAULT_WEATHER_PROVIDER = "darksky";



// ---------------------------------------------
//

router.get('/:weatherID/:days/', function (req, res, next) {

	// Look up the weather record for given placeID and provider paremeter

	let range = req.params.days || 3;

	Weather.getWeather(req.params.weatherID, range , function (error, weather) {
			if (error) {
				return res.status(400).json({
					success : false,
					message: "Did not find requested weather data",
					errors: [
						{
							title : "This weather data does not exist",
							code : "weather-data-not-found"
						}
					]
				});
			} else {
				return res.json({
					success : true,
					data : weather
				});
			}
		}
	);
});



// ---------------------------------------------
// Module exports

module.exports = router
