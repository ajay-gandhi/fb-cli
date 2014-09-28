var Promise = require('es6-promise').Promise,
    Facebook = require('facebook-node-sdk'),
    fileUtils = require('./file_utils.js'),
    readline = require('readline'),
    ascii = require('./ascii/ascii.js');

module.exports = (function () {

	var config = require('./config.json');
	var authInfo = require('./authInfo.json');

  /**
   * Creates a Facebook API object
   * @param [object] cfg - A config object containing a Facebook appID,
   *     app secret, and access token
   * @returns [Facebook] An instance of the Facebook API
   */
	function ActualFacebook (cfg) {
		createFB = function(appId, secret, token) {
		  return new Facebook({
		    appID: appId,
		    secret: secret
		  }).setAccessToken(token);
		};

		return fb = createFB(cfg.appID, cfg.secret, cfg.accessToken);
	}

  config.accessToken = authInfo.accessToken;
	var FB = new ActualFacebook(config);

	/**
	 * Initializes yo facebook object, dawg.
	 * @param {[type]} fb [description]
	 */
	function YoFace (fb) {
		this.FB = fb;
    // Cache of newsfeed items
		this.cache = {
			news : [],
			news_next : null
		}
	}

	/**
	 * Returns a promise for the next news feed element in the users' newsfeed
	 * @return {[type]} [description]
	 */
	YoFace.prototype.nextNews = function() {
		var self = this;

		return new Promise(function (resolve, reject) {

      // Check if there is anything in the newsfeed cache
			if (self.cache.news.length === 0) {
        // If cache is empty, load new items
				console.log('Loading...');
				var feed_url = self.cache.news_next ? self.cache.news_next : '/me/home';

        // Query Graph API
				FB.api(feed_url, function(err, res) {
					if (err) reject(err);
          // Add next page to the cache, for later
					if (res.paging.next) self.cache.news_next = res.paging.next;
          // Store current page of items
          self.cache.news = res.data;
          var nextItem = self.cache.news.shift();

          // Remove the loading indicator
          process.stdout.write('\u001B[1A\u001B[2K');

          var url = nextItem.picture;

          if (url != undefined) {
            // Delete old image
            fileUtils.delete('cache.jpg', function(error) {
              console.log(error);
            });
            // Download new image and asciify
            fileUtils.download(url, 'cache.jpg', function() {
              ascii('cache.jpg')
                .then(function(output) { console.log(output); })
                .catch(function() {});
            });
          }

			  	resolve(nextItem);
				});
			} else {
        var nextItem = self.cache.news.shift();

        var url = nextItem.picture;

        if (url != undefined) {
          // Delete old image
          fileUtils.delete('cache.jpg', function(error) {
            console.log(error);
          });
          // Download new image and asciify
          fileUtils.download(url, 'cache.jpg', function() {
            ascii('cache.jpg')
              .then(function(output) { console.log(output); })
              .catch(function() {});
          });

				resolve(nextItem);
			}
		})
	};

  /**
   * Posts a message as a status update
   * @param [string] message - The status message to post
   */
	YoFace.prototype.post = function(message) {
		FB.api(
		    "/me/feed",
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
	};

  /**
   * This isn't even used...guess it's for listing friends?
   */
	YoFace.prototype.query_friends = function(first_argument) {
		return new Promise (function (resolve, reject) {
  		if (self.cache.news.length === 0) {				
  			FB.api(
          '/me/home',
          function(err, res) {
  				if (err) reject(err);
  			  	self.cache.news = res.data;
  			  	resolve(self.cache.news.shift())
  			  }
        );
  		}	else {
  			resolve(self.cache.news.shift())
  		}
		});
	};

  /**
   * Likes a post
   * @param [int] postId - The ID of the post to like
   */
	YoFace.prototype.like = function(postId) {
		var url = "/" + postId + "/likes";
		FB.api(
      url,
      "POST",
			function(response) {
				if (response && !response.error) {
					console.log(response);
      	}	
			});
	};

  /**
   * Comments on a post
   * @param [int] postId - The ID of the post to comment on
   * @param [string] message - The message to post as a comment
   */
	YoFace.prototype.comment = function(postId, message) {
		var url = "/" + postId + "/comments";

		FB.api(
      url,
      "POST",
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
