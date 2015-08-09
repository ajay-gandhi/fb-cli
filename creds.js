'use strict';

// NPM modules
var Promise  = require('es6-promise').Promise,
    keychain = require('xkeychain');

/**
 * Handles all of the credentials, e.g. interfacing with OS keychain
 */

module.exports = (function () {

  // Constructor does nothing
  function CredsManager () {}

  /**
   * Retrieves password from OS keychain for a given email
   *
   * @param [string] email - The email for which to search for a password
   *
   * @returns [Promise] Resolves to a Credentials object with email and
   *   password or rejects if the password wasn't found
   */
  CredsManager.prototype.getCredentials = function (email) {

    return new Promise(function (resolve, reject) {
      // Try to get password from keychain
      keychain.getPassword(
        {
          account: email, 
          service: 'FacebookFalafel'
        },      
        function(err, pass) {
          if (err) reject(err);
          else     resolve({ email: email, password: pass });
        }
      );
    });
  };


  /**
   * Saves the given credentials in the OS keychain
   *
   * @param [Object] credentials - An object containing 'email' and 'password'
   *
   * @return [Promise] Resolves to the saved credentials or an error
   */
  CredsManager.prototype.saveCredentials = function(credentials) {

    return new Promise(function (resolve, reject) {
      // Save password in keychain
      keychain.setPassword(
        {
          account: credentials.email, 
          service: 'FacebookFalafel', 
          password: credentials.password 
        },
        function(err) {
          if (err) reject(err);
          else     resolve(credentials);
        }
      );
    });
  };

  return new CredsManager();

})();
