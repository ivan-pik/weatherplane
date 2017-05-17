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
  stories : [{ type: mongoose.Schema.Types.ObjectId, ref: 'Place' }]
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


// Update password
// Never call this without authorising first!
UserSchema.statics.updateEmail = function(authorised, userID, newEmail, callback) {
  if (authorised) {

    User.findById(userID, function (err, user) {
      if (err) return callback(err);
      user.email = newEmail;
      user.save(function (err, updatedUser) {
        if (err) return handleError(err);
        return callback(null, updatedUser);
      });
    });

  } else {
    var err = new Error("Not authorised to change user settings");
    return callback(err);
  }
};





var User = mongoose.model('User', UserSchema);

module.exports = User;
