'use strict';

// ---------------------------------------------
// Global App Settings
var settings = require('./settings.json');

// ---------------------------------------------
// Modules
var express = require('express');
var app = express();

// ---------------------------------------------
// Utilities
var database = require('./database');

// ---------------------------------------------
// Controllers
var user = require('./user')
var home = require('./home')

// ---------------------------------------------
// Have fun with PUG templates
app.set('view engine', 'pug');
app.set('views', __dirname  + '/views');

// ---------------------------------------------
// Serve static files
app.use('/static', express.static(__dirname + '/public'));

// ---------------------------------------------
// Routing routes
app.use('/user', user)
app.use('/', home)

// ---------------------------------------------
// Connect to the DB and if OK listen...

database.init(function (error) {
  if (error) {
    throw error;
  }
  app.listen(80, function () {
    console.log('Listening on port 80!');
  });
})
