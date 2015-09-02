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
	if (type == "normalMoveHrz") {
		if (Math.random() * 2 < 1)
			this.velocity.x = config.enemyLinearVel;
		else
			this.velocity.x = -config.enemyLinearVel;
	}
	else if (type == "normalMoveVer") {
		if (Math.random() * 2 < 1)
			this.velocity.y = config.enemyLinearVel/2;
		else
			this.velocity.y = -config.enemyLinearVel/2;
	}
	this.type = type;
}

Enemy.prototype.checkCollideWithEnvY = function () {
	var pos = this.en.position;
	if (pos.y - this.size.y / 2 <= -config.roomHeight / 2) {
		this.en.position.y = -config.roomHeight / 2 + this.size.y / 2;
		this.velocity.y = -this.velocity.y;
	}
	else if (pos.y + this.size.y / 2 >= config.roomHeight / 2) {
		this.en.position.y = config.roomHeight / 2 - this.size.y / 2;
		this.velocity.y = -this.velocity.y;
	}
}

Enemy.prototype.checkCollideWithEnvX = function () {
	var pos = this.en.position;
	if (pos.x - this.size.x / 2 <= -config.roomWidth / 2) {
		this.en.position.x = -config.roomWidth / 2 + this.size.x / 2;
		this.velocity.x = -this.velocity.x;
	}
	else if (pos.x + this.size.x / 2 >= config.roomWidth / 2) {
		this.en.position.x = config.roomWidth / 2 - this.size.x / 2;
		this.velocity.x = -this.velocity.x;
	}
}

function generateOneEnemy (enemyType) {
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
	//Top left to bottom right corner
	else if (enemyType < 6) {
		enemySize.x = config.roomWidth * 2;
		enemySize.y = config.roomHeight;
		enemyTypeString = "tiltRight";
	}
	//Moving horizontally
	else if (enemyType < 7) {
		enemySize.x = config.roomWidth / 2;
		enemySize.y = config.roomHeight;
		enemyTypeString = "normalMoveHrz";
	}
	//Moving vertically
	else if (enemyType < 8) {
		enemySize.x = config.roomWidth;
		enemySize.y = config.roomHeight / 2;
		// enemyY = (Math.random() * config.roomHeight - enemySize.y) - config.roomHeight/2 + enemySize.y/2;
		enemyTypeString = "normalMoveVer";
	}
	enemy = new Enemy(
		new THREE.Vector3(
			enemyX,
			enemyY,
			-config.los - enemySize.z / 2
		),
		enemySize,
		config.zVel,
		enemyTypeString
	);
	return enemy;
}

function generateTwoEnemies (enemyType) {
	var enemies = [];
	var enemyX = [0, 0],
		enemyY = [0, 0];
	var enemyTypeString = "normal";
	var enemySize = {
		"z": 3500
	}
	//Two long vertical slabs
	if (enemyType < 9) {
		enemySize.x = 400;
		enemySize.y = config.roomHeight;
		enemyX[0] = -config.roomWidth/2 + enemySize.x/2;
		enemyX[1] = config.roomWidth/2 - enemySize.x/2;
	}
	//Two long horizontal slabs
	else if (enemyType < 10) {
		enemySize.x = config.roomWidth;
		enemySize.y = 200;
		enemySize.z /= 2.5;
		enemyY[0] = -config.roomHeight/2 + enemySize.y/2;
		enemyY[1] = config.roomHeight/2 - enemySize.y/2;
	}
	enemies.push(
		new Enemy (
			new THREE.Vector3 (
				enemyX[0],
				enemyY[0],
				-config.los - enemySize.z / 2
			),
			enemySize,
			config.zVel,
			enemyTypeString
		),
		new Enemy (
			new THREE.Vector3 (
				enemyX[1],
				enemyY[1],
				-config.los - enemySize.z / 2
			),
			enemySize,
			config.zVel,
			enemyTypeString
		)
	);
	return enemies;
}