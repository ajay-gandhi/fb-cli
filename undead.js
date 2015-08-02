'use strict';

var Promise = require('es6-promise').Promise,
    Zombie  = require('zombie');

/**
 * Undead
 *
 * Wraps a headless browser to do all Facebook things (access newsfeed, pokes)
 */

module.exports = (function () {
    /**
     * Creates an Undead facebook object
     */
    function Undead() {
        this.browser      = new Zombie();
        this.home         = 'http://m.facebook.com/';
        this.posts_cache  = [];
    }

    /**
     * Initializes the Undead object by visiting Facebook and logging in
     *
     * @param [string] username - The Facebook username
     * @param [string] password - The Facebook password
     *
     * @returns [Promise] A Promise that is resolved once the browser is logged
     *   in. The Promise is rejected if the login failed.
     */
    Undead.prototype.init = function (username, password) {
      var self    = this,
          browser = self.browser;

      return new Promise(function (resolve, reject) {
        browser
          .visit(self.home)
          .then(function () {

            // Fill out email and pw
            browser.fill('email', username);
            browser.fill('pass',  password);

            // Login to FB
            return browser.pressButton('Log In');
          })
          .then(function () {
            // Check if login was successful
            if (browser.text('title') === 'Facebook')
              resolve(self);
            else
              reject();
          });
      });
    }

    /**
     * Posts a message as a status update
     * 
     * @param [string] message - The status message to post
     *
     * @returns [Promise] A Promise that is resolved once the message is posted
     *   The Promise is rejected if an error occurs.
     */
    Undead.prototype.post = function(message) {
      var self    = this,
          browser = self.browser;

      return new Promise(function (resolve, reject) {
        // Open new tab, then post
        var textareas = browser.queryAll('textarea');

        for (var i = 0; i < textareas.length; i++) {
          if (textareas[i].getAttribute('name') === 'xc_message') {
            browser.fill(textareas[i], message);
          }
        }

        browser
          .pressButton('Post')
          .then(function () {
            resolve();
          })
          .catch(function (e) {
            reject(e);
          });
      });
    }

    /**
     * Returns a promise for the next news feed element in the user's newsfeed
     *
     * @return [Promise] Resolves to the next item in the user's newsfeed. The
     *   Promise also contains links to Like and Comment on the post.
     */
    Undead.prototype.nextNews = function(message) {
      var self    = this,
          browser = self.browser;

      return new Promise(function (resolve, reject) {
        // See if posts are cached
        if (self.posts_cache.length == 0) {
          // Ensure original tab
          browser.tabs.current = 0;

          // Click "See More Stories"
          browser
            .clickLink('See More Stories')
            .then(function () {

              var divs = browser.queryAll('div');

              var posts = [];
              divs.forEach(function (div) {
                // Only put posts in posts cache
                if (div.id.trim().indexOf('u_0_') == 0)
                  posts.push(explode(div));
              });

              // Save all posts
              self.posts_cache = posts;

              resolve(self.posts_cache.pop());
            });

        } else {

          // Posts cache exists
          // Just pop one off cache
          resolve(self.posts_cache.pop());
        }
      });
    }

    /**
     * Likes a post in the user's newsfeed
     *
     * @param Object post - The post in the user's newsfeed (object returned
     *   from nextNews)
     *
     * @return [Promise] Resolves when the like is finished, rejects if an error
     *   occurred.
     */
    Undead.prototype.like = function(post) {
      var self    = this,
          browser = self.browser;

      return new Promise(function (resolve, reject) {
        // Just click the Like button
        // Set target to _blank so that new tab opens
        post.like.setAttribute('target', '_blank');

        browser
          .clickLink(post.like)
          .then(function () {
            // Close the new tab
            browser.tabs.current = browser.tabs.length - 1;
            browser.window.close();

            resolve();
          })
          .catch(function (e) {
            reject(e);
          });
      });
    }

    /**
     * Pokes the closest match to the provided pokee by logging in to Facebook
     *   with provided credentials
     *
     * @param [string] pokee - The name of the person to poke
     *
     * @returns [Promise] A Promise that is resolved once the pokee is poked
     *   The Promise is rejected if an error occurred.
     */
    Undead.prototype.poke = function (pokee) {
      var self    = this,
          browser = self.browser;

      return new Promise(function (resolve, reject) {
        // Search for pokee in new tab
        browser.open(self.home);

        browser
          .visit(self.home)
          .then(function () {
            browser.fill('query', pokee);
            return browser.pressButton('Search');
          })
          .then(function () {

            // Assume first result is correct
            var search_results_table = browser.queryAll('table')[1];
            var firstResult          = search_results_table.querySelector('a');

            // Visit their profile
            return browser.clickLink(firstResult);
          })
          .then(function () {
            // There's a poke link at the bottom
            return browser.clickLink('Poke');
          })
          .then(function () {
            // Close the new tab here
            browser.window.close();
            console.log(browser.tabs.index);

            resolve();
          })
          .catch(function (e) {
            reject(e);
          });
      });
    }

    return Undead;

})();

/**
 * Private function to expose the useful portions of a post and remove the rest
 *
 * @param Object element - The DOM element to explode
 *
 * @returns An object containing the useful portions of the post:
 *   Poster name
 *   Post content
 *   [Link]
 *   [Image]
 *   Link element for liking
 *   Link element for commenting
 */
var explode = function (element) {
  var return_obj = {};

  var content_div = element.children[0];

  return_obj.summary = content_div.children[0].textContent;
  // Sometimes summary is the entire post (e.g. likes, comments)
  if (content_div.children[1])
    return_obj.content = content_div.children[1].textContent;

  var meta_div = element.children[1];

  // Can get more data from second child
  var meta_links = meta_div.querySelectorAll('a');
  for (var i = 0; i < meta_links.length; i++) {

    if (meta_links[i].textContent === 'Like') {
      return_obj.like = meta_links[i];

    } else if (meta_links[i].textContent.indexOf('Comment') >= 0) {
      return_obj.comment = meta_links[i];

    }
    // Can get more links if necessary
  }

  return return_obj;
}
















