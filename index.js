#!/usr/bin/env node

var express = require('express');
var bodyParser = require('body-parser');

var mjpeg = require('./mjpeg');

var app = express();

app.use(bodyParser.json());
app.use('/', express.static(__dirname + '/public'));

app.get('/stream', mjpeg.stream);
app.post('/register', mjpeg.register);

app.listen(8080, '0.0.0.0', () => console.log('listening on port 8080'));
