'use strict';

var API = require('../api/api.js');

const TemporaryWeather = {};


// Get Temporary Weather

TemporaryWeather.getTemporaryWeather = function(latitude,longitude, callback) {
		
	let weatherQuery = {
		provider: 'darksky',
		latitude: latitude,
		longitude: longitude
	}

	// Fetch new weather data from API
	API.getWeather(weatherQuery)
	.then((newWeather) => {

		let WeatherData = {
			provider: 'darksky',
			location: {
				latitude:  weatherQuery.latitude,
				longitude: weatherQuery.longitude
			},
			currently: newWeather.currently,
			hourly: newWeather.hourly,
			daily: newWeather.daily,
			info: newWeather.info,
			updated: new Date
		}

		callback(null, WeatherData);


	}).catch(error => {
		callback(error, null);
	});
}




module.exports = TemporaryWeather;
