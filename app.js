#!/usr/bin/env node

'use strict';

// NPM modules
var fs = require('fs-extra-promise');

// Local modules
var fb,
    creds_m   = require('./creds'),
    ui        = require('./ui'),
    Undead    = require('./undead'),
    fileUtils = require('./file_utils');

// var yf, ui, headless,
//     YoFace = require('./yoface'),
//     account_m = require('./login'),
//     fileUtils = require('./file_utils'),
//     ui = require('./ui.js');

/////////////////////////// Setup commandline tools ////////////////////////////

var program = require('commander');
var falafel = require('./package.json');
program
    .version(falafel.version)
    .option('-p, --post <status>', 'Post a status update')
    .option('-k, --poke <name>',   'Post one of your friends')

    // Append some extra stuff to help
    .on('--help', function () {
        console.log('Calling with no arguments starts interactive newsfeed.\n');
    })
    
    .parse(process.argv);

/////////////////////////////////// Startup ////////////////////////////////////

var authInfoPath = fileUtils.falafelHouse + '/authInfo.json';

var chainOfEvents = (new Promise(function (resolve) {


    /**
     * Checks if the email and password are saved on the OS. Asks the user for
     *   them if they are not
     *
     * @returns [Object] The Facebook credentials for the user
     */

      fs.stat(authInfoPath, function (err) {
        if (err) resolve(false);
        else     resolve(true);
      });
    }))
    .then(function(exists) {

      return new Promise(function (resolve, reject) {

        if (exists) {
          // Email exists
          var authInfo = require(authInfoPath);

          // Try getting saved password
          creds_m
            .getCredentials(authInfo.email)
            .then(
              // Password exists, immediately resolve the received creds
              resolve,
              function (err) {
                // Password not saved, ask for it
                resolve(ui.askForPassword(authInfo));
              }
            );

        } else {
          // Have to do full login
          ui
            .askForLogin()
            .then(function (creds) {
              return creds_m.saveCredentials(creds);
            })
            .then(function (creds) {
              // Take advantage of async
              fs.writeJson(authInfoPath, { email: creds.email });
              resolve(creds);
            })
            .catch(reject);
        }
      });
    })


    /**
     * Log in to headless browser.
     *
     * @param [Object] creds - The Facebook email and password
     *
     * @returns The logged in Undead object
     */
    .then(function (creds) {
      fb = new Undead();
      return fb.init(creds.email, creds.password);
    })
    
    /**
     * Awesome. We got what we needed. Moving on.
     */
    .then(function() {
        console.log('Logged in. Ready to go!');
    });




// Received a direct command, do what it says instead of entering IFM
if (program.post) {

  // Post status update
  chainOfEvents
    .then(function () {
      return fb.post(program.post);
    })
    .then(function () {
      console.log('Posted');
    })
    .catch(console.log);

} else if (program.poke) {

  // Poke someone
  chainOfEvents
    .then(function () {
      return fb.poke(program.poke);
    })
    .then(function (actual_pokee) {
      console.log('Poked', actual_pokee);
    })
    .catch(console.log);

}

// All other commands.
else {
    chainOfEvents
      // Start interactive falafel mode! 
      .then(function () {
          ui.initFalafelMode(fb);
      })

      // Die on errors
      .catch(console.trace);
}
