#!/usr/bin/env node

'use strict';
var yf, ui, headless,
    YoFace = require('./yoface'),
    account_m = require('./login'),
    fileUtils = require('./file_utils'),
    ui = require('./ui.js');

/////////////////////////// Setup commandline tools. ///////////////////////////

var program = require('commander');
var falafel = require('./package.json');
program
    .version(falafel.version)
    .option('-p, --post <status>', 'Post a status update')
    //.option('-g, --graph <path>', 'Print raw graph data')

    // Append some extra stuff to help.
    .on('--help', function() {
        console.log('Calling with no arguments starts interactive newsfeed.\n');
    })
    
    .parse(process.argv);

/////////////////////////////////// Startup. ///////////////////////////////////

/**
 * Always try to login.
 */
var chainOfEvents = account_m

    /**
     * Get FB API object or log in/obtain perms if there is no access token.
     * @return {FB} Facebook SDK object
     */
    .connectToGraph()

    /**
     * Create YoFace with the resolved FB object
     * @param  {FB}     FB Facebook SDK object
     * @return {YoFace}    YoFace from SDK object.
     */
    .then(function(FB) {
        yf = new YoFace(FB);
    })

    /**
     * Get the login credentials if stored. If not, ask for them.
     * @return {[type]} [description]
     */
    .then(function() {
        var authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
    
        var email = authInfo.email; // 'email@zardoz.com', null or undefined.
    
        // Never asked before. Try to get it.
        if (email === undefined) {
    
          return ui
    
          .askForLogin()                    // Yes yes yo?
    
          .then(account_m.saveCredentials); // Resolves with saved credentials
    
        }
    
        // User doesn't want to be bothered. We'll work with no credentials.
        if (email === null) {
            return {};
        }
    
        // Got an email, get the password too.
        else {
            return account_m.getCredentials(email);
        }
    })
    
    /**
     * Deal with the credentials; create the headless browser if we should.
     * @param  {credentails} credentials Email and password, or empty object.
     */
    .then(function(credentials) {
    
        // No credentails. Continue down the chain.
        if (Object.keys(credentials).length === 0) {
            return null;
        }
    
        // Credentials. Do the login thing. Save browser to 'headless'.
        else {
    
            return account_m
    
                .zombieLogin(credentials)
    
                .then(function(zombie) {
                    headless = zombie;
                });
    
        }
    })
    
    /**
     * Awesome. We got what we needed. Moving on.
     */
    .then(function() {
        console.log('Logged in. Ready to go.');
    });




// Received a direct command, do what it says instead of entering IFM
if (program.post) {
    chainOfEvents
        .then(function() {
            yf.post(program.post, function() {
                console.log('Posted.');
            });
        });
}

// ... All other commands.

// No command. Let the falafels take over the world.
else {
    chainOfEvents
    // Start interactive falafel mode! 
        .then(function() {
            ui.initFalafelMode(yf, headless);
        })

        // Die on errors.
        .catch(console.trace);
}