var fb = require('./yoface.js');
var keypress = require('keypress');
var open = require('open')


// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// Log first newsfeed thingy.
fb.nextNews().then(print_newsfeed_item).catch(console.error)

// listen for the "keypress" event

var lastitem = null;


process.stdin.on('keypress', function (ch, key) {

  
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

  if (key && lastitem && key.name == 'l') {
    console.log('gotta like', lastitem.id ,'!')
    return
  }

  if (key && lastitem && key.name == 'o') {
    console.log('gotta open', lastitem.id ,'in browser')
    open()
    return
  }

  console.log('got "keypress"', key);

});

process.stdin.setRawMode(true);
process.stdin.resume();




function print_newsfeed_item (news) {
	if (news.type = 'link') {}
	if (news.type = 'status') {}
	if (news.type = 'photo') {
		console.log(news.ascii_img)
	}
	if (news.type = 'video') {
		console.log('video!')
	}

	lastitem = news;
	console.log("--------------------------------------------");
	console.log(news.message + "\n");
	console.log("(l) like (o) open in browser");

}
