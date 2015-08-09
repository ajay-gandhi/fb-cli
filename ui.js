'use strict';

// NPM modules
var Promise  = require('es6-promise').Promise,
    inquirer = require('inquirer'),
    openlink = require('open'),
    keypress = require('keypress');

// Local modules
var printer = require('./printer');

var fb,
    lastitem       = null,
    text           = false,
    allowedActions = [];

/**
 * Implementation of Interactive Falafel Mode and other UI goodies.
 */

module.exports = (function () {

  function GUIsSuck () {}

  GUIsSuck.prototype.initFalafelMode = function (undead) {
    fb = undead;

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
        // allowedActions = news.allowedActions;
      })
      .catch(console.error);

    // Start catching keypresses
    keypress(process.stdin);
    process.stdin.on('keypress', manage_keys);
    process.stdin.setRawMode(true);
    process.stdin.resume();
  }

  GUIsSuck.prototype.askForLogin = function () {
    textmode(true);

    console.log('To use Falafel, you have to login to Facebook.\n' +
                'If you choose to save your password, we\'ll\n' +
                'store it in your OS\'s keychain (the same\n' +
                'where your browser stores passwords). If you\n' +
                'don\'t save your password, you\'ll have to\n' +
                'enter it each time you run Falafel.');

    var authQuestions = [
      {
        type: 'input',
        name: 'email',
        message: 'Login email:',
        // Validate the email address
        validate: function(email) {
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return re.test(email) ? true : 'Invalid email address';
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password:'
      },
      {
        type: 'confirm',
        name: 'save',
        message: 'Save password?'
      }
    ];

    return new Promise(function (resolve) {
      inquirer.prompt(authQuestions, function (answers) {
        resolve(answers);
        textmode(false);
      });
    });
  }

  GUIsSuck.prototype.askForPassword = function (obj) {
    textmode(true);

    var pwQuestions = [
      {
        type: 'password',
        name: 'password',
        message: 'Password:'
      }
    ];

    return new Promise(function (resolve) {
      inquirer.prompt(pwQuestions, function (answer) {
        // Append to obj if it exists
        if (obj) {
          obj.password = answer.password;
          resolve(object);

        } else {
          // Just resolve password
          resolve(password);
        }
        textmode(false);
      });
    });
  }

  return new GUIsSuck();
    
})();

/**
 * Handles keypresses, performing the action corresponding to each key combo
 * @param [type] ch - Unused
 * @param [Object] key - An object containing information about which key
 *   was pressed
 */
var manage_keys = function (ch, key) {

  // We're inputting text, so don't do anything else.
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
  // if (key && lastitem && key.name == 'o' && allowedActions.indexOf('o') != -1) { openlink(lastitem.link); return; }

  // Post
  if (key && key.name == 'p') { mode_post(); return; }

  // Help
  if (key && key.name == 'h') { printer.shelp(); return; }

  // Command mode
  if (key && key.name == 'escape') { mode_command(); return; }
}

var manage_commands = function (cmd) {
  cmd = cmd.trim();
  
  if (cmd === 'top')      { action_top();                     return; }
  if (cmd === 'help')     { printer.chelp(); mode_command();  return; }
  if (cmd === 'post')     { mode_post();                      return; }
  if (cmd === 'like')     { action_like();                    return; }
  if (cmd === 'comment')  { mode_comment();                   return; }
  if (cmd === 'quit')     { action_close();                   return; }
  if (cmd === 'next')     { action_next();                    return; }
  if (cmd === '.')        { mode_shortcuts();                 return; }

  // Commands with arguments
  var args = cmd.split(' ');
      cmd  = args.shift();

  if (cmd === 'poke')  { action_poke(args); return; }

  console.log('No command `' + cmd + '`.');
}

/////////////////////////////////// Actions. ///////////////////////////////////

/**
 * Pokes pokee
 * @param  {String} pokee Person to poke
 */
var action_poke = function (pokee) {
  pokee = pokee.join(' ');
  if (pokee === '') { console.log('Who to poke?'); return; }
  fb
    .poke(pokee)
    .then(function (actual_pokee) {
      console.log('Poked ' + actual_pokee + '!', '\n');
    });
}

/**
 * Go back to the top of the newsfeed.
 */
var action_top = function () {
  // Empty news cache
  fb.posts_cache = [];
  printer.clear();

  // Print next news item
  fb.nextNews()
    .then(function(news) {
      printer.print_newsfeed_item(news);
      allowedActions = news.allowedActions;
    })
    .catch(console.error);
}

/**
 * Likes the last displayed post
 */
var action_like = function () {
  fb
    .like(lastitem)
    .then(function () {
      console.log('Liked!', '\n');
    });
}

/**
 * Output nyan cat and exit :)
 */
var action_close = function () {
  printer.horizontalRule();
  printer.nyan();
  process.stdin.pause();
}

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
}

//////////////////////////////////// Modes. ////////////////////////////////////

/**
 * Asks user for comment, and posts it to the latest newsfeed item
 */
var mode_comment = function () {
  textmode(true);

  var askComment = [{
    type:    'input',
    name:    'comment',
    message: 'What do you want to say?'
  }];

  inquirer.prompt(askComment, function (answer) {
    if (answer.comment !== '') {
      fb
        .comment(lastitem, answer.comment)
        .then(function () {
          console.log('Posted comment!', '\n');
        });
    }
    textmode(false);
  });
}


/**
 * Asks user for status update, and posts it
 */
var mode_post = function () {
  textmode(true);

  var askPost = [{
    type:    'input',
    name:    'post',
    message: 'What\'s on your mind?'
  }];

  inquirer.prompt(askPost, function (answer) {
    fb
      .post(answer.post)
      .then(function() {
        console.log('Posted:', answer.post, '\n');
      });
    textmode(false);
  });
}

/**
 * Asks user for a command, and executes it
 */
var mode_command = function () {
  textmode(true);

  var q = [{ name: 'cmd', message: ':' }];
  inquirer.prompt(q, function(a) {
    textmode(false);
    manage_commands(a.cmd);
  });
}

/**
 * Asks user for a command, and executes it
 */
var mode_shortcuts = function () {
  console.log();
  textmode(false);
}

/**
 * Toggles textmode, so we can input strings of characters
 * @param [bool] tm - Whether to enter (true) or exit (false) textmode
 */
var textmode = function (tm) {
  text = tm;
  process.stdin.setRawMode(!tm);
  if (!tm) process.stdin.resume();
}
