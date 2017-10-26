'use strict';

// ---------------------------------------------
// Global App Settings

var nodemailer = require('nodemailer');
var envSettings = require('../envSettings.json');

// ---------------------------------------------
// Mail settings
var transporter = nodemailer.createTransport({
  service: envSettings.email.service,
  auth: {
      user: envSettings.email.account,
      pass: envSettings.email.password
  }
});


function sendRegistrationConfirmation (req) {
  // @todo better copy
  var text = 'This is to confirm that your user account \"'
    + req.body.userID + '\" was created.';
  // @todo better copy
  var html = '<p>This is to confirm that your user account <strong>'
    + req.body.userID + '</strong> was created.</p>';

  // @todo ask for email confirmation

  var emailAddress = (envSettings.env == 'DEVEL') ? envSettings.devel.testEmail : req.body.email;

  var mailOptions = {
    from: envSettings.email.account,
    to: emailAddress,
    subject: 'Welcome to WeatherPlane.com!',
    text: text,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      // @todo Write this in some log file so I can monitor it?
    }
  });
}

function sendLostPassword (content, req, callback) {
  // @todo add link with token allowing password change
  // @todo better copy


  var text = 'Required password reset for ' + content._userID + 'You can set a new password within 1 hour at ' + req.app.locals.siteURL + 'reset-password?token=' + content.token + '&userID=' + content._userID;
  // @todo better copy, probably show full link as well in case mail client fails to make a HTML link
  var html = '<p>Required password reset for user <strong>' + content._userID + '</strong></p><p>You can set a new password within 1 hour <a href=\"' + req.app.locals.siteURL + 'reset-password?token=' + content.token + '&userID=' + content._userID + '\">here</a></p>';

  var emailAddress = (envSettings.env == 'DEVEL') ? envSettings.devel.testEmail : content.email;

  var mailOptions = {
    from: envSettings.email.account,
    to: emailAddress,
    subject: 'WeatherPlane.com password reset for user ' + content._userID,
    text: text,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      // @todo Write this in some log file so I can monitor it?
        callback(error);
    } else {
        callback(null, info.response);
    };
  });
}

function sendLostUserName (user, req) {
  // @todo add link with token allowing password change
  // @todo better copy
  var text = 'Your user name is \"' + user._userID + '\". You can login at ' + req.app.locals.siteURL + 'login?username=' + user._userID;
  // @todo better copy
  var html = '<p>Your user name is \"' + user._userID + '\"</p><p>You can login at <a href=\"' + req.app.locals.siteURL + 'login?username=' + user._userID + '\">here</a></p>';

  var emailAddress = (envSettings.env == 'DEVEL') ? envSettings.devel.testEmail : user.email;

  var mailOptions = {
    from: envSettings.email.account,
    to: emailAddress,
    subject: 'WeatherPlane.com - your user name is \"' + user._userID + '\"',
    text: text,
    html: html
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      // @todo Write this in some log file so I can monitor it?
        // @todo handle error
    }
  });
}


module.exports.sendRegistrationConfirmation = sendRegistrationConfirmation;
module.exports.sendLostPassword = sendLostPassword;
module.exports.sendLostUserName = sendLostUserName;
