var v = new V.View(90, 90, 200, true);
v.nav.moveto(0,50,0);
v.mirror(300, {pos:new THREE.Vector3(0,5,0), color:0x25292e, alpha:0.3});

var man, woman;

var bvh = new V.BvhPlayer(v);
//bvh.load('images/bvh/tpose.bvh');
bvh.load('images/bvh/action.png', onbvhload);



loop();

function loop(){
    v.render();
    bvh.update();
    requestAnimationFrame(loop);
}

function onbvhload(){
	v.pool.load('human', onload);
}

function onload(){

	man = v.pool.meshes.human.man;
	woman = v.pool.meshes.human.woman;

	var size = 1;
	var skinMat = new THREE.MeshBasicMaterial({color:0xCCCCCC, skinning:true, envMap:v.environment, reflectivity:0.8, transparent:true, opacity:0.9});
	man.scale.set(size,size,-size);
	man.material = skinMat;
	woman.scale.set(size,size,-size);
	woman.material = skinMat;

	bvh.skin(man, true);
}

// DRAGZONE
var zone = document.createElement('div');
zone.className = 'bvhDragZone';
zone.innerHTML = 'Drag bvh file';
document.body.appendChild( zone );
zone.ondragover = function () { this.className = 'bvhDragZone hover'; return false; };
zone.ondragend = function () { this.className = 'bvhDragZone'; return false; };
zone.ondrop = function (e) {
	this.className = 'bvhDragZone';
	var file = e.dataTransfer.files[0];
	var reader = new FileReader();
	zone.innerHTML = file.name;
    reader.onload = function(e) { bvh.reader.parseData(e.target.result.split(/\s+/g));}
    reader.readAsText(file);
    e.preventDefault();
    return false;
};

// BUTTON
var butMan = document.createElement('div');
butMan.className = 'bvhButton';
butMan.innerHTML = 'MAN';
document.body.appendChild( butMan );
butMan.onclick = function (e) { bvh.skin(man, true); }
butMan.onmouseover = function (e) { this.className = 'bvhButton hover'; }
butMan.onmouseout = function (e) { this.className = 'bvhButton'; }

var butWoman = document.createElement('div');
butWoman.className = 'bvhButton';
butWoman.innerHTML = 'WOMAN';
butWoman.style.right = '86px';
document.body.appendChild( butWoman );
butWoman.onclick = function (e) { bvh.skin(woman, true); }
butWoman.onmouseover = function (e) { this.className = 'bvhButton hover'; }
butWoman.onmouseout = function (e) { this.className = 'bvhButton'; }