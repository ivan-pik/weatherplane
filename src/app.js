'use strict';

var express = require('express');
var app = express();

app.set('view engine', 'twig');

app.get('/', function (req, res) {
  res.render('layout', {"greeting": "Hello!"});
})

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
})
