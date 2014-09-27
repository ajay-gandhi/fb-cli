var Promise = require('es6-promise').Promise;
var utils = require('./utils');
var Ascii = require('ascii');


module.exports = (function () {

	var config = {
		appID: '698243363597060', 
		secret: 'ed984e63cb8d378122fc5bd43dc962d6',
		token: 'CAAJ7DHOnawQBAA6AFS68RPaasmyRzbl9cyhiXHMLB6ZBMj4W4VdvrK06xa8BZCYOWDm1ZAE32hA6LfXn8SvPBjDOk9IGZAfIirLgpnArbvE70rgU9g2RM2RnjSdaqU57C9vEZApuueTPUUD5qDIkjo50hcjz9FZAnlEnnNFWDie1jZBZCQZBxRK6wcdmaZBispeZCZBh2zlZCfZAE1lQ6bw1Bhy70wD9jWIgPXjgsZD',
		tokev: 'CAAJ7DHOnawQBAML5zGzIlhaKMcwroRM3DxRGgLPF3CXUeqirM7T4ZBtys7gleactcea4fGGG7BFFbhOheauozQBxRdjak3rAZCNxX2wGY7ZC8bJfQLQsZAMnhJj3MxcUXSTfnQCcL6vmCTFTv12PmeXvTiV6ohfGA1BYW8jlJmaqZCZAitIG5wPYuWfhz9al9oGRfxXjl6T1TGQZC4RXOsy'
	}

	var Facebook = require('facebook-node-sdk');

	function ActualFacebook (config) {

		// Connect to facebook
		createFB = function(appId,secret,token) {
		  return new Facebook({
		    appID: appId,
		    secret: secret
		  }).setAccessToken(token);
		};

		return fb = createFB(config.appID, config.secret, config.tokev)

	}

	var fb = new ActualFacebook(config);

	//////////////////

	function YoFace (fb) {
		this.fb = fb;
		this.cache = {
			news : []
		}
	}

	YoFace.prototype.nextNews = function() {
		var self = this;

		return new Promise(function (resolve, reject) {
			
			if (self.cache.news.length === 0) {				
				// >> Add support for newsfeed pagination
				fb.api('/me/home', function(err, res) {
					if (err) reject(err);
				  	//console.log(res);
				  	self.cache.news = res.data;
				  	resolve(self.next_news())
				});
			}

			else {
				resolve(self.next_news())
			}
		})
		
	};

	YoFace.prototype.next_news = function () {
		var self = this;

		return new Promise(function (resolve, reject) {
			var news = self.cache.news.shift();

			utils.delete('cache.png', function (err) {
				utils.download(news.picture, './cache.png', function(){
				  var pic = new Ascii('./cache.jpeg');
				  pic.convert(function(err, result) {
				    if (err) reject(err);
				    news.ascii_img = result;
				    resolve(news)
				  });
				});
			});
		});

	}

	return new YoFace(fb);
})();