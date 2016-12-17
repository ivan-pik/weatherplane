var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

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



var User = mongoose.model('User', UserSchema);
module.exports = User;
