function Enemy (position, size, zVel) {
	this.size = size;
	var cubeGeo = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z);
	var material = new THREE.MeshPhongMaterial({"color": 0x00FFFF, "transparent": true});
	material.opacity = 0.6;
	this.en = new THREE.Mesh(cubeGeo, material);
	this.en.position.copy(position);
	this.velocity = new THREE.Vector3(0, 0, zVel);
/*	this.box = new THREE.BoxHelper(this.en);
	this.box.material = new THREE.MeshBasicMaterial({"color": 0x303030});*/
}