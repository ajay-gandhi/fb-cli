#!/usr/bin/env node

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

///////////////////////////////// User Actions /////////////////////////////////

/**
 * Binds character input. Called whenever a key is pressed.
 */
var manage_keys = function (ch, key) {
  // Were inputting text, so don't do anything else.
  if (text) return;

  // Next news feed item.
  if (key && key.name == 'space') { action_next(); return; }

  // Quit.
  if (key && key.ctrl && key.name == 'c') { action_close(); return; }

  // Like.
  if (key && lastitem && key.name == 'l') { action_like(); return; }

  // Comment.
  if (key && lastitem && key.name == 'c') { mode_comment(); return; }
  
  // Open in the browser
  if (key && lastitem && key.name == 'o') { open(lastitem.link); return; }

  // Post.
  if (key && key.name == 'p') { mode_post(); return; }

  // Help.
  if (key && key.name == 'h') { printer.shelp(); return; }

  // Command mode.
  if (key && key.name == 'escape') { mode_command(); return; }
};

var manage_commands = function (cmd) {
  
  if (cmd === 'top')      { action_top();     return; }
  if (cmd === 'help')     { printer.chelp();  return; }
  if (cmd === 'post')     { mode_post();      return; }
  if (cmd === 'like')     { mode_post();      return; }
  if (cmd === 'comment')  { mode_comment();   return; }
  if (cmd === 'quit')     { action_close();   return; }
  if (cmd === 'next')     { action_next();    return; }

  console.log('no command ' + cmd + '.');
};

/////////////////////////////////// Actions. ///////////////////////////////////

/**
 * Go back to the top of the newsfeed.
 */
var action_top = function () {
  // Empty news cache
  fb.cache.news = [];
  fb.cache.news_next = null;
  printer.clear();

  // Print next news item
  fb.nextNews()
    .then(printer.print_newsfeed_item)
    .catch(console.error);
};

/**
 * Likes the last displayed post.
 * @return {[type]} [description]
 */
var action_like = function () {
  fb.like(lastitem.id);
  console.log('Liked!');
};

/**
 * Output nyan cat and exit :)
 */
var action_close = function () {
  printer.horizontalRule();
  printer.nyan();
  process.stdin.pause();
};

/**
 * Displays next newsfeed item.
 * @return {[type]} [description]
 */
var action_next = function () {
  fb.nextNews()
    // Save for user interaction
    .then(function (news) {
      lastitem = news;
      return lastitem;
    })
    // Print
    .then(printer.print_newsfeed_item)
    .catch(console.error);
};

//////////////////////////////////// Modes. ////////////////////////////////////


/**
 * Asks user for comment, and posts it.
 * @return {[type]} [description]
 */
var mode_comment = function () {
  textmode(true);

  var askComment = [{
    type: 'input',
    name: 'comment',
    message: 'What do you want to say?'
  }];
  inquirer.prompt(askComment, function(answer) {
    if (answer.comment !== '') {
      fb.comment(lastitem.id, answer.comment);
      console.log('posted comment.');
    }
    textmode(false);
  });
};


/**
 * Asks user for status update, and posts it.
 * @return {[type]} [description]
 */
var mode_post = function () {
  textmode(true);

  var question = [{
    type : 'input',
    name : 'post',
    message : 'What\'s on your mind?'
  }];

  inquirer.prompt(question, function(answers) {
    if (fb.post(answers.post)) {
      console.log('Posted: ', answers.post);
    }
    textmode(false);
  });
};

/**
 * Asks user for commands, and executes them.
 * @return {[type]} [description]
 */
var mode_command = function () {
  textmode(true);

  var q = [{ name: 'cmd', message: ':' }];
  inquirer.prompt(q, function(a) {
    manage_commands(a.cmd);
    textmode(false);
  });
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

///////////////////////////////////// Init /////////////////////////////////////


/**
 * Inits the whole system
 */
function init() {
  fb = require('./yoface.js');

  printer.newsfeed_title();

  // Log first newsfeed thingy
  fb.nextNews()
      .then(printer.print_newsfeed_item)
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
var dothismadness = function () {
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

dothismadness()
    .then(init)
    .catch(console.trace);

