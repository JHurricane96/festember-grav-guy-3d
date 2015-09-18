var express = require('express');
var db_connect = require('../db_connect');
var router = express.Router();
var config = require('../config');

function decode(buffer) {
	var env = [];
	var reactions = [];

	var bufferlen = buffer.length; //Math.ceil( 1/8 * (48 + env.length*24 + reactions.length*24) )

	// get the header info.
	// number of elements in the env array
	var headerView = new Uint16Array(buffer);
	var envLength = headerView[0];
	var reactionsLength = headerView[1];
	var finalScore = headerView[2];

	// Each env data spreads over 3 envView elems
	// and use 8bit (unsigned) view to extract them from the buffer
	var envView = new Uint8Array(buffer);
	for(var i = 0, viewPos = 6; i < envLength; i+=1, viewPos+=3) {
		var timestamp = (envView[viewPos] << 12) | (envView[viewPos+1] << 4) | ((envView[viewPos+2] & (15 << 4)) >> 4);
		var type = (envView[viewPos+2] & 15);

		env.push([timestamp, type]);
	}

	// get the reactions data. 
	// use 8bit unsigned
	var reactionsView = new Uint8Array(buffer);
	var reactionsStartPos = 6 + env.length*3;
	for(var i = 0, rxnsPos = reactionsStartPos; i < reactionsLength; i += 1, rxnsPos+=3) {
		// Format: TTTT TTTT TTTT TTTT TTTT KKK0
		// T : Timestamp bit
		// K : Key bit

		var timestamp = (reactionsView[rxnsPos] << 12) | (reactionsView[rxnsPos+1] << 4) | ((reactionsView[rxnsPos+2] & (15 << 4)) >> 4);
		var key = (reactionsView[rxnsPos+2] & 15);

		reactions.push([timestamp, key]);
	}

	return {
		env: env,
		reactions: reactions,
		finalScore: finalScore
	};
}

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

router.post('/', function(req, res, next) {
	try {
		var ip = req.connection.remoteAddress;
		if(config.is_proxied)
			ip = req.headers['x-forwarded-for'];

		var buffer = Buffer.concat(req.rawBody);
		var arrbuffer = toArrayBuffer(buffer);

		var decoded = decode(arrbuffer);
		
		db_connect.reuse().then(function(db) {
			db.collection('analytics').insertOne({
				id: ip,
				data: decoded
			});
		}).catch(function(err) {
			console.log(err);
		});

		//console.log(decoded);
		//console.log(buffer.length);
		res.end();
	}
	catch(err) {
		console.log(err.stack);
	}
});

module.exports = router;
