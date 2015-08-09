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
      // Do everything in new tab
      browser.open(self.home);

      browser
        .visit(self.home)
        .then(function () {

          // Open new tab, then post
          var textareas = browser.queryAll('textarea');

          for (var i = 0; i < textareas.length; i++) {
            if (textareas[i].getAttribute('name') === 'xc_message') {
              browser.fill(textareas[i], message);
            }
          }

          return browser.pressButton('Post');
        })
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

            // Save all posts
            self.posts_cache = create_cache(divs);

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
        .clickLink(post.like_link)
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
   * Comment on a post in the user's newsfeed
   *
   * @param Object post    - The post in the user's newsfeed (object returned
   *   from nextNews)
   * @param string comment - The content to post in the comment
   *
   * @return [Promise] Resolves when the comment is posted, rejects if an
   *   error occurred.
   */
  Undead.prototype.comment = function(post, comment) {
    var self    = this,
        browser = self.browser;

    return new Promise(function (resolve, reject) {
      // Just click the Like button
      // Set target to _blank so that new tab opens
      post.comment.setAttribute('target', '_blank');

      browser
        .clickLink(post.comment_link)
        .then(function () {
          browser.fill('comment_text', comment);
          return browser.pressButton('Comment');
        })
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

    var actual_poke_name;

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

          // Save who was actually poked
          actual_poke_name = firstResult.textContent;

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

          resolve(actual_poke_name);
        })
        .catch(function (e) {
          reject(e);
        });
    });
  }

  return Undead;

})();


/**
 * Private function to create posts cache from the set of divs, uses `explode`
 *
 * @param Array divs - The set of divs gathered from Zombie
 *
 * @returns Array The array of posts; each is an object returned from explode
 */
var create_cache = function (divs) {
  var posts = [];
  var is_subcontent = false;

  divs.forEach(function (div) {
    // Only put posts in posts cache, ignore suggested (mostly bc errors)
    if (div.id.trim().indexOf('u_0_') == 0 &&
        div.textContent.indexOf('Suggested Post') != 0) {

      if (is_subcontent) {
        // Just add sub object to previous post
        posts[posts.length - 1].subpost = explode(div).obj;
        is_subcontent = false;
      
      } else {
        // See if post has subcontent
        var post = explode(div);
        is_subcontent = post.has_sub;

        // Push onto cache
        posts.push(post.obj);
      }

    }
  });

  return posts;
}

/**
 * Private function to expose the useful portions of a post
 *
 * @param Object element - The DOM element to explode
 *
 * @returns An object containing the useful portions of the post:
 *   name
 *   summary
 *   content
 *     sub_name
 *     sub_summary
 *     sub_content
 *   like_message
 *   like_link
 *   comment_message
 *   comment_link
 */
var explode = function (element) {
  var return_obj = {};

  var content_div = element.children[0];

  return_obj.name = content_div.querySelector('a').textContent;
  return_obj.summary = content_div.children[0].textContent;

  // Don't want repeat content
  if (return_obj.name === return_obj.summary) delete return_obj.summary;

  // Sometimes summary is the entire post (e.g. likes, comments)
  if (content_div.children[1])
    return_obj.content = content_div.children[1].textContent;

  var second_div = element.children[1];

  // Can get more data from second child
  if (second_div) {

    // Second div is subcontent, ignore and set var
    if (second_div.id.trim().indexOf('u_0_') == 0) {
      var sub = true;

    // Second div is metadata
    } else {
      var sub = false;
      var meta_links = second_div.querySelectorAll('a');
      for (var i = 0; i < meta_links.length; i++) {
        var number_patt = /\d+/g,
            likes_patt  = /"\d+"/g;

        // Add like message
        if (likes_patt.test(meta_links[i].textContent)) {

          return_obj.like_message = meta_links[i].textContent;

        // Add like link
        } else if (meta_links[i].textContent === 'Like') {

          return_obj.like_link = meta_links[i];

        // Add comment link and message
        } else if (meta_links[i].textContent.indexOf('Comment') >= 0) {
          return_obj.comment_message = meta_links[i].textContent;

          // No message if no comments
          if (!number_patt.test(return_obj.comment_message))
            delete return_obj.comment_message;

          return_obj.comment_link = meta_links[i];

        }
        // Can get more links if necessary
      }
    }
  }

  return { obj: return_obj, has_sub: sub };
}
