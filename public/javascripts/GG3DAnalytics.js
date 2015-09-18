var GG3DAnalytics = (function() {
	var url = "/analytics";		// the url to which the request would be made
	var startTime = 0;
	var env = [];		// each element will require 24 bits (20 for timestamp + 4 for enemy type)
	var reactions = [];	// each element will require 24 bits (20 for timestamp + 3 for key + 1 for laziness)
	var paused = false;
	var lastPause = 0;
	var pauseTime = 0;
	var finalScore = 0;

	// Format of the binary data:
	// Header	=>	Number of env-elements; Number of reaction elements; Final Score. 16+16+16 = 48 bits
	// 				^ Assumption: A game will not last more than 10 minutes.
	// 							  That means 60fps * 10*60 s = 36000 frames
	// 							  Easily covered in 16 bits
	// Next ENV_Elems * 24 bits will contain the env data.
	// The following bits will contain the reactions data
	// 
	// Total bytes required = 1/8 * (48 + env.length*24 + reactions.length*24)
	var buffer;

	function init(requrl) {
		startTime = Date.now();
		lastPause = Date.now();
		url = requrl;
		paused = false;
		env = [];
		reactions = [];
		finalScore = 0;
	}

	function pauseToggle() {
		if(paused) {
			pauseTime += Date.now() - lastPause;
			paused = false;
		}
		else {
			lastPause = Date.now();
			paused = true;
		}
	}

	function addEnemy(type) {
		var now = Date.now() - startTime - pauseTime;
		env.push( [now, Math.floor(type)] );
	}

	function addReaction(keycode, up) {
		var now = Date.now() - startTime - pauseTime;
		// 37: "left", 38: "up", 39: "right", 40: "down"
		switch(keycode) {
			// arrow keys
			case 37:
				reactions.push([now, 0]);
				break;
			case 38:
				reactions.push([now, 1]);
				break;
			case 39:
				reactions.push([now, 2]);
				break;
			case 40:
				reactions.push([now, 3]);
				break;

			// time slowing
			case 83:
				reactions.push([now, 4 + !!up]);	// 4 if keydown, 5 if keyup!
				break;
		}
	}

	function encode() {
		var bufferlen = Math.ceil( 1/8 * (48 + env.length*24 + reactions.length*24) );
		if(bufferlen & 1) bufferlen++;

		buffer = new ArrayBuffer(bufferlen);

		// add the header info.
		// number of elements in the env array
		var headerView = new Uint16Array(buffer);
		headerView[0] = env.length;
		headerView[1] = reactions.length;
		headerView[2] = finalScore;

		// add the env data. Each env data takes 24 bits
		// and use 8bit (unsigned) view to insert them in the buffer
		var envView = new Uint8Array(buffer);
		for(var i = 0, viewPos = 6; i < env.length; i++, viewPos+=3) {
			// Format: TTTT TTTT TTTT TTTT EEEE
			// T : Timestamp bit
			// E : Enemy type bit
			envView[viewPos] = (env[i][0] & (255 << 12)) >> 12;
			envView[viewPos+1] = (env[i][0] & (255 << 4)) >> 4;
			envView[viewPos+2] = ((env[i][0] & 15) << 4) | (env[i][1]);
		}

		// add the reactions data. 
		// use 8bit unsigned
		var reactionsView = new Uint8Array(buffer);
		var reactionsStartPos = 6 + env.length*3;
		for(var i = 0, rxnsPos = reactionsStartPos; i < reactions.length; i += 1, rxnsPos+=3) {
			// Format: TTTT TTTT TTTT TTTT TTTT KKK0
			// T : Timestamp bit
			// K : Key bit
			reactionsView[rxnsPos] = (reactions[i][0] & (255 << 12)) >> 12;
			reactionsView[rxnsPos+1] = (reactions[i][0] & (255 << 4)) >> 4;
			reactionsView[rxnsPos+2] = ((reactions[i][0] & 15) << 4) | (reactions[i][1]);
		}

		return buffer;
	}

	function send(score, id) {
		finalScore = score;
		encode();

		var xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.send(buffer);
	}

	return {
		init: init,
		addEnemy: addEnemy,
		addReaction: addReaction,
		pauseToggle: pauseToggle,
		send: send
	};

})();