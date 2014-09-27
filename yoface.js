var Promise = require('es6-promise').Promise;
var Facebook = require('facebook-node-sdk');


module.exports = (function () {

	////////////////

	var config = {
		appID: '698243363597060', 
		secret: 'ed984e63cb8d378122fc5bd43dc962d6',
		token: 'CAAJ7DHOnawQBAE57XZBQIKP5zk3oU8Kzng8DRv0YtKZBOJLAvZBUOScEIEZCWCqKSbCeU3VztztiWsRn21wpl4j2oaMWwBF1HDZAA2ZBHsFzD5Psb6bfA9EC3dNTtOtHD2D8XKEeq2NXCZALqMdKmjvuTLoKVq2tq4hoHjVJAuMIvEQEGtiVRiAgzt1tQ3bjDiEGAVKHUtZBaTo1W3xrmKtIHaYX0MwfwDUZD',
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

	var FB = new ActualFacebook(config);

	//////////////////
	///
	///
	///


	/**
	 * Initializes yo facebook object, dawg.
	 * @param {[type]} fb [description]
	 */
	function YoFace (fb) {
		this.FB = fb;
		this.cache = {
			news : [],
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
				// >> Add support for newsfeed pagination
				FB.api('/me/home', function(err, res) {
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


	YoFace.prototype.like = function(postId) {
		var url = "/" + postId+"/likes"

		FB.api(
			url,
			"POST",
			function(response){
				if (response && !response.error) {
					console.log(response)
      			}	
			}


		)
	};

	YoFace.prototype.comment = function(postId, message) {
		var url = "/" + postId + "/comments";

		FB.api(
			url,
			"POST",
			{
				"message": message
			},
			function (response) {
				if (response && !response.error) {
					console.log(response);
				}
			}
		);
	}

	return new YoFace(fb);

})();
