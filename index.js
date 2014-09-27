
var config = {
	appID: '698243363597060', 
	secret: 'ed984e63cb8d378122fc5bd43dc962d6',
	token: 'CAAJ7DHOnawQBAA6AFS68RPaasmyRzbl9cyhiXHMLB6ZBMj4W4VdvrK06xa8BZCYOWDm1ZAE32hA6LfXn8SvPBjDOk9IGZAfIirLgpnArbvE70rgU9g2RM2RnjSdaqU57C9vEZApuueTPUUD5qDIkjo50hcjz9FZAnlEnnNFWDie1jZBZCQZBxRK6wcdmaZBispeZCZBh2zlZCfZAE1lQ6bw1Bhy70wD9jWIgPXjgsZD'
}

var Facebook = require('facebook-node-sdk');

// Connect to facebook
createFB = function(appId,secret,token) {
  return new Facebook({
    appID: appId,
    secret: secret
  }).setAccessToken(token);
};

var fb = createFB(config.appID, config.secret, config.token)


fb.api('/me', function(err, data) {
	console.log(err);
  	console.log(data); // => { id: ... }
});
