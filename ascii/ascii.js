'use strict';
var sys = require('sys');
var exec = require('child_process').exec;
var ImageToAscii = require ('./ascii_module');

var asciiConverter = new ImageToAscii ({
  resize: {
    height: '50%',
    width:  '50%'
  },
  multiplyWidth: 2,
  colored: true
});

module.exports.asciify = function(file) {
  var filename = file.substring(0, file.lastIndexOf('.'));
  // Convert image to png
  var convertImg = exec('convert ' + file + ' ' + filename + '.png', function (error) {
    if (error !== null) {
      return 'Error converting image: ' + error;
    } else {
      var output;
      // Asciify image
      asciiConverter.convert('./' + filename + '.png', function(err, converted) {
        if (err) {
          output = 'Error displaying image: ' + err;
        } else {
          // Output the ascii!
          output = converted;
        }
        // Delete the converted image
        exec('rm ' + filename + '.png');
        return output;
      });
    }
  });
}