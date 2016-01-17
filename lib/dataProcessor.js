"use-strict";

var DataProcessor = function(subject, parser) {
  this.timestamp = -1;
  this.subject = subject;
  parser.reset(0);
  this.parser = parser;
}

DataProcessor.prototype.process = function(data) {
  if (this.timestamp == -1) {
    this.timestamp = Date.now();
  }
  while(this.parser.put(data)) {
    this.subject.onNext({bytes: this.parser.getBuffer(), timestamp: this.timestamp});
    var endIndexExclusive = this.parser.getEndIndexExclusive();
    if (endIndexExclusive < data.length) {
      this.parser.reset(endIndexExclusive); 
      this.timestamp = Date.now();
    } else {
      this.parser.reset(0);
      this.timestamp = -1;
      break;
    }
  }
}

module.exports = DataProcessor
