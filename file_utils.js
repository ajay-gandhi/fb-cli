// Module to download files and delete them
var fs = require('fs'),
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
  request.head(uri, function(err, res, body){
    if (err) console.trace(err);

    // Only do things if there is an image
    if (parseInt(res.headers['content-length']) > 0) {
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    }
  });
}

/**
 * Deletes a file
 * @param [string] path - The location of the file
 * @param [function] callback - A callback function for any errors that occur
 */
module.exports.delete = function (path, callback) {
  // Check if the file exists
  fs.exists(path, function (exists) {
    if (exists) {
      // If it exists, delete it!
      fs.unlink(path, function (err) {
        if (err) callback(err);
      });
    }
  });
}