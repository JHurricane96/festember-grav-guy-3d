var con = document.getElementById("con");
var startMenu = document.getElementById("start");
var restartMenu = document.getElementById("restart");
var pauseMenu = document.getElementById("pause");
var prevTime;

function Game () {
	this.renderer = new THREE.WebGLRenderer({"antialias": true});
	this.renderer.setClearColor(0xFFFFFF, 1);
	this.renderer.setSize(con.offsetWidth, con.offsetHeight);
	con.appendChild(this.renderer.domElement);
	this.scene = new THREE.Scene();
	this.camera = new THREE.PerspectiveCamera(
		114,
		con.offsetWidth / con.offsetHeight,
		1,
		config.cameraLos + 1000
	);
	this.camera.position.set(0, 0, -config.cameraPos);
	this.camera.rotation.z = Math.PI / 2;
	this.env = new Environment();
	this.light = new THREE.PointLight(0xFFFFFF, 1, config.los);
	this.light.position.set(0, 0, -60);
	this.lightAnim = null;
	this.player = new Player();
	this.coins = [];
	this.enemies = [];
	this.timeToSpeedUp = 0;
	this.powers = {
		keyPressed: {
			"timeSlow": false
		},
		fuel: {
			"timeSlow": 100
		},
		elt: {
			"timeSlow": document.querySelector("#time-icon"),
			"timeSlowFuel": document.querySelector("#time-icon .fuel-indicator")
		}
	}
	this.sounds = {
		"thud": new Audio("./audio/thud.mp3"),
		"coin": new Audio("./audio/coin.mp3"),
		"time": new Audio("./audio/time.mp3"),
		"grav": new Audio("./audio/grav.mp3"),
		"end": new Audio("./audio/boom.mp3"),
		"music": new Audio("./audio/back.mp3")
	};
	for (sound in this.sounds) {
		if (this.sounds.hasOwnProperty(sound)) {
			this.sounds[sound].load();
		}
	}
	this.sounds.thud.volume = 0.15;
	this.sounds.coin.volume = 0.25;
	this.sounds.time.volume = 0.4;
	this.sounds.grav.volume = 0.25;
	this.sounds.end.volume = 0.4;
	this.sounds.grav.playbackRate = 3.5;
	this.sounds.time.playbackRate = 4;
	this.sounds.end.playbackRate = 2;
	this.sounds.music.loop = true;
	this.sounds.music.play();
	this.scene.add(this.light);
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.scene.add(this.env[wall]);
	}
	this.backWall = makeBackWall();
	this.scene.add(this.backWall);
	this.scene.add(this.player.pl);
	this.gravity = new THREE.Vector3(0, -config.accelMag, 0);
	this.gravChange = false;
	this.curWallSet = 0;
	this.enemyGenDist = config.los;
	this.curEnemyTypes = 10;
	this.lost = false;
	this.zVel = config.zVel;
	this.timeFactor = config.startTimeFactor;
	this.paused = false;
	this.start = false;
	this.score = 0;
	this.scoreCard = document.getElementById("score");
}

Game.prototype.reInitialize = function () {
	this.env = new Environment();
	this.player = new Player();
	this.camera.rotation.set(0, 0, Math.PI / 2);
	this.camera.position.set(0, 0, -config.cameraPos);
	this.coins = [];
	this.enemies = [];
	clearInterval(this.lightAnim);
	this.light.color.setHex(0xFFFFFF);
	this.lightAnim = null;
	this.timeToSpeedUp = 0;
	this.powers = {
		keyPressed: {
			"timeSlow": false
		},
		fuel: {
			"timeSlow": 100
		},
		elt: {
			"timeSlow": document.querySelector("#time-icon"),
			"timeSlowFuel": document.querySelector("#time-icon .fuel-indicator")
		}
	}
	this.powers.elt.timeSlowFuel.style.width = "100%";
	this.powers.elt.timeSlow.className = this.powers.elt.timeSlow.className.replace(" active", "");
	this.sounds.grav.playbackRate = 3.5;
	this.sounds.music.playbackRate = 1;
	this.sounds.music.currentTime = 0;
	this.sounds.music.play();
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.scene.add(this.env[wall]);
	}
	this.scene.add(this.player.pl);
	this.gravity = new THREE.Vector3(0, -config.accelMag, 0);
	this.gravChange = false;
	this.curWallSet = 0;
	this.enemyGenDist = config.los;
	this.curEnemyTypes = 10;
	this.lost = false;
	this.timeFactor = config.startTimeFactor;
	this.paused = false;
	this.start = false;
	this.score = 0;
	this.scoreCard.innerHTML = "Hi !";
}

Game.prototype.playerBlockCollideCheck = function () {
	var plPos = this.player.pl.position;
	var plSize = this.player.size;
	var enemyPos, enemySize, enemyType, enemyAxis;
	var tempVector = new THREE.Vector3();
	for (var i = 0; i < this.enemies.length; ++i) {
		enemyPos = this.enemies[i].en.position;
		enemySize = this.enemies[i].size;
		enemyType = this.enemies[i].type;
		enemyAxis = this.enemies[i].axis;
		if (Math.abs(plPos.z - enemyPos.z) <= plSize/2 + enemySize.z/2) {
			if (/normal/.test(enemyType)) {
				if (Math.abs(plPos.y - enemyPos.y) <= plSize/2 + enemySize.y/2) {
					if (Math.abs(plPos.x - enemyPos.x) <= plSize/2 + enemySize.x/2) {
						this.lost = true;
						break;
					}
				}
			}
			else if (/tilt/.test(enemyType)) {
				var tempPlPos = new THREE.Vector3();
				tempPlPos.copy(plPos);
				tempPlPos.z = 0;
				tempVector.copy(tempPlPos);
				if ((enemyAxis.x < 0 && tempVector.x > 0) || (enemyAxis.x > 0 && tempVector.x < 0)) {
					enemyAxis.x = -enemyAxis.x;
					enemyAxis.y = -enemyAxis.y;
				}
				tempVector.projectOnVector(enemyAxis);
				tempVector = tempVector.sub(tempPlPos);
				if (tempVector.length() < plSize/2 * Math.sqrt(2) + enemySize.y/2) {
					this.lost = true;
					break;
				}
			}
		}
	}
	if (!this.lost)
		return false;
	return true;
}

Game.prototype.playerCoinCollideCheck = function (coin) {
	var plPos = this.player.pl.position;
	var plSize = this.player.size;
	if (Math.abs(coin.cn.position.z - plPos.z) <= plSize / 2 + coin.size.r) {
		if (Math.abs(coin.cn.position.y - plPos.y) <= plSize / 2 + coin.size.r) {
			if (Math.abs(coin.cn.position.x - plPos.x) <= plSize / 2 + coin.size.r) {
				return true;
			}
		}
	}
	return false;
}

Game.prototype.changeLights = function () {
	var lightCol = "";
	for (var i = 0; i < 3; ++i) {
		lightCol += Math.ceil(Math.random() * (parseInt("0xFF", 16) - parseInt("0x60", 16)) + parseInt("0x60", 16)).toString(16);
	}
	lightCol = new THREE.Color(parseInt(lightCol, 16));
	var startLightCol = this.light.color;
	if (this.lightAnim)
		clearInterval(this.lightAnim);
	this.lightAnim = animate(
		50,
		function (t) {
			return t;
		},
		3000,
		(function (x) {
			for (c in this.light.color) {
				if (this.light.color.hasOwnProperty(c)) {
					this.light.color[c] = startLightCol[c] + x * (lightCol[c] - startLightCol[c]);
				}
			}
		}).bind(this),
		(function(){return;}).bind(this)
	);
}

Game.prototype.update = function (timeDiff) {
	var enemy, coins;
	var toDelete = [];
	var t = timeDiff / this.timeFactor;
	if (this.powers.keyPressed.timeSlow) {
		if (!/active/.test(this.powers.elt.timeSlow.className))
			this.powers.elt.timeSlow.className += " active";
		if (this.powers.fuel.timeSlow > 0.0) {
			t /= config.timeSlowFactor;
			this.powers.fuel.timeSlow -= config.fuelConsumeRate.timeSlow;
			this.powers.elt.timeSlowFuel.style.width = this.powers.fuel.timeSlow + "%";
		}
	}
	else {
		if (this.powers.fuel.timeSlow < 100.0) {
			this.powers.fuel.timeSlow += config.fuelConsumeRate.timeSlow/5;
			this.powers.elt.timeSlowFuel.style.width = this.powers.fuel.timeSlow + "%";
		}
	}
	if (this.timeToSpeedUp > config.speedUpAfter) {
		this.timeToSpeedUp = 0;
		if (this.timeFactor > config.maxTimeFactor)
			this.timeFactor--;
		this.changeLights();
		if (this.curEnemyTypes < config.enemyTypesNo)
			this.curEnemyTypes += 2;
	}
	var tempVector = new THREE.Vector3(0, 0, 0);
	if (this.playerBlockCollideCheck()) {
		this.sounds.music.pause();
		this.sounds.end.play();
		this.light.color.setHex(0xFF0000);
		return;
	}
	if (this.enemyGenDist <= 0) {
		this.enemyGenDist = 0;
		var enemyType = Math.random() * this.curEnemyTypes;
		// var enemyType = 12;
		if (enemyType < 4) {
			coins = generateCoins(enemyType, config.coin.number);
			coins.forEach(function (coin) {
				this.coins.push(coin);
				this.scene.add(coin.cn);
			}, this);
			this.enemyGenDist += config.coin.number * config.coin.distBetween - config.enemyGenDist / 6;
		}
		else if (enemyType < 12) {
			enemy = generateOneEnemy(enemyType - 4);
			this.enemies.push(enemy);
			this.scene.add(enemy.en);
		}
		else if (enemyType < 14) {
			enemy = generateTwoEnemies(enemyType - 4);
			this.enemies.push(enemy[0], enemy[1]);
			this.scene.add(enemy[0].en);
			this.scene.add(enemy[1].en);
			this.enemyGenDist += enemy[0].size.z;
		}
		this.enemyGenDist += config.enemyGenDist;
	}
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.env[wall].position.z += this.zVel * t;
	}
	var i;
	for (i = 0; i < this.enemies.length; ++i) {
		enemy = this.enemies[i];
		if (enemy.en.position.z - enemy.size.z/2 >= 0)
			toDelete.push(i);
		enemy = this.enemies[i];
		if (enemy.type == "normalMoveVer")
			enemy.checkCollideWithEnvY();
		else if (enemy.type == "normalMoveHrz")
			enemy.checkCollideWithEnvX();
		tempVector.copy(enemy.velocity);
		tempVector.multiplyScalar(t);
		enemy.en.position.add(tempVector);
	}
	for (i = toDelete.length - 1; i >= 0; --i) {
		this.scene.remove(this.enemies[i].en);
		this.enemies.splice(this.enemies[i], 1);
	}
	toDelete = [];
	for (i = 0; i < this.coins.length; ++i) {
		coin = this.coins[i];
		if (this.playerCoinCollideCheck(coin)) {
			this.sounds.coin.currentTime = 0;
			this.sounds.coin.play();
			toDelete.push(i);
			this.score += config.zVel * t * config.coin.scoreMult;
		}
		else if (coin.cn.position.z - coin.size.t / 2 >= 0)
			toDelete.push(i);
		coin.cn.position.z += coin.velocity.z * t;
		coin.cn.rotation.z += coin.omega * t;
	}
	for (i = toDelete.length - 1; i >= 0; --i) {
		this.scene.remove(this.coins[i].cn);
		this.coins.splice(i, 1);
	}
	this.enemyGenDist -= this.zVel * t;
	if (this.env["leftWall" + this.curWallSet].position.z - config.cameraLos >= config.roomDepth / 2) {
		this.env.wrapWalls(this.curWallSet);
		this.curWallSet = (this.curWallSet + 1) % 2;
	}
	if (this.powers.keyPressed.timeSlow && this.powers.fuel.timeSlow > 0) {
		tempVector.copy(this.gravity);
		tempVector.multiplyScalar(t * config.timeSlowFactor/2);
		this.player.velocity.add(tempVector);
		tempVector.copy(this.player.velocity);
		tempVector.multiplyScalar(t * config.timeSlowFactor/2);
		this.player.pl.position.add(tempVector);
	}
	else {
		tempVector.copy(this.gravity);
		tempVector.multiplyScalar(t);
		this.player.velocity.add(tempVector);
		tempVector.copy(this.player.velocity);
		tempVector.multiplyScalar(t);
		this.player.pl.position.add(tempVector);
	}
	if (this.powers.keyPressed.timeSlow && this.powers.fuel.timeSlow > 0) {
		if (this.player.checkCollide(this.gravity, this.gravChange, t * config.timeSlowFactor))
			this.sounds.thud.play();
	}
	else if (this.player.checkCollide(this.gravity, this.gravChange, t)) {
		this.sounds.thud.currentTime = 0;
		this.sounds.thud.play();
	}
	this.gravChange = false;
	this.camera.position.copy(this.player.pl.position);
	this.camera.position.z += config.cameraPos;
	this.camera.position.y /= ((config.roomHeight - this.player.size) / (config.roomHeight - this.player.size*3));
	this.score += config.zVel * t;
	this.scoreCard.innerHTML = Math.floor(this.score / config.scoreFactor);
	this.camera.rotation.z = (config.roomHeight/2 - this.player.size/2 + this.player.pl.position.y) / (config.roomHeight - this.player.size) * Math.PI;
}

Game.prototype.startEvents = function () {
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}

Game.prototype.stopEvents = function () {
	window.removeEventListener("keydown", onKeyDown);
	window.removeEventListener("keyup", onKeyUp);
}

Game.prototype.cleanup = function () {
	console.log("So long, suckah!");
	this.enemies.forEach(function (enemy) {
		this.scene.remove(enemy.en);
	}, this);
	this.coins.forEach(function (coin) {
		this.scene.remove(coin.cn);
	}, this);
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.scene.remove(this.env[wall]);
	}
	this.scene.remove(this.player.pl);
	this.stopEvents();
	window.removeEventListener("keydown", pauseToggle);
	restartMenu.style.display = "block";
	window.addEventListener("keydown", restartGame);
}

function startGame (event) {
	if (event.keyCode == 32) {
		window.removeEventListener("keydown", startGame);
		window.addEventListener("keydown", pauseToggle);
		game.startEvents();
		startMenu.style.display = "none";
		requestAnimationFrame(mainLoop);
	}
}

function restartGame (event) {
	if (event.keyCode == 32) {
		window.removeEventListener("keydown", restartGame);
		restartMenu.style.display = "none";
		game.reInitialize();
		main();
	}
}

var game = new Game();

function mainLoop (curTime) {
	if (game.lost) {
		game.cleanup();
		return;
	}
	if (!prevTime)
		prevTime = curTime;
	var t = Math.min(curTime - prevTime, 100);
	if (game.paused) {
		requestAnimationFrame(mainLoop);
		return;
	}
	game.timeToSpeedUp += t;
	game.update(t);
	requestAnimationFrame(mainLoop);
	game.renderer.render(game.scene, game.camera);
	prevTime = curTime;
}

function main () {
	windowResize();
	window.addEventListener("resize", windowResize);
	game.renderer.render(game.scene, game.camera);
	startMenu.style.display = "block";
	prevTime = undefined;
	window.addEventListener("keydown", startGame);
}

function onKeyDown (event) {
	//S key
	if (event.keyCode == 83) {
		if (!game.powers.keyPressed.timeSlow) {
			game.sounds.time.currentTime = 0;
			game.sounds.time.play();
		}
		game.powers.keyPressed.timeSlow = true;
		game.sounds.music.pause();
		// game.sounds.music.playbackRate = 0.5;
		game.sounds.grav.playbackRate = 1;
	}
	if (event.keyCode > 36 && event.keyCode < 41) {
		game.sounds.grav.currentTime = 0;
		game.sounds.grav.play();
	}
	//Left arrow key
	if (event.keyCode == 37) {
		event.preventDefault();
		if (game.gravity.y < 0)
			game.gravity.x = -config.accelMag;
		else
			game.gravity.x = config.accelMag;
		game.gravChange = true;
	}
	//Up arrow key
	else if (event.keyCode == 38) {
		event.preventDefault();
		if (game.gravity.y < 0)
			game.gravity.y = config.accelMag;
		else
			game.gravity.y = -config.accelMag;
		game.gravChange = true;
	}
	//Right arrow key
	else if (event.keyCode == 39) {
		event.preventDefault();
		if (game.gravity.y < 0)
			game.gravity.x = config.accelMag;
		else
			game.gravity.x = -config.accelMag
		game.gravChange = true;
	}
	//Down arrow key
	else if (event.keyCode == 40) {
		event.preventDefault();
		if (game.gravity.y < 0)
			game.gravity.y = -config.accelMag;
		else
			game.gravity.y = config.accelMag
		game.gravChange = true;
	}
}

function onKeyUp (event) {
	if (event.keyCode == 83) {
		// game.sounds.music.playbackRate = 1;
		game.sounds.music.play();
		game.sounds.grav.playbackRate = 3.5;
		game.powers.keyPressed.timeSlow = false;
		game.powers.elt.timeSlow.className = game.powers.elt.timeSlow.className.replace(" active", "");
	}
}

function pauseToggle (event) {
	if (event.keyCode == 27) {
		if (game.paused) {
			game.paused = false;
			pauseMenu.style.display = "none";
			game.startEvents();
			game.sounds.music.play();
		}
		else {
			game.stopEvents();
			onKeyUp({"keyCode": 83});
			pauseMenu.style.display = "block";
			game.sounds.music.pause();
			game.paused = true;
		}
	}
}

function windowResize () {
	game.camera.aspect = window.innerWidth / window.innerHeight;
	game.camera.updateProjectionMatrix();
	game.renderer.setSize(window.innerWidth, window.innerHeight);
	if (game.paused)
		game.renderer.render(game.scene, game.camera);
}

window.onload = main;