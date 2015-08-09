'use strict';
// Module to access local files
var fs = require('fs-extra-promise'),
    request = require('request');

/**
 * Downloads a file
 * @param [string] uri - The remote URI where the file is located
 * @param [string] filename - The location to save the file
 * @param [function] callback - A callback function
 *   Thanks to Cezary Wojtkowski for this:
 *   http://stackoverflow.com/questions/12740659/downloading-images-with-node-js
 */
module.exports.download = function(uri, filename, callback){
  var file = module.exports.falafelHouse + filename;

  fs.ensureFile(file, function () {
    request.head(uri, function(err, res){
        if (err) console.trace(err);

        // Only do things if there is an image
        if (parseInt(res.headers['content-length']) > 0) {
          request(uri).pipe(fs.createWriteStream(file)).on('close', callback);
        }
      });
  });
};

/**
 * The user's home dir with hidden folder .fb-falafel/
 */
module.exports.falafelHouse = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.fb-falafel';

/**
 * Creates a file and any directories required to house that file
 * @param [string] path - The location of the file
 * @param [function] callback - The function to call after the file is created
 */
module.exports.createFile = function (path, callback) {
  fs.ensureFile(module.exports.falafelHouse + path, callback);
};

/**
 * Deletes a file
 * @param [string] path - The location of the file
 * @param [function] callback - A callback function for any errors that occur
 */
module.exports.delete = function (path, callback) {
  // Check if the file exists
  fs.exists(module.exports.falafelHouse + path, function (exists) {
    if (exists) {
      // If it exists, delete it!
      fs.unlink(module.exports.falafelHouse + path, function (err) {
        if (err) callback(err);
      });
    }
  });
};