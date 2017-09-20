'use strict';

var envSettings = require('../../envSettings.json');
var HTTP = require('axios');
var PARAMS = "?exclude=[minutely,alerts,flags]&extend=hourly&units=si";

var URL = "https://api.darksky.net/forecast/" + envSettings.weatherAPIkeys.darksky + '/';



const fetchWeather = function(query) {
	return new Promise(function (resolve, reject) {



		let coordinates = query.latitude + ',' + query.longitude;

		HTTP.get(URL + coordinates + PARAMS)
			.then(function (response){



				let info = {
					timezone: response.data.timezone,
				}

				let normalisedCurrently = {
					// clear-day, clear-night, rain, snow, sleet, wind, fog, cloudy, partly-cloudy-day,partly-cloudy-night or not-available
					icon: normaliseIcon(response.data.currently.icon),
					precipIntensity: response.data.currently.precipIntensity,
					precipIntensityError: response.data.currently.precipIntensityError,
					precipProbability: response.data.currently.precipProbability,
					precipType: normalisePrecipType(response.data.currently.precipType),
					temperature: response.data.currently.temperature,
					apparentTemperature: response.data.currently.apparentTemperature,
					humidity: response.data.currently.humidity,
					windSpeed: response.data.currently.windSpeed,
					windGust: response.data.currently.windGust,
					windBearing: response.data.currently.windBearing,
					visibility: response.data.currently.visibility,
					cloudCover: response.data.currently.cloudCover
				};

				let normalisedHourly = normaliseHourly(response.data.hourly.data);

				let normalisedDaily = normaliseDaily(response.data.daily.data);;

				let weather = {
					info: info,
					currently: normalisedCurrently,
					hourly: normalisedHourly,
					daily: normalisedDaily
				}

				resolve(weather);

			})


	});
}

// This isn't really necessary at the moment
// as there is only one weather provider, but it's good to have
// this prepared in case I switch/add weather API


const normaliseIcon = function (icon) {
	switch(icon) {
		case 'clear-day':
			return 'clear-day'
		case 'clear-night':
			return 'clear-night'
		case 'rain':
			return 'rain'
		case 'snow':
			return 'snow'
		case 'sleet':
			return 'sleet'
		case 'wind':
			return 'wind'
		case 'fog':
			return 'fog'
		case 'cloudy':
			return 'cloudy'
		case 'partly-cloudy-day':
			return 'partly-cloudy-day'
		case 'artly-cloudy-night':
			return 'artly-cloudy-night'
		default:
			return 'not-available'
	}
}

const normalisePrecipType = function (type) {
	switch(type) {
		case 'rain':
			return 'rain'
		case 'snow':
			return 'snow'
		case 'sleet':
			return 'sleet'
		default:
			return 'not-available'
	}
}

const normaliseHourly = function (hourly) {
	let newHourly = [];
	hourly.forEach(function(hour) {
		let normalisedHour = {
			time: new Date(hour.time*1000),
			icon: normaliseIcon(hour.icon),
			precipIntensity: hour.precipIntensity,
			precipProbability: hour.precipProbability,
			precipType: normalisePrecipType(hour.precipType),
			temperature: hour.temperature,
			apparentTemperature: hour.apparentTemperature,
			humidity: hour.humidity,
			windSpeed: hour.windSpeed,
			windGust: hour.windGust,
			windBearing: hour.windBearing,
			visibility: hour.visibility,
			cloudCover: hour.cloudCover,
		};
		newHourly.push(normalisedHour);
	});
	return newHourly;
}

const normaliseDaily = function (daily) {
	let newDaily = [];
	daily.forEach(function(day) {
		let normalisedDay = {
			time: new Date(day.time*1000),
			icon: normaliseIcon(day.icon),
			sunriseTime: new Date(day.sunriseTime*1000),
			sunsetTime: new Date(day.sunsetTime*1000)
		};
		newDaily.push(normalisedDay);
	});
	return newDaily;
}


module.exports.fetchWeather = fetchWeather;
