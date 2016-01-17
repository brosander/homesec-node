var request = require('request');
var Rx = require('rx');
var RxNode = require('rx-node');

var DataProcessor = require('./dataProcessor');
var MjpegParser = require('./mjpegParser');

function VideoStream(name, url) {
  this.name = name;
  this.url = url;
};

VideoStream.prototype.start = function() {
  var replaySubject = new Rx.ReplaySubject(null, 15000, null);
  var mjpegParser = new MjpegParser(0);
  var dataProcessor = new DataProcessor(replaySubject, mjpegParser);

  this.subscription = RxNode.fromStream(request(this.url)).subscribe((data) => dataProcessor.process(data));
  this.subject = replaySubject;
  return this;
};

module.exports = VideoStream;
