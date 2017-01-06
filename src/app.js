'use strict';


// ---------------------------------------------
// Modules
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var envSettings = require('./envSettings.json');

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



// ---------------------------------------------
// Parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ---------------------------------------------
// Have fun with PUG templates
app.set('view engine', 'pug');
app.set('views', __dirname  + '/views');

// ---------------------------------------------
// Serve static files
app.use('/static', express.static(__dirname + '/public'));



// ---------------------------------------------
// Routing routes
app.use('/', require('./home'))

app.use('/user', require('./users/user'))
app.use('/settings', require('./users/settings'))
app.use('/register', require('./users/register'))
app.use('/login', require('./users/login'))
app.use('/logout', require('./users/logout'))




// ---------------------------------------------
// Connect to the DB and if OK listen...

database.connect();

app.listen(80, function () {
  console.log('Listening on port 80!');
  console.log('\u0007');
});


// ---------------------------------------------
// Error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(req, res){
  res.send('what???', 404);
});
