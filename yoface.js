var Promise = require('es6-promise').Promise;
var Facebook = require('facebook-node-sdk');
var fileUtils = require('./file_utils.js');


module.exports = (function () {

	////////////////

	var config = require('./config')
	var authInfo = require('./authInfo')


	function ActualFacebook (config) {

		// Connect to facebook
		createFB = function(appId,secret,token) {
		  return new Facebook({
		    appID: appId,
		    secret: secret
		  }).setAccessToken(token);
		};

		return fb = createFB(config.appID, config.secret, authInfo.accessToken)
	}

	var FB = new ActualFacebook(config);

	/**
	 * Initializes yo facebook object, dawg.
	 * @param {[type]} fb [description]
	 */
	function YoFace (fb) {
		this.FB = fb;
		this.cache = {
			news : [],
			news_next : null,
			freinds : []
		}
	}

	// Make config info public
	YoFace.prototype.config = config;

	/**
	 * Returns a promise for the next news feed element in the users' newsfeed.
	 * @return {[type]} [description]
	 */
	YoFace.prototype.nextNews = function() {
		var self = this;

		return new Promise(function (resolve, reject) {
			
			if (self.cache.news.length === 0) {
				console.log('loading...');
				var feed_url = self.cache.news_next ? self.cache.news_next : '/me/home';

				FB.api(feed_url, function(err, res) {
					if (err) reject(err);
					if (res.paging.next) self.cache.news_next = res.paging.next

					// Download image and convert to ascii
			  	// var url = "http://graph.facebook.com/" + news.id + "/picture"

			  	// fileUtils.delete('cache.jpg', function(error) {
			  	// 	console.log(error);
			  	// });
	 				// fileUtils.download(url, 'cache.jpg', function() {
	 				//   console.log(ascii.asciify('cache.jpg'));
	 				// });
	 				// 
	 		 	

			  	self.cache.news = res.data;
			  	resolve(self.cache.news.shift());
				});
			} else {
				resolve(self.cache.news.shift())
			}
		})
	};

	YoFace.prototype.post = function(message) {
		FB.api(
		    "/me/feed",
		    "POST",
		    {
		        "message": message
		    },
		    function (response) {
		      if (response && !response.error) {
		        console.log(response)
		      }
		    }
		);
	};

	YoFace.prototype.query_friends = function(first_argument) {

		
		return new Promise (function (resolve, reject) {
			
			if (self.cache.news.length === 0) {				
				FB.api('/me/home', function(err, res) {
					if (err) reject(err);
				  	self.cache.news = res.data;
				  	resolve(self.cache.news.shift())
				});
			}

			else {
				resolve(self.cache.news.shift())
			}
		})
	};


	YoFace.prototype.like = function(postId) {
		var url = "/" + postId+"/likes"

		FB.api( url, "POST",
			function(response){
				if (response && !response.error) {
					console.log(response)
      			}	
			});
	};

	YoFace.prototype.comment = function(postId, message) {
		var url = "/" + postId + "/comments";

		FB.api( url, "POST",
			{ "message": message },
			function (response) {
				if (response && !response.error) {
					console.log(response);
				}
			}
		);
	}

	return new YoFace(fb);

})();
