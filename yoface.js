var Promise = require('es6-promise').Promise;
var utils = require('./utils');
var Ascii = require('ascii');
var Facebook = require('facebook-node-sdk');


module.exports = (function () {

	////////////////

	var config = {
		appID: '698243363597060', 
		secret: 'ed984e63cb8d378122fc5bd43dc962d6',
		token: 'CAACEdEose0cBAPOrmltEp9MfunPOORs7yzKNUOBbGTEfy0zJvZBKLsfSU20XiTV6dyFDJ64580A3tFH6f54m957BWDaF0ZCtUt80MV4dDrVvWtDCRe9eA7YIJnQ8nWmTL6082H4nFWIvZAmBWiP3pwRu0OGn1W3ZBCcrJa1z9ZCftmx637lRwWBAysn9ule9BzeUeR15PtB1TnLCMXqzV',
	}


	function ActualFacebook (config) {

		// Connect to facebook
		createFB = function(appId,secret,token) {
		  return new Facebook({
		    appID: appId,
		    secret: secret
		  }).setAccessToken(token);
		};

		return fb = createFB(config.appID, config.secret, config.token)

	}

	var fb = new ActualFacebook(config);

	//////////////////
	///
	///
	///


	/**
	 * Initializes yo facebook object, dawg.
	 * @param {[type]} fb [description]
	 */
	function YoFace (fb) {
		this.fb = fb;
		this.cache = {
			news : []
		}
	}

	/**
	 * Returns a promise for the next news feed element in the users' newsfeed.
	 * @return {[type]} [description]
	 */
	YoFace.prototype.nextNews = function() {
		var self = this;

		return new Promise(function (resolve, reject) {
			
			if (self.cache.news.length === 0) {				
				// >> Add support for newsfeed pagination
				fb.api('/me/home', function(err, res) {
					if (err) reject(err);
				  	//console.log(res);
				  	self.cache.news = res.data;
				  	resolve(self.cache.news.shift())
				});
			}

			else {
				resolve(self.cache.news.shift())
			}
		})
	};



	YoFace.prototype.like = function(page) {
		
	};


	// YoFace.prototype.next_news = function () {
	// 	var self = this;

	// 	return new Promise(function (resolve, reject) {
	// 		var news = self.cache.news.shift();

	// 		if (false) {
	// 			var url = "http://graph.facebook.com/"+news.id+"/picture"

	// 			utils.delete('cache.jpeg', function (err) {
	// 				if (err) {
	// 					console.error(err);
	// 					resolve(news)
	// 				}

	// 				utils.download(url, 'cache.jpeg', function(){

	// 				  var pic = new Ascii('cache.jpeg');
	// 				  pic.convert(function(err, result) {
	// 				    if (err) console.trace(err);

	// 				    news.ascii_img = result;
	// 				    console.log(news)
	// 				    resolve(news);

	// 				  });
	// 				});
	// 			});

	// 		} else { resolve(news) }
	// 	});

	//}

	return new YoFace(fb);

})();