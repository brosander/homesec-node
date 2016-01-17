"use-strict";

var assert = require('assert')
var MjpegParser = require('../lib/mjpegParser.js');

describe('MjpegParser', function() {
  describe('#put(buffer)', function() {
    it('should throw exception if lastIndex >= first buffer.length', function() {
      assert.throws(function() {
        var mjpegParser = new MjpegParser(2);
        mjpegParser.put(new Buffer([0x22]));
      }, /First buffer must be larger than lastIndex./);
    });
  });

  describe('#getBytes()', function () {
    it('should return correct bytes when start and end are on border', function () {
      var mjpegParser = new MjpegParser(2);
      assert(!mjpegParser.put(new Buffer([0xff, 0xd9, 0x22, 0xff])));
      assert(!mjpegParser.put(new Buffer([0xd8, 0x23, 0xff])));
      assert(mjpegParser.put(new Buffer([0xd9, 0x24])));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x23, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
    });

    it('should return correct bytes with single buffer', function () {
      var mjpegParser = new MjpegParser(2);
      assert(mjpegParser.put(new Buffer([0xff, 0xd9, 0x22, 0xff, 0xd8, 0x23, 0xff, 0xd9, 0x24])));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x23, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
    });

    it('should return correct bytes with preceding noise', function () {
      var mjpegParser = new MjpegParser(2);
      assert(!mjpegParser.put(new Buffer([0xff, 0xff, 0xff, 0xff])));
      assert(mjpegParser.put(new Buffer([0xff, 0xd9, 0x22, 0xff, 0xd8, 0x23, 0xff, 0xd9, 0x24])));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x23, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
    });

    it('should return correct bytes with ff in buffer', function () {
      var mjpegParser = new MjpegParser(2);
      assert(!mjpegParser.put(new Buffer([0xff, 0xd9, 0x22, 0xff])));
      assert(!mjpegParser.put(new Buffer([0xff, 0xd8, 0x23, 0xff])));
      assert(mjpegParser.put(new Buffer([0xff, 0xd9, 0x24])));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x23, 0xff, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
    });

    it('should multiple jpegs same buffer', function () {
      var mjpegParser = new MjpegParser(0);
      var buffer = new Buffer([0x10, 0xff, 0xd9, 0x22, 0xff, 0xd8, 0x23, 0xff, 0xd9, 0x24, 0xff, 0xd8, 0x22, 0xff, 0xd9, 0x23]);
      assert(mjpegParser.put(buffer));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x23, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
      var endIndexExclusive = mjpegParser.getEndIndexExclusive();
      assert.equal(endIndexExclusive, 9);
      mjpegParser = new MjpegParser(endIndexExclusive);
      assert(mjpegParser.put(buffer));
      assert.equal(0, new Buffer([0xff, 0xd8, 0x22, 0xff, 0xd9]).compare(mjpegParser.getBuffer()));
      assert.equal(mjpegParser.getEndIndexExclusive(), buffer.length - 1);
    });
  });
});
