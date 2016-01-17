var VideoStream = require('./lib/videoStream');

var videoStreams = {};

var register = function(name, url) {
  if (name in videoStreams) {
    throw new Error(name + ' already registered');
  }
  var stream = new VideoStream(name, url).start();
  videoStreams[stream.name] = stream;
}

exports.register = function(req, res) {
  register(req.body.name, req.body.url);
  res.send('ok');
};

exports.stream = function() {
  var boundary = 'Ba4oTvQMY8ew04N8dcnM';

  var responseBuffer = new Buffer(
    '--' + boundary + '\r\n' +
    'Content-Type: image/jpeg\r\n' +
    'Content-Length: '
  );

  var doubleNewlineBuffer = new Buffer('\r\n\r\n');

  return function(req, res) {
    var startTime = Date.now();
    res.useChunkedEncodingByDefault = false;
    res.writeHead(200, {
      'Connection': 'close',
      'Server': 'IP Webcam Server 0.2',
      'Cache-Control': 'no-store, no-cache, must-revalidate, pre-check=0, post-check=0, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '-1',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'multipart/x-mixed-replace;boundary=' + boundary
    });
    videoStreams[req.query.feed].subject.filter((picture) => picture.timestamp > startTime).subscribe((picture) => {
      res.write(responseBuffer);
      res.write(picture.bytes.length.toString())
      res.write(doubleNewlineBuffer);
      res.write(picture.bytes);
    });
  };
}();
