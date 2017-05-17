'use strict';

var mongoose = require('mongoose');
var User = require('../../users/models/user.js');

var PlaceSchema = new mongoose.Schema({
  _userID : {
    type: String,
    ref: 'UserSchema'
  },
  placeName: {
    type: String,
    required: true,
    trim: true
  },
	placeSlug: {
		type: String,
		required: true,
		trim: true
	},
	placeLat: {
    type: Number,
    required: true,
    trim: true
  },
	placeLng: {
    type: Number,
    required: true,
    trim: true
  },
	placeSettings: {
    type: Object,
    required: true,
  },
},
{
  collection: 'places',
  versionKey: false
});


PlaceSchema.statics.findByUserAndSlug = function(placeQuery, callback) {
  Place.findOne({
		placeSlug: placeQuery.placeSlug,
		userID: placeQuery.userID
	})
    .exec(function (error, place) {
      if(error) {
        return callback(error);
      } else if (!place) {
        var err = new Error('Place not found');
        err.status = '401';
        return callback(err);
      } else {
        return callback(null, place);
      }
    })
}


var Place = mongoose.model('Place', PlaceSchema);
module.exports = Place;
