'use strict';

var mongoose = require('mongoose');
var _ = require('underscore');
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
	},
	listOrder: {
		type: Number,
		required: true
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

// Get all user's places

PlaceSchema.statics.getAllUserPlaces = function(userID, callback) {
	Place.find({
		'_userID': userID
	}).exec(function (error, places) {
		
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


PlaceSchema.statics.updateWeatherLimitsSettings = function(placeOID, newWeatherLimitsSettings, callback) {
	Place.findById(placeOID, (error,place) => {
		if (error) {
			return callback(error);
		} else {

			// @todo: this is bad, I didn't realise you have to replace the whole object, I need to write some nested schema
			newWeatherLimitsSettings.public = place.placeSettings.public;
			newWeatherLimitsSettings.runwayOrientation = place.placeSettings.runwayOrientation;
			place.placeSettings = newWeatherLimitsSettings;

			console.log(place.placeSettings);

			place.save((error, place) => {
				if (error) {
					callback(error);
				}
				callback(null,place);
			});
		}
	});
}



// Reorder Places

PlaceSchema.statics.reorderPlaces = function(userID, newPlaces, callback) {
	
	let placesOIDs = newPlaces.map(function (place) {
		return place._id;
	});

	Place.findByOIDs(placesOIDs, (error, places) => {
		if (places.length > 1) {
			let setNewListOrder = function (id, newPlaces) {
				let newIndex;
				newPlaces.forEach(function(newPlace) {
					if (newPlace._id == id.toString()) {
						return newIndex = newPlace.listOrder;
					}
				});
				return newIndex;
			}		

			places.forEach(function (place) {
				place.listOrder = setNewListOrder(place._id, newPlaces);

				place.save(function (err, updatedPlace) {
					if (err) {
						return callback(err);
					}
				});
			});

			return callback(null, places);

		} else {
			// @todo: error
		}
	})
};







var Place = mongoose.model('Place', PlaceSchema);
module.exports = Place;
