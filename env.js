// var envTexture = THREE.ImageUtils.loadTexture("images.jpg");

//The worst code ever written
function Environment () {
	var roofCeilingGeo = new THREE.PlaneBufferGeometry(config.roomWidth, config.roomDepth);
	var wallsGeo = new THREE.PlaneBufferGeometry(config.roomHeight, config.roomDepth);
	/*envTexture.wrapS = THREE.RepeatWrapping;
	envTexture.wrapT = THREE.RepeatWrapping;
	envTexture.repeat.set(1, config.roomDepth / 256);*/
	// var material = new THREE.MeshPhongMaterial({map: envTexture});
	var material = new THREE.MeshPhongMaterial({"color": 0xFFFFFF});
	this.floor0 = new THREE.Mesh(roofCeilingGeo, material);
	this.floor0.position.set(0, -config.roomHeight / 2, -config.roomDepth / 2);
	this.floor0.rotation.x = -Math.PI / 2;
	this.floor1 = new THREE.Mesh(roofCeilingGeo, material);
	this.floor1.position.set(0, -config.roomHeight / 2, -3 * config.roomDepth / 2);
	this.floor1.rotation.x = -Math.PI / 2;
	this.roof0 = new THREE.Mesh(roofCeilingGeo, material);
	this.roof0.rotation.x = Math.PI / 2;
	this.roof0.position.set(0, config.roomHeight / 2, -config.roomDepth / 2);
	this.roof1 = new THREE.Mesh(roofCeilingGeo, material);
	this.roof1.rotation.x = Math.PI / 2;
	this.roof1.position.set(0, config.roomHeight / 2, -3 * config.roomDepth / 2);
	this.leftWall0 = new THREE.Mesh(wallsGeo, material);
	this.leftWall0.rotation.y = Math.PI / 2;
	this.leftWall0.rotation.z = Math.PI / 2;
	this.leftWall0.position.set(-config.roomWidth / 2, 0, -config.roomDepth / 2);
	this.leftWall1 = new THREE.Mesh(wallsGeo, material);
	this.leftWall1.rotation.y = Math.PI / 2;
	this.leftWall1.rotation.z = Math.PI / 2;
	this.leftWall1.position.set(-config.roomWidth / 2, 0, -3 * config.roomDepth / 2);
	this.rightWall0 = new THREE.Mesh(wallsGeo, material);
	this.rightWall0.rotation.y = -Math.PI / 2;
	this.rightWall0.rotation.z = Math.PI / 2;
	this.rightWall0.position.set(config.roomWidth / 2, 0, -config.roomDepth / 2);
	this.rightWall1 = new THREE.Mesh(wallsGeo, material);
	this.rightWall1.rotation.y = -Math.PI / 2;
	this.rightWall1.rotation.z = Math.PI / 2;
	this.rightWall1.position.set(config.roomWidth / 2, 0, -3 * config.roomDepth / 2);
}
//Take a breath, it's all over

Environment.prototype.wrapWalls = function (curWallSet) {
	var z = this["floor" + ((+curWallSet + 1) % 2)].position.z;
	this["floor" + curWallSet].position.z = z - config.roomDepth;
	this["roof" + curWallSet].position.z =  z - config.roomDepth;
	this["leftWall" + curWallSet].position.z = z - config.roomDepth;
	this["rightWall" + curWallSet].position.z = z - config.roomDepth;
}

function makeBackWall () {
	var material = new THREE.MeshPhongMaterial({"color": 0x000000});
	var geometry = new THREE.PlaneBufferGeometry(config.roomWidth, config.roomHeight);
	var backWall = new THREE.Mesh(geometry, material);
	backWall.position.set(0, 0, -config.los);
	return backWall;
}