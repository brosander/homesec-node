"use strict";

var FF = new Buffer([0xff])[0];
var D8 = new Buffer([0xd8])[0];
var D9 = new Buffer([0xd9])[0];

function MjpegParser(lastIndex) {
  this.reset(lastIndex);
}

MjpegParser.prototype.reset = function(lastIndex) {
  this.byteArrays = [];
  this.lastIndex = lastIndex;
  this.startIndex = -1;
  this.endIndex = -1;
  this.lastByteOfPrevIsFF = false;
}

MjpegParser.prototype.put = function(buffer) {
  if (buffer.length == 0) {
    return;
  }

  var searchStartIndex = 0;
  var lookBack = false;
  
  if (this.byteArrays.length == 0) {
    if (buffer.length <= this.lastIndex) {
      throw new Error('First buffer must be larger than lastIndex.');
    }
    searchStartIndex = this.lastIndex;
  } else {
    lookBack = this.lastByteOfPrevIsFF;
  }

  if (lookBack) {
     if (this.startIndex == -1 && buffer[0] == D8) {
       var prev = this.byteArrays[this.byteArrays.length - 1];
       this.startIndex = prev.length - 1;
       this.byteArrays = [prev];
     } else if (buffer[0] == D9) {
        this.endIndex = 1;
        this.byteArrays.push(buffer)
        return true;
     }
  }

  this.byteArrays.push(buffer);
  for (var i = searchStartIndex; i < buffer.length; i++) {
    if (buffer[i] == FF) {
      if (i == buffer.length - 1) {
        this.lastByteOfPrevIsFF = true;
      } else if (this.startIndex == -1) {
        if (buffer[i + 1] == D8) {
          this.startIndex = i;
          this.byteArrays = [buffer];
        }
      } else if (this.endIndex == -1) {
        if (buffer[i + 1] == D9) {
          this.endIndex = i + 2;
          return true;
        }
      }
    }
  }

  return false;
}

MjpegParser.prototype.getBuffer = function() {
  var first = this.byteArrays[0];

  var size = this.endIndex - this.startIndex;
  if (this.byteArrays.length > 1) {
    size = first.length - this.startIndex;
    for (var i = 1; i < this.byteArrays.length -1; i++) {
      size += this.byteArrays[i].length;
    }
    size += this.endIndex;
  }

  var result = new Buffer(size);
  if (this.byteArrays.length == 1) {
    first.copy(result, 0, this.startIndex, this.startIndex + size);
  } else {
    first.copy(result, 0, this.startIndex)
    var position = first.length - this.startIndex;
    for (var i = 1; i < this.byteArrays.length - 1; i++) {
      var cur = this.byteArrays[i];
      cur.copy(result, position);
      position += cur.length;
    }
    this.byteArrays[this.byteArrays.length - 1].copy(result, position, 0, this.endIndex)
  }
  return result;
}

MjpegParser.prototype.getEndIndexExclusive = function() {
  return this.endIndex;
}

module.exports = MjpegParser;
