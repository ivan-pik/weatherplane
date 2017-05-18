'use strict';

// ---------------------------------------------
// Modules

var express = require('express');
var router = express.Router();
var Place = require('./models/place.js');
var User = require('../users/models/user.js');
var userMid = require('../users/middleware/users.js');
var checkToken = require('../users/checkToken.js');

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

      var PlaceData = {
				placeName : req.body.placeName,
				placeSlug : req.body.placeSlug,
				_userID : req.body._userID,
				placeLat : req.body.placeLat,
				placeLng : req.body.placeLng,
				placeSettings : req.body.placeSettings
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

					User.addLocationRef(req.body._userID, place._id, function (error, user) {
						if (error) {
							console.error(error);
						} else if (user) {
							res.status(201).location(req.app.locals.siteURL + 'places/' + req.body.userID + '/' + req.body.placeSlug).json( {
		            "success" : true,
								"message" : "The place was saved"
		          } );
						}
					});
        }
      })
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

					if (req.authenticated && req.authorised) {
						returnedPlaces = places;
					} else {
						returnedPlaces = places.filter(function(item)
						{
							return item.placeSettings.public;
						});
					}

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
					console.log(error);
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
// Module exports

module.exports = router
