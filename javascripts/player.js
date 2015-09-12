function Player () {
	this.size = config.playerSize;
	var cubeGeo = new THREE.BoxGeometry(this.size, this.size, this.size);
	var material = new THREE.MeshPhongMaterial({"color": 0x404040, "transparent": true});
	material.opacity = 0.8;
	this.pl = new THREE.Mesh(cubeGeo, material);
	this.pl.position.set(0, 0, -120);
/*	this.box = new THREE.BoxHelper(this.pl);
	this.box.material = new THREE.MeshBasicMaterial({"color": 0x505050});*/
	this.velocity = new THREE.Vector3(0, 0, 0);
}

Player.prototype.checkCollide = function (gravity, gravChange, t) {
	var plPos = this.pl.position;
	var collision = false;
	if (plPos.y - this.size / 2 <= -config.roomHeight / 2) {
		this.pl.position.y = (-config.roomHeight / 2) + this.size / 2;
		if (!gravChange) {
			if (Math.abs(this.velocity.y) - 0.1 < Math.abs(gravity.y * t)) {
				this.velocity.y = 0;
			}
			else {
				this.velocity.y = -this.velocity.y * 0.2;
				collision = true;
			}
		}
		else
			this.velocity.y = -0;
	}
	if (plPos.y + this.size / 2 >= config.roomHeight / 2) {
		this.pl.position.y = config.roomHeight / 2 - this.size / 2;
		if (!gravChange) {
			if (Math.abs(this.velocity.y) - 0.1 < Math.abs(gravity.y * t)) {
				this.velocity.y = 0;
			}
			else {
				this.velocity.y = -this.velocity.y * 0.2;
				collision = true;
			}
		}
		else
			this.velocity.y = -0;
	}
	if (plPos.x + this.size / 2 >= config.roomWidth / 2) {
		this.pl.position.x = config.roomWidth / 2 - this.size / 2;
		if (!gravChange) {
			if (Math.abs(this.velocity.x) - 0.1 < Math.abs(gravity.x * t)) {
				this.velocity.x = 0;
			}
			else {
				this.velocity.x = -this.velocity.x * 0.2;
				collision = true;
			}
		}
		else
			this.velocity.x = -0;
	}
	if (plPos.x - this.size / 2 <= -config.roomWidth / 2) {
		this.pl.position.x = -config.roomWidth / 2 + this.size / 2;
		if (!gravChange) {
			if (Math.abs(this.velocity.x) - 0.1 < Math.abs(gravity.x * t)) {
				this.velocity.x = 0;
			}
			else {
				this.velocity.x = -this.velocity.x * 0.2;
				collision = true;
			}
		}
		else
			this.velocity.x = -0;
	}
	return collision;
}