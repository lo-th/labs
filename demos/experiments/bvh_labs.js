var v = new V.View(90, 90, 200, true);
v.nav.moveto(0,50,0);
v.mirror(300, {pos:new THREE.Vector3(0,5,0), color:0x25292e, alpha:0.3});

var bvh = new V.BvhPlayer(v);
//bvh.load('images/bvh/tpose.bvh');
bvh.load('images/bvh/action.png');

v.pool.load('stickman', onload, true);



loop();

function loop(){
    v.render();
    bvh.update();
    requestAnimationFrame(loop);
}

function onload(){
	var m = v.pool.meshes.stickman.body;
	var size = 1;
	m.scale.set(size,size,-size);
	m.material = new THREE.MeshBasicMaterial({color:0xCCCCCC, skinning:true, envMap:v.environment, reflectivity:0.8, transparent:true, opacity:0.9})
	bvh.skin(m);
}


var zone = document.createElement('div');
zone.className = 'bvhDragZone';
zone.innerHTML = 'Drag File';
document.body.appendChild( zone );
zone.ondragover = function () { this.className = 'bvhDragZone hover'; return false; };
zone.ondragend = function () { this.className = 'bvhDragZone'; return false; };
zone.ondrop = function (e) {
	this.className = 'bvhDragZone';
	e.preventDefault();
	var file = e.dataTransfer.files[0];
	var reader = new FileReader();
	zone.innerHTML = file.name;
    reader.onload = (function(theFile) { return function(e) { bvh.reader.parseData(e.target.result.split(/\s+/g));}; })(file);
    reader.readAsText(file);
    return false;
};