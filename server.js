'use strict';
var http = require('http'),
    fs = require('fs-extra'),
    url = require('url'),
    Promise = require('es6-promise').Promise;

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
          // Write access token to local file
          fs.outputFile(__dirname + '/authInfo.json', JSON.stringify(query), function(err) {
            if (err) {
              console.log("Error writing authInfo.json");
              reject(err);
            }
            resolve(query);
          });
        }

      }).listen(3000);

      require('open')('http://localhost:3000/');
    });
  };

  return new WebHack();

})();