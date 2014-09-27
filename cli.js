#!/usr/bin/env node
// ^ Make it a cli

// Require some modules
var fs = require('fs');
var chalk = require('chalk');

var script_name = "./cli.js";

// Args always includes "node" and the current script, so remove them
var args = process.argv.slice(2);

// List of valid commands
var commands = ["help", "newsfeed", "post", "poke"];

// Parse arguments
if (args.length >= 1) {
  var cmd = args[0];
  if (commands.indexOf(cmd) == -1) {
    console.log("Invalid argument. Run `" + script_name + " help` for help.");
  } else if (cmd == "help") {
    console.log();
    fs.readFile("man.txt", "utf8", function(err, data) {
      if (err) {
        return console.log("Error reading manual.");
      }
      var manual = JSON.parse(data);
      console.log(chalk.bold(manual.header));
      console.log("\n");
      var contents = manual.categories;
      contents.forEach(function(elm) {
        console.log(chalk.bold(elm.catName));
        console.log("\t" + elm.content + "\n");
      });
    });
  } else if (cmd == "newsfeed") {
    // Display newsfeed
  } else if (cmd == "post") {
    if (args[1] != undefined) {
      var message = args[1];
    } else {
      console.log("Invalid argument. `" + script_name + " post` takes an argument.");
    }
  } else if (cmd == "poke") {
    if (args[1] != undefined) {
      var pokee = args[1];
    } else {
      console.log("Invalid argument. `" + script_name + " post` takes an argument.");
    }
  }
}