'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  _userID: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  }
},
{
  collection: 'users',
  versionKey: false
});

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
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
})


// Update password
// Never call this without authorising first!
UserSchema.statics.updatePassword = function(authorised, userID, newPassword, callback) {
  if (authorised) {
    // @todo Update password field with newPassword
    // @continue
    // Make sure that "UserSchema.pre   will be called to encrypt the password before saving
    // Handle errors
      // user not find
      // fallback error
  } else {
    var err = new Error("Not authorised to change user settings");
    return callback(err);
  }
};





var User = mongoose.model('User', UserSchema);
module.exports = User;
