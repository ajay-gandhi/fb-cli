var fb = require('./yoface.js');
var keypress = require('keypress');
var open = require('open')
var inquirer = require("inquirer");


// listen for the "keypress" event

var lastitem = null;
var text = false;


/**
 * Binds character input. Called whenever a key is pressed.
 * @param  {[type]} ch  [description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
var manage_keys = function (ch, key) {
	// Were inputing text. Don't do anything else.
	if (text) return;

  
  if (key && key.name == 'space') {
	fb.nextNews()
		.then(print_newsfeed_item)
		.catch(console.error)
	return
  }


  // Quit.
  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
    return
  }

  // Likes
  if (key && lastitem && key.name == 'l') {
    console.log('gotta like', lastitem.id ,'!')
    return
  }

  // View likes
  if (key && lastitem && key.name == 'v') {
    console.log('gotta show likes for', lastitem.id ,'.')
    return
  }

  if (key && lastitem && key.name == 'o') {
    console.log('gotta open', lastitem.id ,'in browser')
    open(lastitem.link);
    return
  }

  if (key && key.name == 'p') {
  	process.stdin.setRawMode(false);
  	text = true;

  	var question = {
  		type : 'input',
  		name : 'post',
  		message : 'Whats on your mind?'
  	}
  	inquirer.prompt([question], function( answers ) {
  		console.log('got to post', answers.post);
  		text = false;
  		process.stdin.setRawMode(true);
  		process.stdin.resume();

  	});
    return
  }

  console.log('got "keypress"', key);
}


/**
 * Prints a newsfeed item.
 * @param  {Newsfeeed item} news
 */
function print_newsfeed_item (news) {
	console.log("--------------------------------------------");
	if (news.type = 'link') {}
	if (news.type = 'status') {}
	if (news.type = 'photo') {}
	if (news.type = 'video') {}

    // Save item in case user wants to interact with it.
	lastitem = news;


	console.log(news.from.name + ":\n")

	if (news.story) console.log(news.story + ":\n");
	if (news.message) console.log(news.message + "\n");
	if (news.type === "link") console.log(news.link + "\n")


	// Build that likes message 
	var others_msg = ""
	if (news.likes) {
		var others_msg = "(v) " + news.likes.data.length + ' ';
		if (news.likes.paging.next) others_msg = others_msg + "+ "
		others_msg = others_msg + "likes.  "
	}

	// Build that likes message 
	if (news.comments) {
		var others_msg = "(b) " + news.comments.data.length + ' ';
		if (news.comments.paging.next) others_msg = others_msg + "+ "
		others_msg = others_msg + "comments."
	}

	// Post likes + comments.
	if (others_msg != '') console.log(others_msg,'\n');


	// Build the action bar at the bottom.
	var action_bar = ""
	if (news.link) action_bar = action_bar + "(o) open " 

	action_bar = action_bar + "(p) post " 
	console.log(action_bar);
}



/**
 * Inits this madness.
 */
function init () {

    // Log first newsfeed thingy.
    fb.nextNews()
        .then(print_newsfeed_item)
        .catch(console.error)
    
    // Set up the key catching
    keypress(process.stdin);
    process.stdin.on('keypress', manage_keys);
    process.stdin.setRawMode(true);
    process.stdin.resume();


    // Yay!
    console.log('News Feed!');
    console.log('----------\n');
}


init();