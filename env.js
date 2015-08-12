var roofCeilingGeo = new THREE.PlaneGeometry(config.roomWidth, 100000);
var wallsGeo = new THREE.PlaneGeometry(config.roomHeight, 100000);
var texture = THREE.ImageUtils.loadTexture("tile.jpg");
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set(2, 1);
var material = new THREE.MeshPhongMaterial({map: texture});
//var material = new THREE.MeshBasicMaterial({"wireframe": true});
var floor = new THREE.Mesh(roofCeilingGeo, material);
floor.position.set(0, -config.roomHeight / 2, -10000);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
var roof = new THREE.Mesh(roofCeilingGeo, material);
roof.rotation.x = Math.PI / 2;
roof.position.set(0, config.roomHeight / 2, -10000);
roof.castShadow = true;
var leftWall = new THREE.Mesh(wallsGeo, material);
leftWall.rotation.y = Math.PI / 2;
leftWall.rotation.z = Math.PI / 2;
leftWall.position.set(-config.roomWidth / 2, 0, -10000);
leftWall.receiveShadow = true;
var rightWall = new THREE.Mesh(wallsGeo, material);
rightWall.rotation.y = -Math.PI / 2;
rightWall.rotation.z = Math.PI / 2;
rightWall.position.set(config.roomWidth / 2, 0, -10000);

var env = {
	"roof": roof,
	"floor": floor,
	"leftWall": leftWall,
	"rightWall": rightWall
}