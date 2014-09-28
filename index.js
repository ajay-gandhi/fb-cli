#!/usr/bin/env node
// ^ Make it executable

'use strict';
// Just some global vars
var fb, httpRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
var keypress = require('keypress'),
    inquirer = require('inquirer'),
    chalk = require('chalk'),
    spawn = require('child_process').spawn,
    Promise = require('es6-promise').Promise,
    open = require('open');
    

var appname = 
"    ___     _        __      _  \n"+
"   / __\\_ _| | __ _ / _| ___| | \n"+
"  / _\\/ _` | |/ _` | |_ / _ \\ | \n"+
" / / | (_| | | (_| |  _|  __/ | \n"+
" \\/   \\__,_|_|\\__,_|_|  \\___|_| \n"+
"                  " + chalk.blue("for facebook\n");

var nyan = 
"+      o     +              o     \n"+
"    +             o     +       + \n"+
"o          +                      \n"+
"    o  +           +        +     \n"+
"+        o     o       +        o \n"+
"-_-_-_-_-_-_-_,------,      o     \n"+
"_-_-_-_-_-_-_-|   /\\_/\\           \n"+
"-_-_-_-_-_-_-~|__( ^ .^)  +     + \n"+
"_-_-_-_-_-_-_-\"\"  \"\"              \n"+
"+      o         o   +       o    \n"+
"    +         +                   \n"+
"o        o         o      o     + \n"+
"    o           +                 \n"+
"+      +     o        o bye  +    \n";

/**
 * Clears the screen and places the cursor at the top left
 */
function clear() {
  process.stdout.write('\u001B[2J\u001B[0;0f');
}

/**
 * Outputs a full-width horizontal rule
 */
function horizontalRule() {
  // Create full-width separator
  var size = require('window-size');
  var separator = '';
  for (var i = 0; i < size.width; i++) {
    separator += '─';
  }
  console.log(chalk.cyan(separator));
}

var lastitem = null;
var text = false;

/**
 * Binds character input. Called whenever a key is pressed.
 * @param  {[type]} ch  [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
var manage_keys = function (ch, key) {
  // Were inputting text, so don't do anything else.
  if (text) return;

  // Next news feed item.
  if (key && key.name == 'space') {
    fb.nextNews()
      .then(print_newsfeed_item)
      .catch(console.error);
    return;
  }

  // Quit.
  if (key && key.ctrl && key.name == 'c') {
    // Output nyan cat and exit :)
    horizontalRule();
    console.log(nyan);
    process.stdin.pause();
    return;
  }

  // Comment.
  if (key && lastitem && key.name == 'c') {
    textmode(true);

    var askComment = [{
      type: 'input',
      name: 'comment',
      message: 'What do you want to say?'
    }];
    var commentMessage;
    inquirer.prompt(askComment, function(answer) {
      fb.comment(lastitem.id, answer.comment);
      textmode(false);
    });
    return;
  }

  // Like.
  if (key && lastitem && key.name == 'l') {
    fb.like(lastitem.id);
    console.log('Liked!');
    return;
  }

  // Open in the browser
  if (key && lastitem && key.name == 'o') {
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
      fb.post(answers.post);
      console.log('Posted "', answers.post + '".');
      textmode(false);
    });
    return;
  }

  // Help
  if (key && key.name == 'h') {
    console.log('[spacebar] next post');
    console.log('[esc]      command mode - \'help\' in command mode for command mode help.')
    console.log('[p]        post new status update')
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
        clear();

        // Print next news item
        fb.nextNews()
          .then(print_newsfeed_item)
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
}


/**
 * Prints a newsfeed item.
 * @param  {Newsfeeed item} news
 */
function print_newsfeed_item (news) {
  horizontalRule();

  // Save item in case user wants to interact with it.
  lastitem = news;

  // Whose post is it
  console.log(chalk.bgCyan(chalk.black(news.from.name)) + ':\n');

  if (news.story) console.log(news.story + '\n');
  if (news.message){
    var msg = news.message;
    // Identify links
    var matches = msg.match(httpRegex);
    if (matches) {
      msg = msg.replace(matches[0],chalk.cyan(chalk.underline(matches[0])));
    }
    console.log(msg + '\n');
    
  }

  // Build the "# of likes" message 
  var others_msg = '';
  if (news.likes) {
    others_msg += news.likes.data.length;
    // Add a + if there are lots
    if (news.likes.paging.next) others_msg += '+';
    others_msg += ' likes.  ';
  }

  // Build the "# of comments" message
  if (news.comments) {
    others_msg += news.comments.data.length;
    // Add a + if there are lots
    if (news.comments.paging.next) others_msg += '+';
    others_msg += ' comments.';
  }

  // Post likes and comments.
  if (others_msg !== '') console.log(others_msg,'\n');


  // Build the action bar at the bottom.
  var action_bar = '';
  if (news.link)     action_bar += fmta('o', 'open');
  if (news.likes)    action_bar += fmta('l', 'like');
  if (news.comments) action_bar += fmta('c', 'comment');
  action_bar += fmta('h', 'help');
  console.log(action_bar + '\n');
}

/**
 * Formats an action for display
 * @param [char] key - The keyboard key that activates the command
 * @param [string] title - The name of the command
 */
function fmta (key, title) {
  return chalk.dim('(' + key + ') ') + title + ' ';
}



/**
 * Inits the whole system
 */
function init() {
  fb = require('./yoface.js');

  // Yay!
  console.log(' News Feed!');
  console.log('>──────────>\n');

  // Log first newsfeed thingy
  fb.nextNews()
      .then(print_newsfeed_item)
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
    clear();

    // Falafel ftw
    console.log(appname);

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