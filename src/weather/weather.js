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

router.get('/:weatherID/', function (req, res, next) {

	// Look up the weather record for given placeID and provider paremeter


	Weather.getWeather(req.params.weatherID, function (error, weather) {
			if (error) {
				console.log("error");
				console.log(error);
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
