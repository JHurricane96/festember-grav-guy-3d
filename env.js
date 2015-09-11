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

function Coin (position, size, zVel) {
	var coinGeo = new THREE.CylinderGeometry(
		size.r,
		size.r,
		size.t,
		32
	);
	var coinMaterial = new THREE.MeshPhongMaterial({
			"color": 0xAC872E,
			"transparent": true,
			"shininess": 100,
			"specular": 0xAC872E,
			// "metal": true,
	});
	coinMaterial.opacity = 0.8;
	this.cn = new THREE.Mesh(coinGeo, coinMaterial);
	this.cn.position.copy(position);
	this.size = size;
	this.velocity = new THREE.Vector3(0, 0, zVel);
	this.omega = config.coin.omega;
}

function generateCoins (type, coinsNo) {
	var coins = [];
	var coin;
	var size = {
		"r": config.coin.radius,
		"t": config.coin.thick
	};
	var position = new THREE.Vector3(0, 0, -config.los - size.t / 2);
	//Top right corner
	if (type < 1) {
		position.y = config.roomHeight / 2 - size.r;
		position.x = config.roomWidth / 2 - size.r;
	}
	//Bottom right corner
	else if (type < 2) {
		position.y = -config.roomHeight / 2 + size.r;
		position.x = config.roomWidth / 2 - size.r;
	}
	//Top left corner 
	else if (type < 3) {
		position.y = config.roomHeight / 2 - size.r;
		position.x = -config.roomWidth / 2 + size.r;
	}
	//Bottom left corner
	else if (type < 4) {
		position.y = -config.roomHeight / 2 + size.r;
		position.x = -config.roomWidth / 2 + size.r;
	}
	for (var i = 0; i < coinsNo; ++i) {
		coin = new Coin(position, size, config.zVel);
		coin.cn.rotation.x = Math.PI / 2;
		coin.cn.rotation.z = Math.random() * Math.PI;
		coins.push(coin);
		position.z -= config.coin.distBetween;
	}
	return coins;
}