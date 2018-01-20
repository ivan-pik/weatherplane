'use strict';

var API = require('../api/api.js');

const TemporaryWeather = {};

// Weather: Array, Range - Integer n of days
const applyRange = function (weather, range) {
	let end = range * 24;
	let reducedHours = weather.slice(0, end);
	weather = reducedHours;
	return weather;
}

// Get Temporary Weather

TemporaryWeather.getTemporaryWeather = function(latitude,longitude,range, callback) {

		
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
			hourly: applyRange(newWeather.hourly, range),
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
