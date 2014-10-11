'use strict';
module.exports = (function () {

    var browser;
    
    /**
     * @param {[type]} zombie An instance of Zombie already logged-in to 
     *                        facebook.
     */
    function CrazyCat (zombie) {
        browser = zombie;
    }


    /**
     * Pokes the closest match to the provided pokee by logging in to Facebook with
     *   provided credentials. Runs callback() after a successful poke.
     * @param [string] pokee - The name of the person to poke
     * @param [Object] credentials - An object containing the email and password
     *   (those exact property names) of the user in order to login to Facebook
     * @param [function] callback - A function to call after the person is poked
     */
    CrazyCat.prototype.poke = function(pokee, callback) {
      // Load mobile site because fewer JS hacks, easier to find poke button
      browser.visit('http://m.facebook.com/', function () {

          // Search for pokee
          browser.fill('query', pokee);
          browser.pressButton('div#header input[type=submit]', function() {

            // Assume first result is correct
            var firstResult = browser.text('div#objects_container tr:nth-child(1) a[class=""]');

            // Visit their profile
            browser.clickLink(firstResult, function() {
              // There's a poke button on mobile! :o
              browser.clickLink('Poke', function() {
                if (callback) {
                  callback(firstResult);
                }
              });
            });
        });
      });
    };

    return CrazyCat;
})();