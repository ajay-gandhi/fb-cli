// unused
module.exports = (function () {

	var config = require('./config.json');
	var authInfo;

	function ActualFacebook(cfg) {
		
		// Try to retrive authentication information.
		try {
		  authInfo = require('./authInfo');
		  if (!authInfo.accessToken) throw new Error();
		}
		
		// No token available. Log the user in.
		catch (e) {
		    console.log('Looks like you have to login.');
		    var hack = require('./server');
		    return hack.showLogin().then(init).catch(reject);
		}

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

	return ActualFacebook
})();