'use strict';

var settings = require('./settings.json')
var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'pug');

app.get('/', function (req, res) {
  let title = settings.frontend.appName + ' | ' + settings.frontend.appNote;
  res.render(__dirname + '/views/layout', {"greeting": "Hello!", "title": title});
})

app.listen(80, function () {
  console.log('Example app listening on port 80!');
})
