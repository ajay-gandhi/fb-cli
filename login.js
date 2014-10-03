'use strict';
var Promise = require('es6-promise').Promise,
Facebook = require('facebook-node-sdk'),
fileUtils = require('./file_utils');


module.exports = (function () {

  function LoginManager () {}

  var config = require('./config.json');
  var authInfo;

  /**
  * Resolves with FB object.
  * @return {[type]} [description]
  */
  LoginManager.prototype.login = function() {
    return getAuth()
    .then(function (authInfo) {
      return createFB(config.appID, config.secret, authInfo.accessToken);
    });
  };


  /**
  * Resolves with authInfo.
  * @return {[type]} [description]
  */
  function getAuth () {
    return new Promise(function (resolve, reject) {
      // Wrap in try-catch in case other errors arise
      try {
        authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
        // Check if user access token exists already
        if (!authInfo.accessToken) {
          throw new Error();
        }
      } catch (e) {
        // User has to login to Facebook
        console.log('Looks like you have to login.');
        var hack = require('./server');
        return hack.showLogin().catch(reject);
      }

      // Don't actually need to return anything
      resolve(authInfo);
    });
  }

  /**
  * Creates a Facebook API object
  * @param [object] cfg - A config object containing a Facebook appID,
  *     app secret, and access token
  * @returns [Facebook] An instance of the Facebook API
  */
  var createFB = function(appId, secret, token) {
    return new Facebook({
      appID: appId,
      secret: secret
    }).setAccessToken(token);
  };

  return new LoginManager();

})();