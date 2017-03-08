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
app.locals.title = settings.frontend.appName;
app.locals.siteURL = (envSettings.env == 'DEVEL') ? envSettings.devel.siteURL : envSettings.production.siteURL;


// ---------------------------------------------
// Use sessions
app.use(session({
  secret: 'Hope it is not raining tomorrow',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: database.connection
  })
}))

// ---------------------------------------------
// Variables available for the whole app

app.use(function(req, res, next) {
  res.locals.currentUserSlug = req.session.userSlug;
  res.locals.currentUser = req.session.userId;
  next();
})

app.set('superSecret', envSettings.secret); // secret variable





// ---------------------------------------------
// Parse incoming requests
app.use(bodyParser.json());




// ---------------------------------------------
// Routing routes
app.use('/', require('./home'))

app.use('/users', require('./users/user'))
app.use('/users', require('./users/register'))
app.use('/settings', require('./users/settings'))

app.use('/login', require('./users/login'))
app.use('/logout', require('./users/logout'))

app.use('/authenticate', require('./users/authenticate'))




// ---------------------------------------------
// Connect to the DB and if OK listen...

database.connect();

app.listen(3000, function () {
  console.log('Listening on port 3000!');
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
        code: "E00",
        title : err.message
      }
    ]
  });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
});

module.exports = app;
