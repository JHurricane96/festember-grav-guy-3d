function Enemy (position, size, zVel, type) {
	this.size = size;
	var cubeGeo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
	var material = new THREE.MeshPhongMaterial({"color": 0x00FFFF, "transparent": true});
	material.opacity = 0.6;
	this.en = new THREE.Mesh(cubeGeo, material);
	this.en.position.copy(position);
	if (type == "tiltRight") {
		this.en.rotation.z = Math.atan(-config.roomHeight / config.roomWidth);
		this.axis = new THREE.Vector3(-config.roomWidth, config.roomHeight, 0);
	}
	else if (type == "tiltLeft") {
		this.en.rotation.z = Math.atan(config.roomHeight / config.roomWidth);
		this.axis = new THREE.Vector3(config.roomWidth, config.roomHeight, 0);
	}
	this.velocity = new THREE.Vector3(0, 0, zVel);
	this.type = type;
}

function generateEnemy (enemyType) {
	var enemy;
	var enemyX = 0, enemyY = 0;
	var enemyTypeString;
	var enemySize = {
		"z": 200
	}
	//Left Block
	if (enemyType < 1) {
		enemySize.x = config.roomWidth / 2;
		enemySize.y = config.roomHeight;
		enemyX = -config.roomWidth / 2 + enemySize.x / 2;
		enemyTypeString = "normal";
	}
	//Right Block
	else if (enemyType < 2) {
		enemySize.x = config.roomWidth / 2;
		enemySize.y = config.roomHeight;
		enemyX = config.roomWidth / 2 - enemySize.x / 2;
		enemyTypeString = "normal";
	}
	//Up Block
	else if (enemyType < 3) {
		enemySize.x = config.roomWidth;
		enemySize.y = config.roomHeight / 2;
		enemyY = config.roomHeight / 2 - enemySize.y / 2;
		enemyTypeString = "normal";
	}
	//Down Block
	else if (enemyType < 4) {
		enemySize.x = config.roomWidth;
		enemySize.y = config.roomHeight / 2;
		enemyY = -config.roomHeight / 2 + enemySize.y / 2;
		enemyTypeString = "normal";
	}
	//Top right to bottom left corner
	else if (enemyType < 5) {
		enemySize.x = config.roomWidth * 2;
		enemySize.y = config.roomHeight;
		enemyTypeString = "tiltLeft";
	}
	else {
		enemySize.x = config.roomWidth * 2;
		enemySize.y = config.roomHeight;
		enemyTypeString = "tiltRight";
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
		config.zVel,
		enemyTypeString
	);
	return enemy;
}