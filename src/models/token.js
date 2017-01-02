'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');

var TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true,
  }
},
{
  collection: 'tokens',
  versionKey: false
});

// Hash token before saving them to DB
TokenSchema.pre('save', function(next) {
  var tokenDoc = this;
  bcrypt.hash(tokenDoc.token, 10, function (err, hash) {
    if (err) {
      console.log(err);
      // return next(err);
    }
    tokenDoc.token = hash;
    next();
  })
})

TokenSchema.statics.generateToken = function () {
  return new Promise(function (resolve, reject) {
    var token = crypto.randomBytes(64).toString('hex');
    token += '-' + Math.floor(Date.now() / 1000);
    resolve(token);
  });
}

TokenSchema.statics.authenticate = function(userID, token, callback) {

  Token.findOne({userID: userID})
    .exec(function (error, tokenDoc) {
      if(error) {
        return callback(error);
      } else if (!tokenDoc) {
        var err = new Error('Token not found');
        err.status = '401';
        return callback(err);
      }
      bcrypt.compare(token, tokenDoc.token, function (error, result) {
        if (result) {
          return callback(null, tokenDoc);
        } else {
          // @todo Better error message
          var err = new Error('Token is invalid');
          err.status = '401';
          return callback(err);
        }

      })
    })
}



var Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
