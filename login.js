'use strict';
var Promise = require('es6-promise').Promise,
    Facebook = require('facebook-node-sdk'),
    fileUtils = require('./file_utils'),
    fs = require('fs-extra'),
    keychain = require('xkeychain');


/**
 * Handles all of the logging in, both through the facebook Graph API and
 * through the headless browser (zombie).
 */

module.exports = (function () {

  function LoginManager () {}

  //////////////////////////// Graph API Logging In ////////////////////////////

  /**
   * Attempts to login, then resolves with FB object.
   * @returns [object] A Facebook API object
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
   * Ensures that an access token exists, otherwise asks the user to login
   * @returns [Promise] An object holding the access token or an error
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
      } catch (e) {
        // User has to login to Facebook
        console.log('Looks like you have to login.');
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
          var results = browser.text('div#objects_container table:first-child td:first-child');
          if (results.indexOf('password was incorrect') != -1) {
            // Incorrect password
            reject(new Error('Incorrect password.'));
          } else if (results.indexOf('recognize your email') != -1) {
            // Incorrect email
            reject(new Error('Incorrect email address.'));
          } else {
            // Save password in keychain
            keychain.setPassword(
              { account: credentials.email, 
                service: 'FacebookFalafel', 
                password: credentials.password 
              },
              function(err) {
                if (err != null && err != undefined)
                  reject(err);
              }
            );

            // Save email since keychain query requires it
            // Update authInfo.json file
            var authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
            if (authInfo.email == undefined) {
              // Write file
              authInfo.email = credentials.email;
              fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(authInfo), function(err) {
                if (err) {
                  console.log('Error writing authInfo.json');
                  reject(err);
                }

                // If no errors, return the headless browser
                resolve(browser);
              });
            } else {
              // Email is already written in local file
              resolve(browser);
            }
          }
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