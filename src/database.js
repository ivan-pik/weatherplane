// ---------------------------------------------
// Global App Settings

var envSettings = require('./envSettings.json');
var mongoose = require('mongoose');

// mongodb connection
module.exports.connect = function () {
  mongoose.connect(envSettings.db.uri);
}

var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

module.exports.connection = db;
