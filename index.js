#!/usr/bin/env node
// ^ Make it executable

'use strict';
// Just some global vars
var fb,
    inquirer = require('inquirer'),
    Promise = require('es6-promise').Promise,
    open = require('open'),
    printer = require('./printer'),
    keypress = require('keypress');


var lastitem = null;
var text = false;
var allowedActions = [];

/**
 * Binds character input. Called whenever a key is pressed.
 */
var manage_keys = function (ch, key) {
  // Were inputting text, so don't do anything else.
  if (text) return;

  // Next news feed item.
  if (key && key.name == 'space') {
    fb.nextNews()
      // Save for user interaction
      .then(function (news) {
        lastitem = news;
        return lastitem;
      })
      // Print
      .then(function(newsfeedItem) {
        printer.print_newsfeed_item(newsfeedItem);
        allowedActions = newsfeedItem.availableActions;
      )
      .catch(console.error);
    return;
  }

  // Quit.
  if (key && key.ctrl && key.name == 'c') {
    // Output nyan cat and exit :)
    printer.horizontalRule();
    printer.nyan();
    process.stdin.pause();
    return;
  }

  // Comment.
  if (key && lastitem && key.name == 'c' && allowedActions.indexOf('c') != -1) {
    textmode(true);

    var askComment = [{
      type: 'input',
      name: 'comment',
      message: 'What do you want to say?'
    }];
    inquirer.prompt(askComment, function(answer) {
      fb.comment(lastitem.id, answer.comment, function() {
        console.log("Comment posted!");
      });
      textmode(false);
    });
    return;
  }

  // Like.
  if (key && lastitem && key.name == 'l') {
    fb.like(lastitem.id, function() {
      console.log("Liked!");
    });
    return;
  }

  // Open in the browser
  if (key && lastitem && key.name == 'o' && allowedActions.indexOf('o') != -1) {
    open(lastitem.link);
    return;
  }

  // Post
  if (key && key.name == 'p') {
    textmode(true);

    var question = [{
      type : 'input',
      name : 'post',
      message : 'What\'s on your mind?'
    }];

    inquirer.prompt(question, function(answers) {
      fb.post(answers.post, function() {
        console.log('Posted "', answers.post + '".');
      });
      textmode(false);
    });
    return;
  }

  // Help
  if (key && key.name == 'h') {
    console.log('Keyboard shortcuts');
    console.log('[spacebar] next post');
    console.log('[p]        post new status update.');
    console.log('[ctrl+c]   be productive again.');
    console.log('[esc]      command mode - \'help\' in command mode for command mode help.');
    return;
  }

  // Command mode.
  if (key && key.name == 'escape') {
    textmode(true);

    var q = [{ name: 'cmd', message: ':' }];
    inquirer.prompt(q, function(a) {
      // Return to top of newsfeed
      if (a.cmd === 'top') {
        // Empty news cache
        fb.cache.news = [];
        fb.cache.news_next = null;
        printer.clear();

        // Print next news item
        fb.nextNews()
          .then(printer.print_newsfeed_item)
          .catch(console.error);

      }

      // Display commands
      if (a.cmd === 'help') {
        console.log('top:    return to top of newsfeed.');
        console.log('help:   display this message.');
      }

      textmode(false);
    });
    return;
  }
};

/**
 * Enables textmode, so we can input strings of characters.
 * @param  [bool] tm - Enter (1) or exit (0) textmode
 */
var textmode = function (tm) {
  if (tm) {
    process.stdin.setRawMode(false);
    text = true;
  } else {
    process.stdin.setRawMode(true);
    text = false;
    process.stdin.resume();
  }
};

/**
 * Inits the whole system
 */
function init() {
  fb = require('./yoface.js');

  printer.newsfeed_title();

  // Log first newsfeed thingy
  fb.nextNews()
      .then(function(newsfeedItem) {
        printer.print_newsfeed_item(newsfeedItem);
        allowedActions = newsfeedItem.availableActions;
      )
      .catch(console.error);
  
  // Start catching keypresses
  keypress(process.stdin);
  process.stdin.on('keypress', manage_keys);
  process.stdin.setRawMode(true);
  process.stdin.resume();
}

/**
 * Checks if the user has to login first, then inits.
 * Or as Kevin says:
 *   Start this madness. This blasphemy. SPARTA! GKLADSJFLSKJFL
 * @return {Awesomeness} 2 and a half pounds of it...or at least a promise ;)
 */
var doThisMadness = function () {
  return new Promise(function (resolve, reject) {
    printer.clear();

    // Falafel ftw
    printer.print_falafel();

    // Wrap in try-catch in case other errors arise
    try {
      var authInfo = require('./authInfo');
      // Check if user access token exists already
      if (!authInfo.accessToken) {
        throw new Error();
      }
    } catch (e) {
      // User has to login to Facebook
      console.log('Looks like you have to login.');
      var hack = require('./server');
      return hack.showLogin().then(init).catch(reject);
    }

    // Don't actually need to return anything
    resolve({});
  });
};

doThisMadness()
    .then(init)
    .catch(console.trace);

