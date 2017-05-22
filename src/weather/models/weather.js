'use strict';

var mongoose = require('mongoose');

var WeatherSchema = new mongoose.Schema({
  "_placeID"
{
  collection: 'weather',
  versionKey: false
});




var Weather = mongoose.model('Weather', WeatherSchema);

module.exports = Weather;
