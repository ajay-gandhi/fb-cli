'use strict';
var Promise = require('es6-promise').Promise,
    Facebook = require('facebook-node-sdk'),
    fileUtils = require('./file_utils'),
    keychain = require('xkeychain');


/**
 * Handles all of the logging in, both through the facebook Graph API and
 * through the headless browser (zombie).
 */

module.exports = (function () {

  function LoginManager () {}

  //////////////////////////// Graph API Logging In ////////////////////////////

  /**
   * Attempts to authenticate to the Facebook Graph API.
   * @return {[type]} [description]
   */
  LoginManager.prototype.connectToGraph = function() {
    var config = require('./config.json');
    return getAuth().then(function (authInfo) {
      return new Facebook({
        appID: config.appID,
        secret: config.secret
      }).setAccessToken(authInfo.accessToken);
    });
  };

  /**
   * Ensures that an access token exists, otherwise asks the user to login
   * @returns [Promise] An object holding the access token or an error
   */
  var getAuth = function () {
    return new Promise(function (resolve) {
      var authInfo;

      // Will raise if user needs to authenticate.
      try {
        authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
        // Check if user access token exists already
        if (!authInfo.accessToken) {
          throw new Error();
        }

        // Got the auth info.
        resolve(authInfo);
      } 

      // User has to authenticate to Facebook
      catch (e) {
        console.log('Looks like you have to authenticate.');
        var server = require('./server');
        return server.showLogin().catch(console.trace);
      }
    });
  };



  //////////////////////////////// Zombie Login ////////////////////////////////

  /**
   * Logs in through a headless browser using the given credentials.
   * @param [Object] credentials An object {email, password} containing the
   *   credentials needed to log in to Facebook
   * @returns [Promise] A Promise that resolves to an authenticated headless
   *   browser m.facebook.com's newsfeed. 
   */
  LoginManager.prototype.zombieLogin = function(credentials) {

    return new Promise(function (resolve, reject) {
      var browser = new (require('zombie'))();

      // Mobile website has fewer JS scripts and simpler page layout
      // More headless browser friendly
      browser.visit('http://m.facebook.com/', function () {

        // Fill out email and pw
        browser.fill('email', credentials.email);
        browser.fill('pass', credentials.password);

        // Login to FB
        browser.pressButton('Log In', function() {
          // Check if login failed
          if (false) {
            reject(new Error('Facebook login failed.'));
          }

          // Save password.
          keychain.setPassword(
            { account: credentials.email, 
              service: 'FacebookFalafel', 
              password: credentials.password 
            }, function(err) {
              reject(err);
          });

          // Save email. <<

          // If no errors, return the headless browser
          resolve(browser);
        });
      });
    }); 
  };

  /**
   * Retrieves password from keychain for a given email.
   * @param [string] email - The email for which to search for a password
   * @returns [Promise] Resolves to a Credentials object with email and
   *   password or an empty object if no credentials could be found
   */
  LoginManager.prototype.getCredentials = function(email) {
    return new Promise(function (resolve) {
      keychain.getPassword(
        {
          account: email, 
          service: 'FacebookFalafel'
        },      
        function(err, pass) {
          if (err) resolve({});
          resolve({email: email, password: pass});
        }
      );
    });
  };

  return new LoginManager();

})();