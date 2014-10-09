#!/usr/bin/env node

'use strict';
var yf, ui, headless,
    YoFace = require('./yoface'),
    accountManager = require('./login'),
    ui = require('./ui.js');


///////////////////////////// Setup cmdline tools. /////////////////////////////

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

   // Do the permissions thing.
   .connectToGraph()

   // Create YoFace with the resolved FB object
   .then(function (FB) {
     yf = new YoFace(FB);
   })

   /* 
   // Ask for login for the headless browser thing.
   .then(function () {
     return ui.askForLogin();
   })

   // Deal with the credentials; create the headless browser if we should.
   .then(function (credentials) {

     // >> If credentials are empty, set some setting to not nagg about it again.
     // >> If credentials are not empty, do the headless browser login thing.
     console.log(credentials);
   })

   // If we're creating the hb, it will be here. Else it will be undefined.
   // Sore this.
   .then(function (zombie) {
     headless = zombie;
   });
    */

// We have a command. Do what it says and dont acutally enter IFM.
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
    // Start the interactive falafel mode! 
    .then(function () {
      ui.initFalafelMode(yf, headless);
    })

    // Die on errors.
    .catch(console.trace);
}

