'use strict';
var Promise = require('es6-promise').Promise,
    sizeOf = require('image-size'),
    exec = require('child_process').exec,
    ImageToAscii = require ('./ascii_module');

module.exports = function(file) {
  return new Promise(function (resolve, reject) {
    var filename = file.substring(0, file.lastIndexOf('.'));
    // Convert image to png
    var convertImg = exec('convert ' + file + ' ' + filename + '.png', function (error) {
      if (error !== null) {
        reject(error);
      } else {
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
            exec('rm ' + filename + '.png');
            reject(err);
          } else {
            // Delete the converted file
            exec('rm ' + filename + '.png');
            // Output the ascii!
            resolve(converted);
          }
        });
      }
    });
  });
}
