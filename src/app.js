'use strict';

// ---------------------------------------------
// IMPORT SETTINGS
// environment settings
var envSettings = require('./envSettings.json');
// app settings
var settings = require('./settings.json');

// ---------------------------------------------
// MODULES
var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer(); // for parsing multipart/form-data

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// ---------------------------------------------
// GLOBALS
var db;

// ---------------------------------------------
// DB CONNECT

MongoClient.connect(envSettings.db.uri, (err, database) => {
  db = database;
  listen();
})

// ---------------------------------------------
// STATIC FILES
app.use('/static', express.static(__dirname + '/public'));

// ---------------------------------------------
// VIEW ENGINE
app.set('view engine', 'pug');
app.set('views', __dirname  + '/views');

// ---------------------------------------------
// ROUTES


app.get('/', function (req, res) {
  var title = settings.frontend.appName + ' | ' + settings.frontend.appNote;
  res.locals.title = title;

  db.collection('greetings').find().limit(1).sort({$natural:-1}).toArray((err, result) => {
    if (err) {
      return console.log(err);
    }

    // Pick a random greeting
    var pickGreeting = (function (result) {
      var count = result.length;
      var key = Math.floor(Math.random() * count);
      res.locals.greeting = result[key].content;
    })(result);


    res.render('home');
  });
});

app.get('/thanks', function (req, res) {
  var title = settings.frontend.appName + ' | ' + settings.frontend.appNote;
  res.locals.title = title;
  res.render('thanks');
});


app.post('/add-greeting', (req, res) => {
  console.log("something is coming in!");
  console.log(req.body);

  var newGreeting = req.body.greeting;
  var password = req.body.password;

  if (password == envSettings.dummyUserPassword) {
    db.collection('greetings').insert( { content: newGreeting } );
    res.redirect('/thanks');
  } else {
    res.sendStatus(403);
  }


})

// ---------------------------------------------
// LISTEN

var listen = function() {
  app.listen(80, function () {
    console.log('Example app listening on port 80!');
  });
}
