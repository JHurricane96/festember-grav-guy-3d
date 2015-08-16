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
	this.zVel = config.zVelInit;
	this.timeFactor = 15;
}

Game.prototype.playerBlockCollideCheck = function () {
	var plPos = this.player.pl.position;
	var plSize = this.player.size;
	var enemyPos, enemySize;
	for (var i = 0; i < this.enemies.length; ++i) {
		enemyPos = this.enemies[i].en.position;
		enemySize = this.enemies[i].size;
		if (Math.abs(plPos.x - enemyPos.x) <= plSize/2 + enemySize.x/2) {
			if (Math.abs(plPos.y - enemyPos.y) <= plSize/2 + enemySize.y/2) {
				if (Math.abs(plPos.z - enemyPos.z) <= plSize/2 + enemySize.z/2) {
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
		var enemyType = Math.random() * 4;
		var enemyX = 0, enemyY = 0;
		var enemySize = {
			"z": 200
		}
		if (enemyType < 1) {
			enemySize.x = config.roomWidth / 2;
			enemySize.y = config.roomHeight;
			enemyX = -config.roomWidth / 2 + enemySize.x / 2;
		}
		else if (enemyType < 2) {
			enemySize.x = config.roomWidth / 2;
			enemySize.y = config.roomHeight;
			enemyX = config.roomWidth / 2 - enemySize.x / 2;
		}
		else if (enemyType < 3) {
			enemySize.x = config.roomWidth;
			enemySize.y = config.roomHeight / 2;
			enemyY = config.roomHeight / 2 - enemySize.y / 2;
		}
		else {
			enemySize.x = config.roomWidth;
			enemySize.y = config.roomHeight / 2;
			enemyY = -config.roomHeight / 2 + enemySize.y / 2;
		}
		enemy = new Enemy(
			new THREE.Vector3(
				enemyX,
				enemyY,
				-config.los - enemySize.z / 2
			),
			{
				"x": enemySize.x,
				"y": enemySize.y,
				"z": enemySize.z
			},
			this.zVel
		);
		this.enemies.push(enemy);
		this.enemyGenDist = config.enemyGenDist;
		this.scene.add(enemy.en);
	}
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.env[wall].position.z += this.zVel * t;
	}
	tempVector.copy(this.gravity);
	tempVector.multiplyScalar(t);
	this.player.velocity.add(tempVector);
	tempVector.copy(this.player.velocity);
	tempVector.multiplyScalar(t);
	this.player.pl.position.add(tempVector);
	this.player.checkCollide(this.gravity, this.gravChange);
	this.camera.position.copy(this.player.pl.position);
	this.camera.position.z += config.cameraPos;
	this.camera.position.y += 50;
	if (this.camera.position.y + this.player.size + 40 > config.roomHeight / 2)
		this.camera.position.y = config.roomHeight / 2 - this.player.size - 40;
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
		tempVector.copy(enemy.velocity);
		tempVector.multiplyScalar(t);
		enemy.en.position.add(tempVector);
	}
	for (i = toDelete.length - 1; i >= 0; --i) {
		this.enemies.splice(this.enemies[i], 1);
	}
	this.enemyGenDist -= this.zVel * t;
	this.gravChange = false;
	if (this.env["leftWall" + this.curWallSet].position.z + config.cameraLos >= config.roomDepth / 2) {
		this.env.wrapWalls(this.curWallSet);
		this.curWallSet = (this.curWallSet + 1) % 2;
	}
}

Game.prototype.onKeyDown = function (event) {
	if (event.keyCode == 37) {
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

Game.prototype.windowResize = function () {
	this.camera.aspect = window.innerWidth / window.innerHeight;
	this.camera.updateProjectionMatrix();
	this.renderer.setSize(window.innerWidth, window.innerHeight);
}

Game.prototype.startEvents = function () {
	window.addEventListener("keydown", this.onKeyDown.bind(this));
	window.addEventListener("resize", this.windowResize.bind(this));
}

var game = new Game();

function mainLoop (curTime) {
	if (game.lost)
		return;
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