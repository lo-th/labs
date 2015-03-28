var v = new V.View(180, 45, 200);
v.tell('Stress test');

var val = 0;
var model1, model2;
var mesh = [];

var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
//v.pool.load('heros', onload, true);
v.pool.load('heroesMorph', onload, true);

loop();

function loop(){
    requestAnimationFrame( loop );
    morphLoop();
    v.render();
}

function onload(){
	//model = v.pool.meshes.boblow.bob;
	//model1 = v.pool.meshes.heros.woman;
	model1 = v.pool.meshes.heroesMorph.woman;
	//model2 = v.pool.meshes.heros.man;

	var tx = THREE.ImageUtils.loadTexture('images/avatar.png');
	tx.flipY = false;

	//var material = new V.Shader('Spherical', {skinning:true, morphTargets:false, map:tx, env:envbase, useMap:1, reflection:0.6});
	var material = new V.Shader('Spherical', {skinning:false, morphTargets:true, map:tx, env:envbase, useMap:1, reflection:0.6});
	model1.material = material;
	//model2.material = material;
	env.add(material);
	var s = 0.3;
	var c, x, z, n;
	for(var i = 0; i<500; i++){
		n = V.randInt(0,1);
		//if(n==0) 
		c = model1.clone();
		//else  c = model2.clone();
		x = V.randInt(-100,100);
		z = V.randInt(-100,100);
		c.position.set(x, 0, z);
		//c.animations[1].play(0);
		c.scale.set(s,s,-s);
		v.scene.add(c);
		mesh[i] = c;
	}
}

function morphLoop(){
	val+=0.01;
	if(val >= 1) val = 0;
	var i = mesh.length;
	while(i--){
		mesh[i].setWeight('site', val);
	}
}