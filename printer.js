'use strict';
var chalk = require('chalk');

/**
 * UI output methods for Falafel 
 */

module.exports = (function () {
    
  // Empty constructor
  function Printer () {}

  /**
   * Prints the newsfeed header
   */
  Printer.prototype.newsfeed_title = function () {
    console.log(' News Feed!');
    console.log('>──────────>\n');
  }

  /**
   * Prints a full-width horizontal rule
   */
  var horizontalRule = function () {
    var size = require('window-size');
    var separator = '';
    for (var i = 0; i < size.width; i++) {
      separator += '─';
    }
    console.log(chalk.cyan(separator));
  }
  Printer.prototype.horizontalRule = horizontalRule;

  /**
   * Prints a full-width horizontal rule with text
   *
   * @param [string] text - The text to embed in the rule
   */
  var hrWithText = function (text) {
    var size = require('window-size');
    var prefix = '──( ' + text + ' )';
    var sepLength = size.width - prefix.length;
    // Append – until window length is reached
    var separator = '';
    for (var i = 0; i < sepLength; i++) {
      separator += '─';
    }
    separator = '──( ' + chalk.bold(chalk.green(text)) + ' )' + separator;
    console.log(chalk.cyan(separator) + '\n');
  }
  Printer.prototype.hrWithText = hrWithText;

  /**
   * Clears the screen and places the cursor at the top left
   */
  var clear = function () {
    process.stdout.write('\u001B[2J\u001B[0;0f');
  }
  Printer.prototype.clear = clear;

  /**
   * Clears the current line
   */
  var clearLine = function () {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
  Printer.prototype.clearLine = clearLine;

  /**
   * Formats an action for display
   *
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
  Printer.prototype.print_falafel = function () {
    console.log(
    '    ___     _        __      _  \n'+
    '   / __\\_ _| | __ _ / _| ___| | \n'+
    '  / _\\/ _` | |/ _` | |_ / _ \\ | \n'+
    ' / / | (_| | | (_| |  _|  __/ | \n'+
    ' \\/   \\__,_|_|\\__,_|_|  \\___|_| \n'+
    '                  ' + chalk.blue('for facebook\n'));
  }

  /**
   * Print nyan cat! YAYAYAYYAYAYYYAYYAYAYAYNANANNANANANNNANANAN
   */
  Printer.prototype.nyan = function () {
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
  }

  /**
   * Prints help for keyboard shortcuts
   */
  Printer.prototype.shelp = function () {
    horizontalRule();
    console.log('Keyboard Shortcuts');
    console.log('[spacebar] next post');
    console.log('[p]        post new status update');
    console.log('[h]        display this message');
    console.log('[ctrl+c]   be productive again');
    console.log('[esc]      command mode - \'help\' in command mode for command mode help');
  }

  /**
   * Prints help for command mode
   */
  Printer.prototype.chelp = function () {
    console.log('top            return to top of newsfeed');
    console.log('post           post status update');
    console.log('like           like last newsfeed post');
    console.log('comment        post comment on last newsfeed post');
    console.log('next           next newsfeed post');
    console.log('poke <name>    Pokes <name>');
    console.log('help           display this message');
    console.log('quit           close falafel');
    console.log('.              leave command mode');
  }

  /**
   * Prints given news feed item
   *
   * @param [Object] news - The newsfeed item to print
   */
  Printer.prototype.print_newsfeed_item = function (news) {

    // Whose post is it
    hrWithText(news.name);

    // Print the following if they exist
    if (news.summary) console.log(news.summary);

    if (news.content) {
      var msg = news.content;
      // Identify links and prettify them
      var httpRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
      var matches = msg.match(httpRegex);
      if (matches)
        msg = msg.replace(matches[0], chalk.cyan(chalk.underline(matches[0])));

      console.log(msg);
    }

    // Sub post is basically regular post, but less styling and indented
    if (news.subpost) {
      console.log(chalk.yellow('    ┏━'));
      // Whose post is it
      subprint(chalk.green(news.subpost.name));

      // Print the following if they exist
      if (news.summary) subprint(news.subpost.summary);

      if (news.content) {
        var msg = news.subpost.content;
        // Identify links and prettify them
        var httpRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
        var matches = msg.match(httpRegex);
        if (matches)
          msg = msg.replace(matches[0], chalk.cyan(chalk.underline(matches[0])));

        subprint(msg);
      }

      /************************** End of subcontent ***************************/

      var others_msg = '';

      // Print metadata
      if (news.subpost.like_message)    others_msg += news.subpost.like_message;
      if (news.subpost.comment_message) others_msg += news.subpost.comment_message;

      if (others_msg !== '') { subprint(); subprint(others_msg); }

      // Build the action bar at the bottom.
      var action_bar = '';
      if (news.subpost.link)          action_bar += fmta('o', 'open');
      if (news.subpost.like_link)     action_bar += fmta('l', 'like');
      if (news.subpost.comment_link)  action_bar += fmta('c', 'comment');
      if (action_bar != '') { subprint(); subprint(action_bar); }

      console.log(chalk.yellow('    ┗━'));

    } else {
      console.log();
    }

    /***************************** End of content *****************************/
    var others_msg = '';

    // Print metadata
    if (news.like_message)    others_msg += news.like_message;
    if (news.comment_message) others_msg += news.comment_message;

    if (others_msg !== '') console.log(others_msg, '\n');

    // Build the action bar at the bottom.
    var action_bar = '';
    action_bar += fmta('p', 'post');  

    if (news.link)          action_bar += fmta('o', 'open');
    if (news.like_link)     action_bar += fmta('l', 'like');
    if (news.comment_link)  action_bar += fmta('c', 'comment');

    action_bar += fmta('h', 'help');
    console.log(action_bar + '\n');
  }

  return new Printer();

})();

/**
 * Local function for printing subpost content
 */
var subprint = function (text) {
  if (!text) var text = '';
  console.log(chalk.yellow('    ┃ ') + text);
}