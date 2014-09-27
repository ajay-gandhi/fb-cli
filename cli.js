#!/usr/bin/env node
// ^ Make it a cli

var script_name = "./cli.js";

// Args always includes "node" and the current script, so remove them
var args = process.argv.slice(2);

// List of valid commands
var commands = ["help", "newsfeed", "post", "poke"];

// Parse arguments
if (args.length >= 1) {
  var cmd = args[0];
  if (commands.indexOf(elm) == -1) {
    console.log("Invalid argument. Run `" + script_name + " help` for help.");
  } else if (cmd == "--help") {
    // Display help page
  } else if (cmd == "newsfeed") {
    // Display newsfeed
  } else if (cmd == "post") {
    if (args[1] != undefined) {
      // Post message
    } else {
      console.log("Invalid argument. `" + script_name + " post` takes an argument.");
    }
  } else if (cmd == "poke") {
    if (args[1] != undefined) {
      // Poke person
    } else {
      console.log("Invalid argument. `" + script_name + " post` takes an argument.");
    }
  }
}

// Config object
var config = {
  appID: '698243363597060', 
  secret: 'ed984e63cb8d378122fc5bd43dc962d6',
  token: 'CAAJ7DHOnawQBAA6AFS68RPaasmyRzbl9cyhiXHMLB6ZBMj4W4VdvrK06xa8BZCYOWDm1ZAE32hA6LfXn8SvPBjDOk9IGZAfIirLgpnArbvE70rgU9g2RM2RnjSdaqU57C9vEZApuueTPUUD5qDIkjo50hcjz9FZAnlEnnNFWDie1jZBZCQZBxRK6wcdmaZBispeZCZBh2zlZCfZAE1lQ6bw1Bhy70wD9jWIgPXjgsZD'
}

// Include the sdk
var Facebook = require('facebook-node-sdk');

// Func to connect to facebook
createFB = function(appId,secret,token) {
  return new Facebook({
    appID: appId,
    secret: secret
  }).setAccessToken(token);
};

// Connect to facebook
var fb = createFB(config.appID, config.secret, config.token)

// Do things!
fb.api('/me', function(err, data) {
  console.log(err);
    console.log(data); // => { id: ... }
});
