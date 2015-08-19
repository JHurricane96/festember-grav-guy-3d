var con = document.getElementById("con");
var prevTime;

function Game () {
	this.renderer = new THREE.WebGLRenderer({"antialias": true});
	//this.renderer.shadowMapEnabled = true;
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
	this.camera.position.set(0, 0, 0);
	this.env = new Environment();
	this.player = new Player();
	this.enemies = [];
	this.light = new THREE.PointLight(0xFFFFFF, 1, config.los);
	this.light.position.set(0, 0, -60);
	this.elapsedTime = 0;
/*	this.keyMap = {
		"timeSlow": false
	}*/
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
/*	this.fuel = {
		"timeSlow": 100
	};
	this.activePowers = {
		"timeSlow": false
	};*/
/*	this.light = new THREE.SpotLight( 0xFFFFFF, 1, 5000, Math.PI / 2);
	this.light.position.set( 0, 0, 0 );

	this.light.castShadow = true;

	this.light.shadowMapWidth = 1024;
	this.light.shadowMapHeight = 1024;

	this.light.shadowCameraNear = 1;
	this.light.shadowCameraFar = 5000;
	this.light.shadowCameraFov = 114;*/

	this.scene.add(this.light);
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.scene.add(this.env[wall]);
	}
	this.backWall = makeBackWall();
	this.scene.add(this.backWall);
	this.scene.add(this.player.pl);
	//this.scene.add(this.player.box);
	this.gravity = new THREE.Vector3(0, -config.accelMag, 0);
	this.gravChange = false;
	this.curWallSet = 0;
	this.enemyGenDist = config.los;
	this.lost = false;
	this.zVel = config.zVel;
	this.timeFactor = 10;
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
/*						this.camera.position.z = 0;
						this.camera.position.x = -(config.roomWidth / 2 + 100);
						this.camera.position.y = config.roomHeight / 2;
						this.camera.rotation.y = -Math.PI / 2;
						this.light.position.copy(this.camera.position);*/
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

Game.prototype.update = function (timeDiff) {
	var enemy;
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
	if(this.elapsedTime > config.speedUpAfter) {
		this.timeFactor--;
		this.elapsedTime = 0;
	}
	var tempVector = new THREE.Vector3(0, 0, 0);
	//this.camera.position.y -= 15;
	//this.player.pl.position.y -= 15;
	//this.camera.rotation.z += 0.1;
	if (this.playerBlockCollideCheck()) {
		this.light.color.setHex(0xFF0000);
		return;
	}
	if (this.enemyGenDist <= 0) {
		this.enemyGenDist = 0;
		var enemyType = Math.random() * 10;
		// var enemyType = 7;
		if (enemyType < 8) {
			enemy = generateOneEnemy(enemyType);
			this.enemies.push(enemy);
			this.scene.add(enemy.en);
		}
		else {
			enemy = generateTwoEnemies(enemyType);
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
	this.player.checkCollide(this.gravity, this.gravChange);
	this.camera.position.copy(this.player.pl.position);
	this.camera.position.z += config.cameraPos;
	this.camera.position.y /= ((config.roomHeight - this.player.size) / (config.roomHeight - this.player.size*3));
	this.light.position.copy(this.player.pl.position);
	this.light.position.z += config.lightPos;
	this.light.z = 0;
	this.light.position.y = 0;
	this.light.position.x = 0;
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
	this.enemyGenDist -= this.zVel * t;
	this.gravChange = false;
	if (this.env["leftWall" + this.curWallSet].position.z - config.cameraLos >= config.roomDepth / 2) {
		console.log(this.curWallSet);
		this.env.wrapWalls(this.curWallSet);
		this.curWallSet = (this.curWallSet + 1) % 2;
	}
}

Game.prototype.onKeyDown = function (event) {
	if (event.keyCode == 83) {
		this.powers.keyPressed.timeSlow = true;
	}
	else if (event.keyCode == 37) {
		event.preventDefault();
		this.gravity.x = -config.accelMag;
		this.gravChange = true;
	}
	else if (event.keyCode == 38) {
		event.preventDefault();
		this.gravity.y = config.accelMag;
		this.gravChange = true;
	}
	else if (event.keyCode == 39) {
		event.preventDefault();
		this.gravity.x = config.accelMag;
		this.gravChange = true;
	}
	else if (event.keyCode == 40) {
		event.preventDefault();
		this.gravity.y = -config.accelMag;
		this.gravChange = true;
	}
}

Game.prototype.onKeyUp = function (event) {
	if (event.keyCode == 83) {
		this.powers.keyPressed.timeSlow = false;
		this.powers.elt.timeSlow.className = this.powers.elt.timeSlow.className.replace(" active", "");
	}
}

Game.prototype.windowResize = function () {
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(window.innerWidth, window.innerHeight);
}

Game.prototype.startEvents = function () {
	window.addEventListener("keydown", this.onKeyDown.bind(this));
	window.addEventListener("keyup", this.onKeyUp.bind(this));
	window.addEventListener("resize", this.windowResize.bind(this));
}

Game.prototype.stopEvents = function () {
	window.removeEventListener("keydown", this.onKeyDown.bind(this));
	window.removeEventListener("keyup", this.onKeyUp.bind(this));
	window.removeEventListener("resize", this.windowResize.bind(this));
}

var game = new Game();

function mainLoop (curTime) {
	if (game.lost) {
		console.log("So long, suckah!");
		game.stopEvents();
		return;
	}
	if (!prevTime)
		prevTime = curTime;
	var t = curTime - prevTime;
	game.elapsedTime += t;
	game.update(t);
	requestAnimationFrame(mainLoop);
	game.renderer.render(game.scene, game.camera);
	prevTime = curTime;
}

function main () {
	game.windowResize();
	game.startEvents();
	requestAnimationFrame(mainLoop);
}

window.onload = main;