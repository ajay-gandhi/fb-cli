
// var express = require('express');
// var app = express();

// app.get('/hello.txt', function(req, res){
//   res.send('Hello World');
// });


// app.use(express.static(__dirname + '/do'));

// var server = app.listen(3000, function() {
//     console.log('Listening on port %d', server.address().port);
// });

'use strict';

var http = require('http'),
    fs = require('fs-extra'),
    url = require('url'),
    Promise = require('es6-promise').Promise;

module.exports = (function () {
	
	function WebHack () {}

	WebHack.prototype.showLogin = function() {
		var self = this;
		return new Promise(function (resolve, reject) {
			var server = http.createServer(function(req, res) {
				
				var url_parts = url.parse(req.url, true);
				var query = url_parts.query;

				console.log(query);

				if (Object.keys(query).length === 0) {
					var fileStream = fs.createReadStream('./do/login.html');
					fileStream.pipe(res);
				} else {
					server.close();
					fs.outputFile('authInfo.json', JSON.stringify(query), function(err) {
						if (err) {reject(err);}
						resolve(query);
					});
				}

			}).listen(3000);
			

			require('open')('http://localhost:3000/');
		});
	};

	return new WebHack();

})();





