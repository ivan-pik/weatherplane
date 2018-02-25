'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var Place = require('./models/place.js');
var User = require('../users/models/user.js');
var Weather = require('../weather/models/weather.js');
var userMid = require('../users/middleware/users.js');
var checkToken = require('../users/checkToken.js');


// ---------------------------------------------
// Get the highest order index
// It should normally be the number of items, but this is just in case numbers are skipped
function getHighestListOrderIndex(userId) {
	return new Promise(function (resolve, reject) {
		Place.getAllUserPlaces(userId, function (error, places) {
			let highestOrder = 0;
			if (error) {
				console.error(error);
			} else if (places) {
				if (places.length > 0) {
					places.forEach(function(place) {
						if (!place.listOrder) {
							highestOrder = 0;
						} else {
							highestOrder = Math.max(place.listOrder, highestOrder);
						}
					});
				} else {
					highestOrder = -1;
				}
				resolve(highestOrder);
			} 
		});
	});
}


// ---------------------------------------------
// Save Place

router.post('/', userMid.apiAuth , function (req, res, next) {

	// -----------------------------
	// All data provided
	if (req.body.placeName &&
			req.body.placeSlug &&
			req.body._userID &&
			req.body.placeLat &&
			req.body.placeLng &&
			req.body.placeSettings
	) {

		getHighestListOrderIndex(req.body._userID)
		.then((order) => {
			var PlaceData = {
				placeName : req.body.placeName,
				placeSlug : req.body.placeSlug,
				_userID : req.body._userID,
				placeLat : req.body.placeLat,
				placeLng : req.body.placeLng,
				placeSettings : req.body.placeSettings,
				listOrder : order + 1
			};



			Place.create(PlaceData, function (error, place) {
				if (error) {
					// @todo: errors
					let errors = [];
					errors.push({
						code: "username-or-email-already-registered",
						title: "User with this username or email already exists"
					});

					// On duplicate entry (user name or e-mail)
					if (error.code == 11000) {
						// Duplicated _userID
						if (error.errmsg.includes("_userID_1")) {
							errors.push({
								code: "username-exists",
								title: "User with this username already exists"
							});
						}
						// Duplicated email
						// @this doesn't seem to work
						else if (error.errmsg.includes("email_1")) {
							errors.push({
								code: "user-email-exists",
								title: "User with this email already exists"
							});
						}

						return res.status(400).json( { errors: errors } );

					} else {
							// Any other error
							return next(error);
					}
				} else {
					// @todo: Do I need this?
					User.addLocationRef(req.body._userID, place._id, function (error, user) {
						if (error) {
							console.error(error);
						} else if (user) {

							// Create weather record for this place

							let WeatherData = {
								_placeId: place._id,
								provider: 'darksky',
								location: {
									latitude:  place.placeLat,
									longitude: place.placeLng
								}
							}

							Weather.create(WeatherData, function (error, weather) {
								if (error) {
									// @todo: handle error
									return res.status(400).json( {
										sucess: false
									} );
								} else {
									// weather record was created

									// Add weather ref
									Place.addWeatherRef(place._id ,weather._id, function (error, place) {
										if (error) {
											console.error(error);
										} else if (place) {
											// Weather ref created
											res.status(201).location(req.app.locals.siteURL + 'places/' + req.body.userID + '/' + req.body.placeSlug).json( {
												"success" : true,
												"message" : "The place was saved"
											} );
										}
									});
								}
							});
						}
					});
				}
			});
		});
		
	// -----------------------------
	// Some data is missing
	} else {

		let errors = [];

		errors.push({
			code: "missing-data",
			title: "Not all required data were provided",
			description: "Required fields are: \'placeSlug\', \'_userID\', \'placeLat\', \'placeLng\', \'placeSettings\'."
		});

		res.status(400).json( { errors: errors } );
	}
})



// ---------------------------------------------
// Load List of places of some username


router.get('/:userID/', userMid.apiAuthV2, function (req, res, next) {
	User.findByUserID(req.params.userID, function (error, user) {
		if (error) {
			// @todo: error
		} else {
			var places = user.locations;

			Place.findByOIDs(places, function(error,places) {
				if (error) {
					// @todo: error
				} else {
					var returnedPlaces = [];

					if ( req.token && req.token._doc._userID == req.params.userID ) {
						req.authorised = true;
					}

					// Return all public and private places
					if (req.authenticated && req.authorised) {
						returnedPlaces = places;
					}
					// Return public places
					else {
						returnedPlaces = places.filter(function(item) {
							return item.placeSettings.public;
						});
					}

					// Sort places by 'listOrder'
					returnedPlaces.sort(function(placeA, placeB) {
						return (placeA.listOrder > placeB.listOrder)
					});


					return res.json({
						success : true,
						data : {
							places: returnedPlaces
						}
					});
				}
			})
		}
	});
});


// ---------------------------------------------
// Load Place



router.get('/:userID/:placeSlug/', function (req, res, next) {


		Place.findByUserAndSlug(
			{
				placeSlug: req.params.placeSlug,
				_userID: req.params.userID
			}
			, function (error, place) {
				if (error) {
					return res.status(404).json({

								success : false,
								errors: [
									{
										title : "This resouce does not exist",
										code : "resource-does-not-exist"
									}
								]

					});
				} else {


					if(!place.placeSettings.public) {

						checkToken.checkToken(req, function (err, token) {
							if(err) {
								console.error(err);
								return res.status(400).json({
									success : false,
									errors: [
										{
											title : "Authentication is required to get this resource",
											code : "authentication-required"
										}
									]
								});

							} else if (token) {
								if (token._doc._userID == req.params.userID) {
									return res.json({
										success : true,
										data : {
											place
										}
									});
								} else {
									//@todo: nice error
									return res.status(400).json({
										success : false,
										message: "Not allowed mate",
										errors: [
											{
												title : "Authorised but accessing other user resources",
												code : "authorised-no-rights"
											}
										]
									});
								}
							}
						});
					} else {
						return res.json({
							success : true,
							data : {
								place
							}
						});
					}

				}
			});
})

// ---------------------------------------------
// Update Place Settings

router.post('/:userID/:placeSlug/update-limits', function (req, res, next) {
	Place.findByUserAndSlug(
		{
			placeSlug: req.params.placeSlug,
			_userID: req.params.userID
		},
		function (error, place) {
			if (error) {
				return res.status(404).json({
					success : false,
					errors: [
						{
							title : "This resouce does not exist",
							code : "resource-does-not-exist"
						}
					]
				});
			} else {
				// @todo: why am I not using apiauth middleware here?? I forgot, check it, clean it
				checkToken.checkToken(req, function (err, token) {
					if(err) {
						console.error(err);
						return res.status(400).json({
							success : false,
							errors: [
								{
									title : "Authentication is required to get this resource",
									code : "authentication-required"
								}
							]
						});
					} else if (token) {
						if (token._doc._userID == req.params.userID) {

							Place.updateWeatherLimitsSettings(
								place._id, 
								{
									maxWindBearingToRWY: req.body.maxWindBearingToRWY, 
									maxPrecipProbability: req.body.maxPrecipProbability, 
									maxTemperature: req.body.maxTemperature, 
									minTemperature: req.body.minTemperature, 
									maxCrossWindSpeed: req.body.maxCrossWindSpeed, 
									maxWindSpeed: req.body.maxWindSpeed 
									
								},
								function (error, place) {
									if (error) {

									} else {
										return res.json({
											success : true,
											data : {
												place
											}
										});
									}
								}
							);

						
						} else {
							//@todo: nice error
							return res.status(400).json({
								success : false,
								message: "Not allowed mate",
								errors: [
									{
										title : "Authorised but accessing other user resources",
										code : "authorised-no-rights"
									}
								]
							});
						}
					}
				});

			}
		});
})




// ---------------------------------------------
// Settings "/places/reorder-places"

router.post('/reorder-places', userMid.apiAuth, function (req, res) {

	if (req.body && req.body.length > 1) {
		// @todo: pass active user ID
		Place.reorderPlaces('ivanpik' ,req.body, function (error, places) {
			if (error) {
				// @todo handle error
			} else {
				return res.json({
					success : true
				});
			}
		});
	} else {
		// @todo: incomplete data error
	}
});



// ---------------------------------------------
// Settings "/places/update-name"

router.post('/update-name', userMid.apiAuthV2, function (req, res) {

	if (req.body && req.body.placeName && req.body.userID) {

		var query = {
			placeName: req.body.placeName,
			placeOID: req.body.placeOID,
			userID: req.body.userID
		}

		// Check if it exists already
		Place.findByUserAndName(query, function (error, places) {

			if (error) {
				if (error.status == '404') {

					// Place with this name doesn't exists, we can update the name

					Place.updateName(req.body.placeOID,req.body.placeName, req.token._doc._userID, function (error, place) {
						if (place) {
							return res.json({
								success : true,
								data : {
									place: place
								}
							});
						} else {
							if (error.message == "Not authorised") {
								return res.status(400).json({
									success : false,
									message: "Not authorised",
									errors: [
										{
											title : "Not authorised to edit this place",
											code : "not-authorised-to-edit-place"
										}
									]
								});
							} else {
								// @todo: generic error
							}
						}
					})

				} else {
					// @todo: return error
					
				}

			} else {
				return res.status(400).json({
					success : false,
					message: "Place with this name already exists",
					errors: [
						{
							title : "Place with this name already exists",
							code : "place-name-already-exists"
						}
					]
				});
			}
		});
	} else {
		// @todo: incomplete data error
	}
});




// ---------------------------------------------
// Settings "/places/update-slug"

router.post('/update-slug', userMid.apiAuthV2, function (req, res) {

	if (req.body && req.body.placeSlug && req.body.userID) {

		var query = {
			placeSlug: req.body.placeSlug,
			userID: req.body.userID
		}

		

		// Check if it exists already
		Place.findByUserAndSlug(query, function (error, places) {

			if (error) {
				if (error.status == '404') {

					// Place with this name doesn't exists, we can update the name

					Place.updateSlug(req.body.placeOID,req.body.placeSlug, req.token._doc._userID, function (error, place) {
						if (place) {
							return res.json({
								success : true,
								data : {
									place: place
								}
							});
						} else {
							if (error.message == "Not authorised") {
								return res.status(400).json({
									success : false,
									message: "Not authorised",
									errors: [
										{
											title : "Not authorised to edit this place",
											code : "not-authorised-to-edit-place"
										}
									]
								});
							} else {
								// @todo: generic error
							}
						}
					})

				} else {
					// @todo: return error
					
				}

			} else {
				return res.status(400).json({
					success : false,
					message: "Place with this URL already exists",
					errors: [
						{
							title : "Place with this URL already exists",
							code : "place-url-already-exists"
						}
					]
				});
			}
		});
	} else {
		// @todo: incomplete data error
	}
});




// ---------------------------------------------
// Settings "/places/update-privacy"

router.post('/update-privacy', userMid.apiAuthV2, function (req, res) {
	if (req.body && (typeof req.body.placePrivacy == "boolean" ) && req.body.userID) {

		Place.updatePrivacy(
			req.body.placeOID,
			req.body.placePrivacy,
			req.token._doc._userID,
			function (error, place) {
				if (place) {
					return res.json({
						success : true,
						data : {
							place: place
						}
					});
				} else {
					if (error.message == "Not authorised") {
						return res.status(400).json({
							success : false,
							message: "Not authorised",
							errors: [
								{
									title : "Not authorised to edit this place",
									code : "not-authorised-to-edit-place"
								}
							]
						});
					} else {
						// @todo: generic error
					}
				}
			}
		)
	} else {
		// @todo: incomplete data error
	}
});

// ---------------------------------------------
// Settings "/places/update-coordinates"

router.post('/update-coordinates', userMid.apiAuthV2, function (req, res) {
	if (req.body && req.body.coordinates && req.body.userID) {
		Place.updateCoordinates(
			req.body.placeOID,
			req.body.coordinates,
			req.token._doc._userID,
			function (error, place) {
				if (place) {
					return res.json({
						success : true,
						data : {
							place: place
						}
					});
				} else {
					if (error.message == "Not authorised") {
						return res.status(400).json({
							success : false,
							message: "Not authorised",
							errors: [
								{
									title : "Not authorised to edit this place",
									code : "not-authorised-to-edit-place"
								}
							]
						});
					} else {
						// @todo: generic error
					}
				}
			}
		)
	} else {
		// @todo: incomplete data error
	}
});

// ---------------------------------------------
// Settings "/places/update-bearing"

router.post('/update-bearing', userMid.apiAuthV2, function (req, res) {
	if (req.body && req.body.bearing && req.body.userID) {

		Place.updateBearing(
			req.body.placeOID,
			req.body.bearing,
			req.token._doc._userID,
			function (error, place) {
				if (place) {
					return res.json({
						success : true,
						data : {
							place: place
						}
					});
				} else {
					if (error.message == "Not authorised") {
						return res.status(400).json({
							success : false,
							message: "Not authorised",
							errors: [
								{
									title : "Not authorised to edit this place",
									code : "not-authorised-to-edit-place"
								}
							]
						});
					} else {
						// @todo: generic error
					}
				}
			}
		)
	} else {
		// @todo: incomplete data error
	}
});

// ---------------------------------------------
// Settings "/places/delete"

router.post('/delete', userMid.apiAuth, function (req, res) {
	if (req.body && req.body.placeOID) {

		Place.delete(req.body.placeOID, function (error, place) {
			if (place) {

				// @todo: Delete  weather doc
				// @todo: Delete  delete weather ref from user

				return res.json({
					success : true,
					data : {
						place: place
					}
				});
			} else {
				// @todo: return error, failed to rename
			}
		})

	} else {
		// @todo: incomplete data error
	}
});


// ---------------------------------------------
// Module exports

module.exports = router
