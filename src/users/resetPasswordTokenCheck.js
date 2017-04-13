var Token = require('./models/token.js');


// ---------------------------------------------
// newPasswordTokenCheck
/*
 This checks if user has a valid token to be
 able to change a password on "login/new-password".
 This can be used to prevent displaying this page
 to missing/invalid tokens and for authenticating the POST
 request for the actual change.
 */
function newPasswordTokenCheck (token, userID, callback) {

    var credentials = {
        token: token,
        userID: userID
    }



    function getTimeStamp(str) {
        return str.split('-')[1];
    }

    // First just check the timestamp of the request
    // so it can be refused immediately
    var timestamp = getTimeStamp(credentials.token),
        currentTimeStamp = Math.floor(Date.now() / 1000),
        expiryLength = {
            "value": 60, //minutes @todo, read from settings.json
            "toSeconds": function () {
                return (this.value * 60)
            }
        },
        timeDifference = currentTimeStamp - timestamp;


    // If too old
    if (timeDifference > expiryLength.toSeconds()) {
        let error = {
            code: 'token-expired'
        }

        return callback(error, null);

        // Still fresh, let's check DB for it
    } else {



        Token.authenticate(credentials.userID, credentials.token, function(error, token) {

            if (error || !token) {
                let error = {
                    code: 'token-is-invalid'
                }
                return callback(error, null)
            } else {
                return callback(null, true)
            }
        });

    }


}



module.exports.newPasswordTokenCheck = newPasswordTokenCheck;