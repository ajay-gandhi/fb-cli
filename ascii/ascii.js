'use strict';
var Promise = require('es6-promise').Promise,
    sizeOf = require('image-size'),
    exec = require('child_process').exec,
    fileUtils = require('../file_utils'),
    ImageToAscii = require ('./ascii_module');

module.exports = function(file) {
  return new Promise(function (resolve, reject) {
    var filename = file.substring(0, file.lastIndexOf('.'));

    // See if image is portrait or landscape
    var dimensions = sizeOf(file);
    var resizeObject;
    if (dimensions.height > dimensions.width) {
      resizeObject = {
        height: '50%',
        width: '25%'
      }
    } else {
      resizeObject = {
        height: '50%',
        width: '50%'
      }
    }

    var asciiConverter = new ImageToAscii({
      resize: resizeObject,
      multiplyWidth: 2,
      colored: true
    });
    // Asciify image
    asciiConverter.convert(filename + '.png', function(err, converted) {
      if (err) {
        // Delete the converted file
        fileUtils.delete(filename + '.png');
        reject(err);
      } else {
        // Delete the converted file
        fileUtils.delete(filename + '.png');
        // Output the ascii!
        resolve(converted);
      }
    });
  });
}
