#!/usr/bin/env node
'use strict';
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
"                  " + chalk.blue("for facebook\n")

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
"+      +     o        o bye  +    \n"

function clear () {
    process.stdout.write ('\u001B[2J\u001B[0;0f');
}



var fb;
// listen for the "keypress" event

var lastitem = null;
var text = false;
var httpRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;


/**
 * Gets the number of columns and rows in current terminal window
 */
function getTermSize(cb){
    var cols, lines;
    spawn('tput', ['cols']).stdout.on('data', function(data){
        cols = Number(data);
        if (cols && lines && cb)
            cb(cols, lines);
    });
    spawn('tput', ['lines']).stdout.on('data', function(data){
        lines = Number(data);
        if (cols && lines && cb)
            cb(cols, lines);
    });
}
var cols, lines;
getTermSize(function(c, l) {
  console.log
  cols = c;
  lines = l;
});


/**
 * Binds character input. Called whenever a key is pressed.
 * @param  {[type]} ch  [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
var manage_keys = function (ch, key) {
	// Were inputing text. Don't do anything else.
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
    console.log(nyan);
    process.stdin.pause();
    return;
  }

  // Help
  if (key && key.ctrl && key.name == 'h') {
    console.log('press \'esc\' for command mode');
    return;
  }

  // Comment.
  if (key && lastitem && key.name == 'c') {
    textmode(true)
    var askComment = [{
      type: 'input',
      name: 'comment',
      message: 'What do you want to comment?'
    }];
    var commentMessage;
    inquirer.prompt(askComment, function(answer) {
      fb.comment(lastitem.id, answer.comment);
      textmode(false)
    });
    return;
  }

  // Like.
  if (key && lastitem && key.name == 'l') {

    fb.like(lastitem.id);
    console.log('liked!');


    return;
  }

  // Open on the browser
  if (key && lastitem && key.name == 'o') {
    open(lastitem.link);
    return;
  }

  // Post
  if (key && key.name == 'p') {
  	textmode(true)

  	var question = {
  		type : 'input',
  		name : 'post',
  		message : 'Whats on your mind?'
  	};

  	inquirer.prompt([question], function( answers ) {
  		console.log('Posted "', answers.post + '".');
      fb.post(answers.post);
      textmode(false)
  	});
    return;
  }

  // Help
  if (key && key.name == 'h') {
    console.log('(space) next post.');
    console.log('(esc)   command mode. \'help\' in command mode for command mode help.')
    console.log(' p      new status update.')
    return;
  }

  // Command mode.
  if (key && key.name == 'escape') {
    textmode(true)
    var q = { name: 'cmd', message: ':' };
    inquirer.prompt([q], function(a) {
      

      // Return to top of newsfeed
      if (a.cmd === 'top') {
        fb.cache.news = []
        fb.cache.news_next = null;
        clear();
        fb.nextNews()
          .then(print_newsfeed_item)
          .catch(console.error);

      }

      if (a.cmd === 'help') {
        console.log('top:    return to top of newsfeed.');
        console.log('help:   display this message.');
      }

      textmode(false);
    });
    return;
  }

  //console.log('got:keypress', key);
};

/**
 * Enables textmode, so we can input strings of characters.
 * @param  {[type]} tm [description]
 * @return {[type]}    [description]
 */
var textmode = function (tm) {
  if (tm) {
    process.stdin.setRawMode(false); text = true;
  } else {
    process.stdin.setRawMode(true); text = false; process.stdin.resume();

  }
}


/**
 * Prints a newsfeed item.
 * @param  {Newsfeeed item} news
 */
function print_newsfeed_item (news) {
  var size = require('window-size');

  var separator = '';
  for (var i = 0; i < size.width; i++) {
    separator += '─';
  }
	console.log(chalk.cyan(separator));
	//nice sugar
	

	//does this do anything???

	// if (news.type = 'link') {}
	// if (news.type = 'status') {}
	// if (news.type = 'photo') {}
	// if (news.type = 'video') {}

    // Save item in case user wants to interact with it.
	lastitem = news;


	console.log(chalk.bgCyan(chalk.black(news.from.name)) + ':\n');

	if (news.story) console.log(news.story + '\n');
	if (news.message){
		var msg = news.message;
		var matches = msg.match(httpRegex);
		if(matches){
			msg = msg.replace(matches[0],chalk.cyan(chalk.underline(matches[0])));
		}
		console.log(msg + '\n');
		
	} 
	// if (news.type === 'link') {
	// 	console.log(msg + '\n');
	// }


	// Build that likes message 
	var others_msg = '';
	if (news.likes) {
		others_msg = others_msg + news.likes.data.length + ' ';
		if (news.likes.paging.next) others_msg = others_msg + '+ ';
		others_msg = others_msg + 'likes.  ';
	}

	// Build that likes message 
	if (news.comments) {
		others_msg = others_msg + news.comments.data.length + ' ';
		if (news.comments.paging.next) others_msg = others_msg + '+ ';
		others_msg = others_msg + 'comments.';
	}

	// Post likes + comments.
	if (others_msg !== '') console.log(others_msg,'\n');


	// Build the action bar at the bottom.
	var action_bar = '';
	if (news.link)     action_bar = action_bar + fmta ('o', 'open') ;
  if (news.likes)    action_bar = action_bar + fmta ('l', 'like');
  if (news.comments) action_bar = action_bar + fmta ('c', 'comment');
                     action_bar = action_bar + fmta ('h', 'help');
  console.log(action_bar);
}

/**
 * Formats an action for display
 */
function fmta (key, title) {
  return chalk.dim('(' + key + ') ') + title + ' ';
}



/**
 * Inits this madness.
 */
function init () {

    fb = require('./yoface.js');

    // Yay!
    console.log(' News Feed!');
    console.log('>──────────>\n');

    // Log first newsfeed thingy.
    fb.nextNews()
        .then(print_newsfeed_item)
        .catch(console.error);
    
    // Set up the key catching
    keypress(process.stdin);
    process.stdin.on('keypress', manage_keys);
    process.stdin.setRawMode(true);
    process.stdin.resume();
}



/**
 * Start this madness. This blasphemy. SPARTA! GKLADSJFLSKJFL
 * @return {Awesomeness} 2 pounds and a half of it.
 */
var dothismadness = function () {
  return new Promise(function (resolve, reject) {
    clear();
    console.log(appname);

    try {
      var authInfo = require('./authInfo');
      if (!authInfo.accessToken) {
        throw new Error();
      }
    } catch (e) {
      console.log('Looks like you have to login.');
      var hack = require('./server');
      return hack.showLogin().then(init).catch(reject);
    }

    resolve({});
  });
};

dothismadness()
    .then(init)
    .catch(console.trace);




