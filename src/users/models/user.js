'use strict';

var Place = require('../../places/models/place.js');

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
	_userID: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	updated: { type: Date, default: Date.now },
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	password: {
		type: String,
		required: true
	},
	locations: {
		type: Array,
		required: false
	},
	dateFormat: {
		type: String,
		required: false
	},
	windUnit: {
		type: String,
		required: false
	},
	timeFormat: {
		type: String,
		required: false
	},
	temperatureUnit: {
		type: String,
		required: false
	},
},
{
	collection: 'users',
	versionKey: false
});



// Get public settings

UserSchema.statics.getPublicSettings = function(userID, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);

		var publicSettings =  {
			dateFormat: user.dateFormat,
			temperatureUnit: user.temperatureUnit,
			timeFormat: user.timeFormat,
			windUnit: user.windUnit
		}

		return callback(null, publicSettings);

	
	});
};




// Authenticate user

UserSchema.statics.authenticate = function(userID, password, callback) {

	User.findOne({_userID: userID})
		.exec(function (error, user) {
			if(error) {

				return callback(error);
			} else if (!user) {

				var err = new Error('User not found');
				err.status = '401';
				return callback(err);
			}

			bcrypt.compare(password, user.password, function (error, result) {
				if (result == true) {

					return callback(null, user);
				} else {

					return callback();
				}
			})
		})
}

UserSchema.statics.findByUserID = function(userID, callback) {
	User.findOne({_userID: userID})
		.exec(function (error, user) {
			if(error) {
				return callback(error);
			} else if (!user) {
				var err = new Error('User not found');
				err.status = '401';
				return callback(err);
			} else {
				return callback(null, user);
			}
		})
}

UserSchema.statics.findByEmail = function(email, callback) {
	User.findOne({email: email})
		.exec(function (error, user) {
			if(error) {
				return callback(error);
			} else if (!user) {
				var err = new Error('User with email ' + email + ' wasn\'t found.');
				// @todo: What status to send?
				err.status = '401';
				return callback(err);
			} else {
				return callback(null, user);
			}
		})
};




// Hash password before saving them to DB
UserSchema.pre('save', function(next) {

	if (this.isModified('password')) {

			var user = this;
			bcrypt.hash(user.password, 10, function (err, hash) {
				if (err) {
					return next(err);
				}
				user.password = hash;
				next();
			})
	} else {
		next();
	}

})


// Update password
// Never call this without authorising first!
UserSchema.statics.updatePassword = function(userID, newPassword, callback) {
		User.findOne({_userID: userID}, function (err, user) {
			if (err) return callback(err);

			user.password = newPassword;
			user.save(function (err, updatedUser) {
				if (err) return callback(err);
				return callback(null, updatedUser);
			});
		});
};


// Add Location Reference to "locations" collection

UserSchema.statics.addLocationRef = function(userID, newLocationRef, callback) {
		User.findOne({_userID: userID}, function (err, user) {
			if (err) return callback(err);

			user.locations.push(newLocationRef);
			user.save(function (err, updatedUser) {
				if (err) return callback(err);
				return callback(null, updatedUser);
			});
		});
};


// Update password
UserSchema.statics.updateEmail = function(userID, newEmail, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);
		user.email = newEmail;
		user.save(function (err, user) {
			if (err) return handleError(err);
			return callback(null, user);
		});
	});
};

// Update date format
UserSchema.statics.updateDateFormat = function(userID, newDateFormat, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);
		user.dateFormat = newDateFormat;
		user.save(function (err, user) {
			if (err) return handleError(err);
			return callback(null, user);
		});
	});
};

// Update wind unit
UserSchema.statics.updateWindUnit = function(userID, newWindUnit, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);
		user.windUnit = newWindUnit;
		user.save(function (err, user) {
			if (err) return handleError(err);
			return callback(null, user);
		});
	});
};

// Update time format
UserSchema.statics.updateTimeFormat = function(userID, newTimeFormat, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);
		user.timeFormat = newTimeFormat;
		user.save(function (err, user) {
			if (err) return handleError(err);
			return callback(null, user);
		});
	});
};


// Update temperature unit
UserSchema.statics.updateTemperatureUnit = function(userID, newTemperatureUnit, callback) {
	User.findOne({_userID: userID}, function (err, user) {
		if (err) return callback(err);
		user.temperatureUnit = newTemperatureUnit;
		user.save(function (err, user) {
			if (err) return handleError(err);
			return callback(null, user);
		});
	});
};


var User = mongoose.model('User', UserSchema);

module.exports = User;
