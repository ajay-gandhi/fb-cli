'use strict';
var Promise = require('es6-promise').Promise,
    inquirer = require('inquirer'),
    openlink = require('open'),
    fileUtils = require('./file_utils'),
    keypress = require('keypress');

var lastitem = null;
var text = false;
var allowedActions = [];

var printer = require('./printer');
var fb; // YoFace object to use (Graph API)
var hb; // Headless browser to use (mobile site)

/**
 * Implementation of Interactive Falafel Mode and other UI goodies.
 */

module.exports = (function () {

  function GUIsSuck () {}

  GUIsSuck.prototype.initFalafelMode = function(yoface, zombie) {
    fb = yoface;
    hb = zombie;

    // Print the opening header for Interactive Falafel Mode
    printer.clear();
    printer.print_falafel();    
    printer.newsfeed_title();

    // Log first newsfeed item
    fb.nextNews()
      // Save the item for user interaction
      .then(function (news) {
        lastitem = news;
        return lastitem;
      })

      // Actually print it
      .then(function(news) {
        printer.print_newsfeed_item(news);
        allowedActions = news.allowedActions;
      })
      .catch(console.error);
      
    // Start catching keypresses
    keypress(process.stdin);
    process.stdin.on('keypress', manage_keys);
    process.stdin.setRawMode(true);
    process.stdin.resume();
  };

  GUIsSuck.prototype.askForLogin = function() {
    var authInfo = require(fileUtils.falafelHouse + '/authInfo.json');
    if (authInfo.noEmail != undefined) {
      // User doesn't want to be asked for email again
      return new Promise(function (resolve) {
        resolve(authInfo);
      });
    } else if (authInfo.email != undefined) {
      return new Promise(function (resolve) {
        resolve(authInfo);
      });
    } else {
      textmode(true);

      console.log('For certain features, we need your login credentials.\n' +
                  'Don\'t worry, we store them on your OS\'s keychain\n' +
                  '(the same place where your browser stores remembered ' +
                  'passwords).\nYou can get more information' +
                  'about how all this works at\n' +
                  'http://fb-falafel.ml/passwordpolicy\n');

      console.log('If you don\'t feel safe doing this, leave the fields blank.\n');

      var authQuestions = [
        {
          type: 'input',
          name: 'email',
          message: 'Login email:',
          // Validate the email address
          validate: function(email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (email.trim() == '' || re.test(email)) {
              return true;
            } else {
              return false
            }
          }
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password'
        }
      ];

      return new Promise(function (resolve) {
        inquirer.prompt(authQuestions, function(answer) {
          if (answer.email !== '') {
            // If the fields are not blank, return the object
            resolve(answer);
          } else {
            // Let them know that they can do it later and return an
            // empty object
            console.log('Alright, you can still opt-in later if you want.');
            resolve({});
          }
          textmode(false);
        });
      });
    }
  };

  return new GUIsSuck();
    
})();

/**
 * Handles keypresses, performing the action corresponding to each key combo
 * @param [type] ch - Unused
 * @param [Object] key - An object containing information about which key
 *   was pressed
 */
var manage_keys = function (ch, key) {
  // Were inputting text, so don't do anything else.
  if (text) return;

  // Next news feed item
  if (key && key.name == 'space') { action_next(); return; }

  // Quit
  if (key && key.ctrl && key.name == 'c') { action_close(); return; }

  // Like
  if (key && lastitem && key.name == 'l') { action_like();  return; }

  // Comment
  if (key && lastitem && key.name == 'c') { mode_comment(); return; }
  
  // Open in the browser
  if (key && lastitem && key.name == 'o' && allowedActions.indexOf('o') != -1) { openlink(lastitem.link); return; }

  // Post
  if (key && key.name == 'p') { mode_post(); return; }

  // Help
  if (key && key.name == 'h') { printer.shelp(); return; }

  // Command mode
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

  console.log('No command `' + cmd + '`.');
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
    .then(function(news) {
      printer.print_newsfeed_item(news);
      allowedActions = news.allowedActions;
    })
    .catch(console.error);
};

/**
 * Likes the last displayed post
 */
var action_like = function () {
  fb.like(lastitem.id, function() {
    console.log('Liked!');
  });
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
 */
var action_next = function () {
  fb.nextNews()
    // Save item for user interaction
    .then(function (news) {
      lastitem = news;
      allowedActions = lastitem.allowedActions;
      return lastitem;
    })
    // Print item
    .then(printer.print_newsfeed_item)
    .catch(console.error);
};

//////////////////////////////////// Modes. ////////////////////////////////////

/**
 * Asks user for comment, and posts it to the latest newsfeed item
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
      fb.comment(lastitem.id, answer.comment, function() {
        console.log('Posted comment!');
      });
    }
    textmode(false);
  });
};


/**
 * Asks user for status update, and posts it
 */
var mode_post = function () {
  textmode(true);

  var question = [{
    type : 'input',
    name : 'post',
    message : 'What\'s on your mind?'
  }];

  inquirer.prompt(question, function(answers) {
    fb.post(answers.post, function() {
      console.log('Posted: ', answers.post);
    });
    textmode(false);
  });
};

/**
 * Asks user for a command, and executes it
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
 * Toggles textmode, so we can input strings of characters
 * @param [bool] tm - Whether to enter (true) or exit (false) textmode
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