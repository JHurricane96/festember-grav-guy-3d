function Player () {
	this.size = config.playerSize;
	var cubeGeo = new THREE.CubeGeometry(this.size, this.size, this.size);
	var material = new THREE.MeshPhongMaterial({"color": 0x00FFFF, "transparent": true});
	material.opacity = 0.5;
	this.pl = new THREE.Mesh(cubeGeo, material);
	this.pl.position.set(0, 0, -120);
	this.pl.castShadow = true;
	//this.pl.rotation.x = Math.PI / 10;
	this.box = undefined;
/*	this.box = new THREE.BoxHelper(this.pl);
	this.box.material = new THREE.MeshBasicMaterial({"color": 0x00FFFFF});*/
	//this.pl.rotation.x = Math.PI / 6;
	//this.pl.rotation.y = Math.PI / 6;
	this.velocity = new THREE.Vector3(0, 0, -config.zVel);
}

Player.prototype.checkCollide = function (gravity, gravChange) {
	var plPos = this.pl.position;
	if (plPos.y - this.size / 2 <= -config.roomHeight / 2) {
		this.pl.position.y = (-config.roomHeight / 2) + this.size / 2;
		if (!gravChange) {
			//if (gravity.y < 0)
				this.velocity.y = -this.velocity.y * 0.2;
			/*else
				this.velocity.y = 0;*/
		}
	}
	if (plPos.y + this.size / 2 >= config.roomHeight / 2) {
		this.pl.position.y = config.roomHeight / 2 - this.size / 2;
		if (!gravChange) {
			//if (gravity.y > 0)
				this.velocity.y = -this.velocity.y * 0.2;
			/*else
				this.velocity.y = 0;*/
		}
	}
	if (plPos.x + this.size / 2 >= config.roomWidth / 2) {
		this.pl.position.x = config.roomWidth / 2 - this.size / 2;
		if (!gravChange)
			this.velocity.x = -this.velocity.x * 0.2;
	}
	if (plPos.x - this.size / 2 <= -config.roomWidth / 2) {
		this.pl.position.x = -config.roomWidth / 2 + this.size / 2;
		if (!gravChange)
			this.velocity.x = -this.velocity.x * 0.2;
	}
}