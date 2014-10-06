'use strict';
var http = require('http'),
    fs = require('fs-extra'),
    url = require('url'),
    querystring = require('querystring'),
    request = require('request'),
    Promise = require('es6-promise').Promise,
    fileUtils = require('./file_utils'),
    Facebook = require('facebook-node-sdk');

module.exports = (function () {
  function WebHack() {}

  WebHack.prototype.showLogin = function() {
    return new Promise(function (resolve, reject) {
      // Create local server
      var server = http.createServer(function(req, res) {

        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;

        if (Object.keys(query).length === 0) {
          // Open do/login.html
          var fileStream = fs.createReadStream(__dirname + '/do/login.html');
          fileStream.pipe(res);
        } else {
          server.close();
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
            var longToken = querystring.parse(body);
            console.log(longToken);
            var accessTokenObj = {
              accessToken: longToken.access_token
            }

            // Write access token to local file
            fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(accessTokenObj), function(err) {
              if (err) {
                console.log('Error writing authInfo.json');
                reject(err);
              }
              resolve(longToken);
            });
          });
        }

      }).listen(3000);

      require('open')('http://localhost:3000/');
    });
  };

  return new WebHack();

})();