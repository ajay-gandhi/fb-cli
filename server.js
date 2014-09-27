// var express = require('express');
// var app = express();

// app.get('/hello.txt', function(req, res){
//   res.send('Hello World');
// });


// app.use(express.static(__dirname + '/do'));

// var server = app.listen(3000, function() {
//     console.log('Listening on port %d', server.address().port);
// });


var http = require('http'),
    fs = require('fs-extra'),
    path = require('path'),
    url = require('url'),
    Promise = require('es6-promise').Promise;

module.exports = (function () {
	
	function WebHack () {
		this.server = http.createServer(function(req, res) {
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;

			console.log(query);

			if (Object.keys(query).length === 0) {
				var fileStream = fs.createReadStream('./do/login.html');
				fileStream.pipe(res);
			} else {
				handleInfo(query)
				this.server.close();
			}

		}).listen(3000);
	}


	WebHack.prototype.showLogin = function() {
		require('open')('localhost:3000');
	};


	var handleInfo = function (info) {
		return new Promise(function (resolve, reject) {
			outputFile('authInfo.json', JSON.stringify(info), function(err) {
				if (err) reject(err)
				resolve(info)
			}
		});
	}

	return new WebHack();

})();





