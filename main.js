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
		20000
	);
	this.camera.position.set(0, 0, 0);
	this.roof = env.roof;
	this.floor = env.floor;
	this.leftWall = env.leftWall;
	this.rightWall = env.rightWall;
	this.player = new Player();
	this.light = new THREE.PointLight(0xFFFFFF, 1, 5000);
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
	this.scene.add(this.roof);
	this.scene.add(this.floor);
	this.scene.add(this.leftWall);
	this.scene.add(this.rightWall);
	this.scene.add(this.player.pl);
	//this.scene.add(this.player.box);
	this.gravity = new THREE.Vector3(0, -config.accelMag, 0);
	this.gravChange = false;
}

Game.prototype.update = function () {
	//this.camera.position.y -= 15;
	//this.player.pl.position.y -= 15;
	//this.camera.rotation.z += 0.1;
	this.player.velocity.add(this.gravity);
	this.player.checkCollide(this.gravity, this.gravChange);
	this.player.pl.position.add(this.player.velocity);
	this.camera.position.copy(this.player.pl.position);
	this.camera.position.z += config.cameraPos;
	//this.camera.position.y += 100;
	this.light.position.copy(this.player.pl.position);
	this.light.position.z += config.lightPos;
	this.gravChange = false;
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