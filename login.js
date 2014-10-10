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

      // User has to authenticate thru Facebook
      catch (e) {
        console.log('Looks like you have to authenticate.');
        var server = require('./server');
        server.showLogin()
          .then(function(accessTokenObj) {
            console.log('Authentication complete.\n');
            resolve(accessTokenObj);
          })
          .catch(console.trace);
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
            resolve(browser);
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


  /**
   * [saveCredentials description]
   * @param  {[type]} credentials [description]
   * @return {Promsie}            Resolves to saved credentials
   */
  LoginManager.prototype.saveCredentials = function(credentials) {

    var authInfo = require(fileUtils.falafelHouse + '/authInfo.json');


    return new Promise(function (resolve, reject) {

      // Something to save
      if (Object.keys(credentials).length !== 0) {
        console.log(credentials)

        // Save password in keychain
        keychain.setPassword(
          { account: credentials.email, 
            service: 'FacebookFalafel', 
            password: credentials.password 
          },
          function(err) {
            if (err !== null && err !== undefined)
              reject(err);
          }
        );


        // Update authInfo.json file with new email
        authInfo.email = credentials.email;
        fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(authInfo), function(err) {
          if (err) {
            console.log('Error writing authInfo.json');
            reject(err);
          }
        });
      } 

      // Wont nagg again
      else {
        authInfo.email = null; // Means asked. Nothing given.

        fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(authInfo), function(err) {
          if (err) {
            console.log('Error writing authInfo.json');
            reject(err);
          }
        });

      }

      resolve(credentials);

    });
  };

  return new LoginManager();

})();