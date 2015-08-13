var con = document.getElementById("con");
var prevTime;

function Game () {
	this.renderer = new THREE.WebGLRenderer({"antialias": true});
	this.renderer.shadowMapEnabled = true;
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
	this.light = new THREE.PointLight(0xFFFFFF, 1, config.los);
	this.light.position.set(0, 0, -60);
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
	this.scene.add(this.player.box);
	this.gravity = new THREE.Vector3(0, -config.accelMag, 0);
	this.gravChange = false;
	this.curWallSet = 0;
}

Game.prototype.update = function () {
	//this.camera.position.y -= 15;
	//this.player.pl.position.y -= 15;
	//this.camera.rotation.z += 0.1;
	for (var wall in this.env) {
		if (this.env.hasOwnProperty(wall))
			this.env[wall].position.z += config.zVel;
	}
	this.player.velocity.add(this.gravity);
	this.player.pl.position.add(this.player.velocity);
	this.player.checkCollide(this.gravity, this.gravChange);
	this.camera.position.copy(this.player.pl.position);
	this.camera.position.z += config.cameraPos;
	//this.camera.position.y += 100;
	this.light.position.copy(this.player.pl.position);
	this.light.position.z += config.lightPos;
	this.gravChange = false;
	if (this.env["leftWall" + this.curWallSet].position.z + config.cameraLos >= config.roomDepth / 2) {
		console.log("end");
		this.env.wrapWalls(this.curWallSet);
		this.curWallSet = (this.curWallSet + 1) % 2;
	}
}

Game.prototype.changeGrav = function (event) {
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

Game.prototype.startEvents = function () {
	window.addEventListener("keydown", this.changeGrav.bind(this));
}

var game = new Game();

function mainLoop (curTime) {
	game.update();
	requestAnimationFrame(mainLoop);
	game.renderer.render(game.scene, game.camera);
}

function main () {
	game.startEvents();
	requestAnimationFrame(mainLoop);
}

window.onload = main;