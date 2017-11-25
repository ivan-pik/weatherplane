'use strict';

//@todo Turn this into pure back end API, remove all template rendering etc.

// ---------------------------------------------
// Modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var envSettings = require('./envSettings.json');
var jwt = require('jsonwebtoken');

// ---------------------------------------------
// Utilities
var database = require('./database');


// ---------------------------------------------
// Local App Settings
var settings = require('./settings.json');

// @todo: move this to settings
const port = 4000;

app.locals.title = settings.frontend.appName;

// @todo: fix condition where port is not set
app.locals.siteURL = ( (envSettings.env == 'DEVEL') ? envSettings.devel.siteURL : envSettings.production.siteURL ) + ":" + port + "/";

// ---------------------------------------------
// Add headers
app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
	res.header('Access-Control-Allow-Methods', '*');
	res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
	res.header('Access-Control-Max-Age', '1000');
  next();
});


// ---------------------------------------------
app.set('superSecret', envSettings.secret); // secret variable



// ---------------------------------------------
// Parse incoming requests
app.use(bodyParser.json());


// ---------------------------------------------
// Routing routes
app.use('/', require('./home'))
app.use('/users', require('./users/user'))
app.use('/identify', require('./users/identify'))
app.use('/register', require('./users/register'))
app.use('/settings', require('./users/settings'))
app.use('/places', require('./places/places'))
app.use('/weather', require('./weather/weather'))
app.use('/temporaryWeather', require('./weather/temporaryWeather'))
app.use('/login', require('./users/login'))
app.use('/authenticate', require('./users/authenticate'))


// ---------------------------------------------
// Connect to the DB //@todo and if OK listen...

database.connect();

var listener = app.listen(port, function(){
	console.log('Listening on port ' + listener.address().port);
  console.log('\u0007');
});



// ---------------------------------------------
// Error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors : [
      {
        code: "application-error",
        title : err.message
      }
    ]
  });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.status(404).json(
    {
      errors: [
        {
          code: "nothing-here",
          title: "(404) No resource here"
        }
      ]
    }
  );
});

module.exports = app;
