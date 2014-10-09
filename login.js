'use strict';
var Promise = require('es6-promise').Promise,
    Facebook = require('facebook-node-sdk'),
    fileUtils = require('./file_utils'),
    keychain = require('xkeychain');


/**
 * Handles all of the logging in, both through the facebook Graph API and
 * through the Zombie.
 */

module.exports = (function () {

  function LoginManager () {}

  //////////////////////////// Graph API Logging In ////////////////////////////

  /**
   * Attempts to login, then resolves with FB object.
   * @return {[type]} [description]
   */
  LoginManager.prototype.login = function() {
    var config = require('./config.json');
    return getAuth().then(function (authInfo) {
      return new Facebook({
        appID: config.appID,
        secret: config.secret
      }).setAccessToken(authInfo.accessToken);
    });
  };

  /**
   * Resolves with authInfo; either the one stored or asks the user to login.
   */
  var getAuth = function () {
    return new Promise(function (resolve, reject) {
      var authInfo;

      // Will raise if user needs to login.
      try {
        authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
        // Check if user access token exists already
        if (!authInfo.accessToken) {
          throw new Error();
        }

        // Got the auth info.
        resolve(authInfo);
      } 

      // User has to login to Facebook
      catch (e) {
        console.log('Looks like you have to login.');
        var server = require('./server');
        return server.showLogin().catch(console.trace);
      }
    });
  };



  //////////////////////////////// Zombie Login ////////////////////////////////

  /**
   * Logins through a headless browser using the given credentials.
   * @param  {Credentials} credentials {username, password}
   * @return {Promise}                 A Promise that resolves to an
   *                                   an authenticated zombie on 
   *                                   m.facebook.com's newsfeed. 
   */
  LoginManager.prototype.zombieLogin = function(credentials) {

    return new Promise(function (resolve, reject) {
      var browser = new (require('zombie'))();

      browser.visit('http://m.facebook.com/', function () {

        // Fill out email and pw
        browser.fill('email', credentials.email);
        browser.fill('pass', credentials.password);

        // Login failed
        if (false) {
          reject(new Error('Login Failed'));
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

        // Login to FB
        browser.pressButton('Log In', function() {
          resolve(browser);
        });
      });
    }); 
  };

  /**
   * Retrives password from keychain for a given email.
   * Returns promise that resolves to a Credentials object with email and
   * password. An empty object if no credentials could be found.
   */
  LoginManager.prototype.getCredentials = function(email) {
    return new Promise(function (resolve) {
      keychain.getPassword(
        { account: email, 
          service: 'FacebookFalafel' },      
          function(err, pass) {
            if (err) resolve({});
            resolve({email: email, password: pass});
          });
    });
  };

  return new LoginManager();

})();