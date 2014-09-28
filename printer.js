'use strict';
var chalk = require('chalk');
var httpRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

module.exports = (function () {
	
	function Printer () {}

	/**
	 * Prints the newsfeed title
	 */
	Printer.prototype.newsfeed_title = function() {
		console.log(' News Feed!');
		console.log('>──────────>\n');
	};


	/**
	 * Print full-width separator
	 */
	var horizontalRule = function() {
		var size = require('window-size');
		var separator = '';
		for (var i = 0; i < size.width; i++) {
			separator += '─';
		}
		console.log(chalk.cyan(separator));
	};
	Printer.prototype.horizontalRule = horizontalRule;


	/**
	 * Clears the screen and places the cursor at the top left
	 */
	var clear = function () {
	  process.stdout.write('\u001B[2J\u001B[0;0f');
	}
	Printer.prototype.clear = clear;


	/**
	 * Formats an action for display
	 * @param [char] key - The keyboard key that activates the command
	 * @param [string] title - The name of the command
	 */
	var fmta = function (key, title) {
	  return chalk.dim('(' + key + ') ') + title + ' ';
	}
	Printer.prototype.fmta = fmta;


	/**
	 * Prints Falafel in nice type. Swag.
	 */
	Printer.prototype.print_falafel = function() {
		console.log(
		'    ___     _        __      _  \n'+
		'   / __\\_ _| | __ _ / _| ___| | \n'+
		'  / _\\/ _` | |/ _` | |_ / _ \\ | \n'+
		' / / | (_| | | (_| |  _|  __/ | \n'+
		' \\/   \\__,_|_|\\__,_|_|  \\___|_| \n'+
		'                  ' + chalk.blue('for facebook\n'));
	};


	/**
	 * Print nyan cat! YAYAYAYYAYAYYYAYYAYAYAYNANANNANANANNNANANAN
	 */
	Printer.prototype.nyan = function() {
		console.log(
		'+      o     +              o     \n'+
		'    +             o     +       + \n'+
		'o          +                      \n'+
		'    o  +           +        +     \n'+
		'+        o     o       +        o \n'+
		'-_-_-_-_-_-_-_,------,      o     \n'+
		'_-_-_-_-_-_-_-|   /\\_/\\           \n'+
		'-_-_-_-_-_-_-~|__( ^ .^)  +     + \n'+
		'_-_-_-_-_-_-_-\"\"  \"\"              \n'+
		'+      o         o   +       o    \n'+
		'    +         +                   \n'+
		'o        o         o      o     + \n'+
		'    o           +                 \n'+
		'+      +     o        o bye  +    \n');
	};

	/**
	 * Prints help for keyboard shortcuts
	 */
	Printer.prototype.shelp = function() {
		console.log('Keyboard shortcuts');
		console.log('[spacebar] next post');
		console.log('[p]        post new status update.');
		console.log('[ctrl+c]   be productive again.');
		console.log('[esc]      command mode - \'help\' in command mode for command mode help.');
	};

	Printer.prototype.chelp = function() {
		console.log('top:    return to top of newsfeed.');
		console.log('help:   display this message.');
	};

	/**
	 * Prints given news feed item
	 * @param  {NewsfeedItem} news The Graph API newsfeed item to print.
	 */
	Printer.prototype.print_newsfeed_item = function(news) {
	  horizontalRule();

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
	  action_bar += fmta('p', 'post');  
	  if (news.link)     action_bar += fmta('o', 'open');
	  action_bar += fmta('l', 'like');
	  if (news.comments) action_bar += fmta('c', 'comment');
	  action_bar += fmta('h', 'help');
	  console.log(action_bar + '\n');
	};

	return new Printer();
})();

