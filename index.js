#!/usr/bin/env node

'use strict';
var yf, ui, headless,
    YoFace = require('./yoface'),
    fs = require('fs-extra'),
    accountManager = require('./login'),
    fileUtils = require('./file_utils'),
    ui = require('./ui.js');

/////////////////////////// Setup commandline tools. ///////////////////////////

var program = require('commander');
var falafel = require('./package.json');
program
  .version(falafel.version)
  .option('-p, --post <status>', 'Post a status update')

  // Append some extra stuff to help.
  .on('--help', function(){
    console.log('Calling with no arguments starts interactive newsfeed.\n');
  })

  .parse(process.argv);

/////////////////////////////////// Startup. ///////////////////////////////////

/**
 * Always try to login.
 */
var chainOfEvents = accountManager

  // Get FB API object or log in/obtain perms if there is no access token
  .login()

  // Create YoFace object with the resolved FB object
  .then(function (FB) {
    yf = new YoFace(FB);
  })

  // Ask for login credentials for the headless browser
  .then(function () {
    return ui.askForLogin();
  })

  // Deal with the credentials; create the headless browser if we should.
  .then(function (loginResults) {
    if (loginResults.noEmail != undefined) {
      // User doesn't want to be asked to login
      return false;
    } else if (loginResults.accessToken != undefined) {
      // User email is already saved locally
      // Query keychain
    } else if (loginResults.email == undefined) {
      // User doesn't want to enter email/pass
      // Write authInfo file so that user isn't asked again
      var authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
      authInfo.noEmail = "true";
      fs.outputFile(fileUtils.falafelHouse + '/authInfo.json', JSON.stringify(authInfo), function(err) {
        if (err) {
          console.log('Error writing authInfo.json');
          reject(err);
        }
      });
    } else {
      // User entered their email, so login
      accountManager.zombieLogin(loginResults)
        .then(function(browser) {
          // Successful login, return browser
          return browser;
        })
        .catch(console.error);
    }
  })

  // If we're creating the headless browser, store it here.
  // Otherwise, it will be false
  .then(function (zombie) {
    headless = zombie;
  });

// Received a direct command, do what it says instead of entering IFM
if (program.post) {
  chainOfEvents
    .then(function () {
      yf.post(program.post, function () {
          console.log('Posted.');
        });
    });
}

// No command. Let the falafels take over the world.
else {
  chainOfEvents
    // Start interactive falafel mode! 
    .then(function () {
      ui.initFalafelMode(yf, headless);
    })

    // Die on errors.
    .catch(console.trace);
}

