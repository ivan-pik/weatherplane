// ---------------------------------------------
// Global App Settings

var envSettings = require('./envSettings.json');

// ---------------------------------------------
// Modules
var MongoClient = require('mongodb').MongoClient;


// ---------------------------------------------
// Export: init

module.exports.init = function (callback) {
  MongoClient.connect(envSettings.db.uri, function (err, database) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    }

    // Export: database object
    module.exports.database = database;

    // Get users from DB
    database.collection('users').find().sort({$natural:-1}).toArray((err, result) => {
      if (err) {
        return console.log(err);
      }

      // Export: users
      module.exports.users =  result;
    });

    // Get locations from DB
    database.collection('locations').find().sort({$natural:-1}).toArray((err, result) => {
      if (err) {
        return console.log(err);
      }

      // Export: locations
      module.exports.locations =  result;
    });

    // Export: userExists
    module.exports.userExists = function (userName, exists, doesntExist) {

      if (userName === undefined) {
        // @todo: make propper error object
        console.error("userExists function - argument is undefined");
        return false;
      }

      database.collection('users').find({'_userID' : userName}, function(err, result){
        if (err) {
          return console.log(err);
        }

        result.toArray(function (err,items) {
          console.log(items);
          if(items.length) {
            console.log("gonna coll yes");
            exists();
          } else {
            console.log("gonna coll false");
            doesntExist();
          }
        });
      });
    }
    callback(err);
  });
}
