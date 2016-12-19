'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var TokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  userID: {
    type: String,
    required: true,
  },
  timestamp: {
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
      return next(err);
    }
    tokenDoc.token = hash;
    next();
  })
})

TokenSchema.statics.generateToken = function () {
  return new Promise(function (resolve, reject) {
    var token = 'wefwkf44346546546ewe%fghh54' + '*stamp*' + Math.floor(Date.now() / 1000);
    console.log(token);
    resolve(true);
  });
}



var Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
