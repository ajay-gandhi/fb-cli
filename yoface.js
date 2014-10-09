'use strict';
var Promise   = require('es6-promise').Promise,
    fileUtils = require('./file_utils.js'),
    ascii     = require('./ascii/ascii.js');

/**
 * YoFace
 * A wrapper around the Javascript Facebook SDK. Queries Facebook, and returns
 * promises. Resolves with promised data ready for display. Handles as many
 * errors as possible.
 */

module.exports = (function() {
    /**
     * Initializes yo facebook object, dawg
     * @param [Object] fb - A facebook SDK object to be used for all operations
     */
    function YoFace(fb) {
        this.FB = fb;
        // Cache of newsfeed items
        this.cache = {
            news: [],
            news_next: null
        };
    }

    /**
     * Returns a promise for the next news feed element in the user's newsfeed
     * @return [Promise] Resolves to the next item in the user's newsfeed
     */
    YoFace.prototype.nextNews = function() {
      var self = this;
      var cacheImgPath = '/cache.png';

      return new Promise(function(resolve, reject) {

        // If the newsfeed cache is empty, the next 'page' of items must be loaded
        if (self.cache.news.length === 0) {

          // Cache is empty, load new stuff
          console.log('Loading...');

          var feed_url = self.cache.news_next ? self.cache.news_next : '/me/home';
          // Query Graph API
          self.FB.api(feed_url, function(err, res) {
            if (err) reject(err);

            // Add next page to the cache, for later
            if (res.paging.next) self.cache.news_next = res.paging.next;

            // Store current page of items
            self.cache.news = res.data;
            var nextItem = self.cache.news.shift();

            // Remove the loading indicator and an extra line
            process.stdout.write('\u001B[1A\u001B[2K');

            // Grab and asciify the picture if one exists
            var url = nextItem.picture;
            if (url !== undefined) {
              // Delete old image
              fileUtils.delete(cacheImgPath, function(error) {
                console.log(error);
              });
              // Download new image and asciify
              console.log();
              fileUtils.download(url, cacheImgPath, function() {
                ascii(fileUtils.falafelHouse + cacheImgPath)
                  .then(function(output) {
                    console.log(output);
                  })
                  .catch(function() {});
              });
            }

            // Set the possible allowed actions on this post
            var allowedActions = [];
            if (nextItem.link) allowedActions.push('o');
            nextItem.allowedActions = allowedActions;
            resolve(nextItem);
          });
        } else {
          var nextItem = self.cache.news.shift();

          // Grab and asciify the picture if one exists
          var url = nextItem.picture;
          if (url !== undefined) {
            // Delete old image
            fileUtils.delete(cacheImgPath, function(error) {
                console.log(error);
            });
            // Download new image and asciify
            fileUtils.download(url, cacheImgPath, function() {
              ascii(fileUtils.falafelHouse + cacheImgPath)
                .then(function(output) {
                    console.log(output);
                })
                .catch(function() {});
            });
          }

          // Set the possible allowed actions on this post
          var allowedActions = [];
          if (nextItem.link) allowedActions.push('o');
          nextItem.allowedActions = allowedActions;
          resolve(nextItem);
        }
      });
    };

    /**
     * Posts a message as a status update
     * @param [string] message - The status message to post
     * @param [function] callback - A function to call after
     *   successfully posting the status
     */
    YoFace.prototype.post = function(message, callback) {
      var self = this;

      // Empty message, do nothing
      if (message === '') return false;
      self.FB.api(
        '/me/feed',
        'POST', {
          'message': message
        },
        function(response) {
          if (response && response.result && response.result.error) {
            if (response.result.error.type == 'OAuthException') {
              console.log('I don\'t have permission to post that' +
                ' - did you give me permission to post for you?');
            } else {
              console.log('Error while posting.');
              console.error(response.result.error);
            }
          } else {
            // Successful post
            callback();
          }
        }
      );
    };

    /**
     * Likes a post
     * @param [int] postId - The ID of the post to like
     * @param [function] callback - The function to call after
     *   successfully liking the post
     */
    YoFace.prototype.like = function(postId, callback) {
      var self = this;
      var url = '/' + postId + '/likes';
      self.FB.api(
        url,
        'POST',
        function(response) {
          if (response && response.result && response.result.error) {
            if (response.result.error.type == 'OAuthException') {
              console.log('You don\'t have permission to like that post' +
                ' - did you give me permission to post for you?');
            } else {
              console.log('Error while liking');
              console.error(response.result.error);
            }
          } else {
            // Successful like
            callback();
          }
        }
      );
    };

    /**
     * Comments on a post.
     * @param [int]    postId  - The ID of the post to comment on
     * @param [string] message - The message to post as a comment
     * @param [function] callback - The function to call after
     *   successfully commenting
     */
    YoFace.prototype.comment = function(postId, message, callback) {
      var self = this;
      var url = '/' + postId + '/comments';
      self.FB.api(
        url,
        'POST', {
          'message': message
        },
        function(response) {
          if (response && response.result && response.result.error) {
            if (response.result.error.type == 'OAuthException') {
              console.log('You don\'t have permission to comment on that post' +
                ' - did you give me permission to post for you?');
            } else {
              console.log('Error while commenting.');
              console.error(response.result.error);
            }
          } else {
            // Successful comment
            callback();
          }
        }
      );
    };

    return YoFace;

})();
