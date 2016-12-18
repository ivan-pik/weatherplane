'use strict';

// ---------------------------------------------
// Global App Settings

var nodemailer = require('nodemailer');
var envSettings = require('./envSettings.json');

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
    + req.session.userSlug + '\" was created.';
  // @todo better copy
  var html = '<p>This is to confirm that your user account <strong>'
    + req.session.userSlug + '</strong> was created.</p>';

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
        console.log(error);
    } else {
        console.log('Message sent: ' + info.response);
    };
  });
}


module.exports.sendRegistrationConfirmation = sendRegistrationConfirmation;
