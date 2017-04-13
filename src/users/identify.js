'use strict';

// ---------------------------------------------
// Modules
var express = require('express');
var router = express.Router();
var mid = require('./middleware/users');
var jwt = require('jsonwebtoken');
var envSettings = require('../envSettings.json');

// ---------------------------------------------
// Identify the user based on the token "/identify"

//@todo this mostly copy code from middleware/users, refactor it


router.post('/', function (req, res, next) {
    console.log("identify");
    console.log(req.body);
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, envSettings.secret, function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {


                res.json(
                    {
                        success: true,
                        message: 'I think I know who you are!',
                        data: {
                            username: decoded._doc._userID
                        }
                    }
                );
            }
        });
    } else {
        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.',
            errors: [
                {
                    title : "No token provided",
                    code : "no-token-provided"
                }
            ]
        });
    }
});


// ---------------------------------------------
// Module exports

module.exports = router;