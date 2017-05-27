'use strict';
var darksky = require('./darksky.js');

// getWeather

// query = {
// 	provider: Weather API service
// 	latitude:
// 	longitude:
// }

const getWeather = function(query) {
	
	return new Promise(function (resolve, reject) {
		switch (query.provider) {
			case 'darksky':
				darksky.fetchWeather(query).then(
					function(data) {
						resolve(data);
					}
				);
		}
	});
}


module.exports.getWeather = getWeather;
