'use strict';
var http = require('http'),
    fs = require('fs-extra'),
    url = require('url'),
    querystring = require('querystring'),
    request = require('request'),
    Promise = require('es6-promise').Promise,
    fileUtils = require('./file_utils');


/**
 * Login Server
 * Facebook thinks we are a web app, so set up one to login and set
 *   up permissions for the app
 */
module.exports = (function () {

  function WebHack() {}

  WebHack.prototype.showLogin = function() {
    return new Promise(function (resolve, reject) {
      // Create local server
      var server = http.createServer(function(req, res) {

        // When a request is passed, get the request pieces
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        // If there is no request, the user has not logged in yet
        if (Object.keys(query).length === 0) {
          // Open do/login.html
          var fileStream = fs.createReadStream(__dirname + '/do/login.html');
          fileStream.pipe(res);
        } else {
          // Otherwise, grab the access token
          var shortToken = query;

          // Make a call to FB API to get a long-lived token
          // Can't use FB.api because we need to pass special params
          var config = require('./config.json');
          var longTokenURL = 'https://graph.facebook.com/oauth/access_token?' +
            'grant_type=fb_exchange_token' +
            '&client_id=' + config.appID +
            '&client_secret=' + config.secret +
            '&fb_exchange_token=' + query.accessToken;

          request(longTokenURL, function(err, resp, body) {
            if (err) {
              console.log('Error getting long-lived token.');
              console.error(err);
            }
            // Returned as a querystring, not JSON
            var longToken = querystring.parse(body);
            // Rename
            var accessTokenObj = {
              accessToken: longToken.access_token
            };

            // Write access token to local file
            fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(accessTokenObj), function(err) {
              if (err) {
                console.log('Error writing authInfo.json');
                reject(err);
              }
              resolve(accessTokenObj);
            });
          });
        }
      }).listen(3000);

      require('open')('http://localhost:3000/');
    });
  };

  return new WebHack();

})();
