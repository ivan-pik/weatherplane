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
	weather: {
		type: Array,
		required: false
	}
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

PlaceSchema.statics.findByOID = function(placeOID, callback) {
  Place.findById(placeOID)
    .exec(function (error, place) {
      if(error) {
        return callback(error);
      } else {
        return callback(null, place);
      }
    })
}



PlaceSchema.statics.getCoordinates = function(placeOID, callback) {
  Place.findById(placeOID)
    .exec(function (error, place) {
      if(error) {
        return callback(error);
      } else {

				let placeCoordinates = {
					latitude: place.placeLat,
					longitude: place.placeLng
				}
        return callback(null, placeCoordinates);
      }
    })
}






PlaceSchema.statics.findByOIDs = function(placeOIDs, callback) {
  Place.find({
    '_id': { $in: placeOIDs}})
    .exec(function (error, places) {
      if(error) {
        return callback(error);
      } else {
        return callback(null, places);
      }
    })
}


// Add Location Reference to "locations" collection

PlaceSchema.statics.addWeatherRef = function(placeOID, newWeatherID, callback) {
	Place.findById(placeOID)
	.exec(function (error, place) {
		if (error) {
			return callback(error);
		} else {
			place.weather.push(
				{
					provider: 'darksky',
					oid: newWeatherID
				}
			);
			place.save(function (err, updatedPlace) {
				if (err) return callback(err);
				return callback(null, updatedPlace);
			});
		}
	});
}





var Place = mongoose.model('Place', PlaceSchema);
module.exports = Place;
