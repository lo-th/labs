var v = new V.View(180, 45, 200);
v.tell('crowd simulation<br><br>click to add agent !');

var model1, model2;
var workerOn = false;
var ball = new THREE.Mesh( new THREE.SphereGeometry(2,12,10), new THREE.MeshBasicMaterial({color:0xFF3300}));
v.scene.add(ball);
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
v.zone({s:500});
v.zone({s:20, v:true});
v.zone({s:20, v:true, pos:[0,0,30]})
//v.pool.load('boblow', onload);
v.pool.load('heros', onload);

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onload(){
	//model = v.pool.meshes.boblow.bob;
	model1 = v.pool.meshes.heros.woman;
	model2 = v.pool.meshes.heros.man;
	
	//var map = model.material.map;

	var tx = THREE.ImageUtils.loadTexture('images/avatar.png');
	tx.flipY = false;
	
	var material = new V.Shader('Spherical', {skinning:true, morphTargets:false, map:tx, env:envbase, useMap:1, reflection:0.6});
	model1.material = material;
	model2.material = material;
	env.add(material);

	

	v.addWorker('crowd', onWorker);
}

function addClone(x,y,z){
	var r = V.randInt(0,1);
	var m;
	if(r==0) m = model1.clone();
	else  m = model2.clone();
	var s = 0.3;
	m.animations[1].play(0);
	m.scale.set(s,s,-s);
	m.position.set(x,y,z);
	v.scene.add(m);

	v.meshs[v.meshs.length] = m;

	// push to worker
	var obj = {type:'box', pos:[x, 0, z], size:[2,6,2]}
	v.w.post({m:'add', obj:obj});
}

function onWorker(){
	v.w.post({m:'obstacle', obj:{type:'box', pos:[0,0,0], size:[20,10,20]}})
	v.w.post({m:'obstacle', obj:{type:'box', pos:[0,0,30], size:[20,10,20]}})

	workerOn = true;
}

function mainDown(){
	var x = v.nav.mouse3d.x;
	var z = v.nav.mouse3d.z;
	//v.add({type:'box', pos:[x, 0, z], size:[2,6,2]});
	addClone(x, 0, z);
}

function mainMove(){
	ball.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
	if(workerOn)v.w.post({m:'goal', obj:{ x:v.nav.mouse3d.x, y:v.nav.mouse3d.z}})
}