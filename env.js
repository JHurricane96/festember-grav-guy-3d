var envTexture = THREE.ImageUtils.loadTexture("tile.jpg");

//The worst code ever written
function Environment () {
	var roofCeilingGeo = new THREE.PlaneBufferGeometry(config.roomWidth, config.roomDepth);
	var wallsGeo = new THREE.PlaneBufferGeometry(config.roomHeight, config.roomDepth);
	//var envTexture = THREE.ImageUtils.loadTexture("tile.jpg");
	envTexture.wrapS = THREE.RepeatWrapping;
	envTexture.wrapT = THREE.RepeatWrapping;
	envTexture.repeat.set(2, 0.1);
	var material = new THREE.MeshPhongMaterial({map: envTexture});
	//var material = new THREE.MeshBasicMaterial({"wireframe": true});
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

Environment.prototype.wrapWalls = function (curWallSet) {
	this["floor" + curWallSet].position.z = -config.roomDepth / 2;
	this["roof" + curWallSet].position.z =  -config.roomDepth / 2;
	this["leftWall" + curWallSet].position.z = -config.roomDepth / 2;
	this["rightWall" + curWallSet].position.z = -config.roomDepth / 2;

}

function makeBackWall () {
	var material = new THREE.MeshPhongMaterial({"color": 0x000000});
	var geometry = new THREE.PlaneBufferGeometry(config.roomWidth, config.roomHeight);
	var backWall = new THREE.Mesh(geometry, material);
	backWall.position.set(0, 0, -config.los);
	return backWall;
}
//Take a breath, it's all over