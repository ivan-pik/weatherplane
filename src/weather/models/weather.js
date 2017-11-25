'use strict';

var mongoose = require('mongoose');
var API = require('../api/api.js');
var Place = require('../../places/models/place.js');


const hasLocationChanged = function(latitude, longitude, placeID) {
	return new Promise(function (resolve, reject) {
		Place.getCoordinates(placeID, function(error, coordinates) {

			if (latitude != coordinates.latitude && longitude != coordinates.longitude) {
				resolve(coordinates);
			}
			else {
				resolve(false);
			}
		})
	});
}




var WeatherSchema = new mongoose.Schema({
	_placeId: {
		type: String,
		required: true,
		trim: true
	},
	provider: {
		type: String,
		required: true,
		trim: true
	},
	updated: { type: Date, default: Date.now },
	location: {
		latitude: {type: Number},
		longitude: {type: Number}
	},
	currently: {type: Object},
	hourly: {type: Array},
	daily: {type: Array},
	info: {type: Object}
},
{
	collection: 'weather',
	versionKey: false
});



// This will get locally saved weather or fetch a new one if too old

WeatherSchema.statics.getWeather = function(weatherID, callback) {
	Weather.findById(weatherID)
		.exec(function (error, weather) {
			if(error) {
				return callback(error, null);
			} else if (!weather) {
				var err = new Error('Place not found');
				err.status = '401';
				return callback(err);
			}
			else {
				let fetchNewWeather = false;
				// @todo: move to settings
				const WEATHER_EXPIRATION = 0.5 *60*60*100;


				// Check if the weather document has data (new places create empty weather docs)
				if (weather.hourly.length == 0
				|| (new Date() - weather.updated) > WEATHER_EXPIRATION) {
					fetchNewWeather = true;
				}



				// Check if location is still the same

				hasLocationChanged(weather.location.latitude, weather.location.longitude, weather._placeId).then(
					function(locationChanged) {
						if (locationChanged) {
							fetchNewWeather = true;
						}



						if(fetchNewWeather) {



							Weather.updateWeather(weather._id, function(error, newWeather) {
								if (error) {
									return callback(error);
								}
								return callback(null, newWeather);
							});


						} else {
							return callback(null, weather);
						}
					}
				);



			}
		})
}

// This will update weather doc with the newest weather data from weather API

WeatherSchema.statics.updateWeather = function(weatherID, callback) {
	Weather.findById(weatherID)
		.exec(function (error, weather) {
			if(error) {
				return callback(error, null);
			} else if (!weather) {
				var err = new Error('Weateher not found');
				err.status = '401';
				return callback(err);
			}
			else {
				let weatherQuery = {
					provider: weather.provider,
					latitude: weather.location.latitude,
					longitude: weather.location.longitude
				}

				hasLocationChanged(weather.location.latitude, weather.location.longitude, weather._placeId).then(
					function(newCoordinates) {
						if (newCoordinates) {
							weatherQuery.latitude = newCoordinates.latitude;
							weatherQuery.longitude = newCoordinates.longitude;
						}


						// Fetch new weather data from API
						API.getWeather(weatherQuery)
							.then(
								function(newWeather) {


									weather.currently = newWeather.currently;
									weather.hourly = newWeather.hourly;
									weather.daily = newWeather.daily;
									weather.info = newWeather.info;
									weather.updated = new Date;

									weather.save(function (err, updatedWeather) {
										if (err) return callback(err);
										return callback(null, updatedWeather);
									});
								}
							);
					}
				);
			}
		})
}


var Weather = mongoose.model('Weather', WeatherSchema);


module.exports = Weather;
