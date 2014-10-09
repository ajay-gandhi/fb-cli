#!/usr/bin/env node

'use strict';
var yf, ui, headless,
    YoFace = require('./yoface'),
    accountManager = require('./login'),
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
 var chainofevents = accountManager

  // Get FB API object or log in/obtain perms if there is no access token
   .connectToGraph()

   // Create YoFace with the resolved FB object
   .then(function (FB) {
     yf = new YoFace(FB);
   });

   /* 
   // Ask for login for the headless browser thing.
   .then(function () {
     return ui.askForLogin();
   })

  // Create YoFace object with the resolved FB object
  .then(function (FB) {
    yf = new YoFace(FB);
  })

  // Ask for login credentials for the headless browser
  .then(function () {
    return ui.askForLogin();
  })

   // If we're creating the hb, it will be here. Else it will be undefined.
   // Sore this.
   .then(function (zombie) {
     headless = zombie;
   });
    */

// Received a direct command, do what it says instead of entering IFM
if (program.post) {
  chainofevents
    .then(function () {
      yf.post(program.post, function () {
          console.log('Posted.');
        });
    });
}

// No command. Let the falafels take over the world.
else {
  chainofevents
    // Start interactive falafel mode! 
    .then(function () {
      ui.initFalafelMode(yf, headless);
    })

    // Die on errors.
    .catch(console.trace);
}

