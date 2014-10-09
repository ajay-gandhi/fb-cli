#!/usr/bin/env node

'use strict';
var fb,
    printer = require('./printer'),
    YoFace = require('./yoface'),
    loginstuff = require('./login');

////////////////////////////// Commandline tools. //////////////////////////////

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

// Post straight up.
if (program.post) {
  loginstuff
    .login()
    .then(function (FB) {
      fb = new YoFace(FB);
      fb.post(program.post, function () {
          console.log('Posted.');
        });
    });
}

/////////////////////////////////// Startup. ///////////////////////////////////


/**
 * Checks if the user has to login first, then inits.
 * Or as Kevin says:
 *   Start this madness. This blasphemy. SPARTA! GKLADSJFLSKJFL
 * @return {Awesomeness} 2 and a half pounds of it...or at least a promise ;)
 */
else {
  loginstuff
    .login()
    .then(function (FB) {
      var UI = require('./ui.js');
      var yf = new YoFace(FB);
      var ui = new UI(printer, yf);

      ui.initFalafelMode();
    })
    .catch(console.trace);
}

