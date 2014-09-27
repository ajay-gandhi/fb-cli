var Promise = require('es6-promise').Promise;
var utils = require('./utils');
var Ascii = require('ascii');


module.exports = (function () {

	////////////////

	var config = {
		appID: '698243363597060', 
		secret: 'ed984e63cb8d378122fc5bd43dc962d6',
		token: 'CAAJ7DHOnawQBAA6AFS68RPaasmyRzbl9cyhiXHMLB6ZBMj4W4VdvrK06xa8BZCYOWDm1ZAE32hA6LfXn8SvPBjDOk9IGZAfIirLgpnArbvE70rgU9g2RM2RnjSdaqU57C9vEZApuueTPUUD5qDIkjo50hcjz9FZAnlEnnNFWDie1jZBZCQZBxRK6wcdmaZBispeZCZBh2zlZCfZAE1lQ6bw1Bhy70wD9jWIgPXjgsZD',
		tokev: 'CAAJ7DHOnawQBAFELtCapEm8C7VqO0bSHukSEevuE53AaWObnUM2O7gbhq5VAVCqkvB0eteNbR3QsUx6keuPdOZAjZCoZAie8I4niiDg3ZCsznr6zwFF6tZCi8JKyab3SLQp6mDg4fWCO2IgFU7y7G1tY9dPRMIVYgrZAml233lP6LacOEj6tZB4Bob1zmmHXb9I26851LUDl1utEnHqerCA'
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
	///
	///
	///



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

			if (false) {
				var url = "http://graph.facebook.com/"+news.id+"/picture"

				utils.delete('cache.jpeg', function (err) {
					if (err) {
						console.error(err);
						resolve(news)
					}

					utils.download(url, 'cache.jpeg', function(){

					  var pic = new Ascii('cache.jpeg');
					  pic.convert(function(err, result) {
					    if (err) console.trace(err);

					    news.ascii_img = result;
					    console.log(news)
					    resolve(news);

					  });
					});


				});

			} else { resolve(news) }

			
		
		});

	}

	};

	return new YoFace(fb);
})();