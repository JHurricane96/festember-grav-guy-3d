function Enemy (position, size, zVel) {
	this.size = size;
	var cubeGeo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
	var material = new THREE.MeshPhongMaterial({"color": 0x00FFFF, "transparent": true});
	material.opacity = 0.6;
	this.en = new THREE.Mesh(cubeGeo, material);
	this.en.position.copy(position);
	this.velocity = new THREE.Vector3(0, 0, zVel);
}

function generateEnemy (enemyType) {
	var enemy;
	var enemyX = 0, enemyY = 0;
	var enemySize = {
		"z": 200
	}
	//Left Block
	if (enemyType < 1) {
		enemySize.x = config.roomWidth / 2;
		enemySize.y = config.roomHeight;
		enemyX = -config.roomWidth / 2 + enemySize.x / 2;
	}
	//Right Block
	else if (enemyType < 2) {
		enemySize.x = config.roomWidth / 2;
		enemySize.y = config.roomHeight;
		enemyX = config.roomWidth / 2 - enemySize.x / 2;
	}
	//Up Block
	else if (enemyType < 3) {
		enemySize.x = config.roomWidth;
		enemySize.y = config.roomHeight / 2;
		enemyY = config.roomHeight / 2 - enemySize.y / 2;
	}
	//Down Block
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
		config.zVel
	);
	return enemy;
}