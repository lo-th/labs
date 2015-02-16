var v = new V.View(180, 45, 300);
v.tell('sam<br><br>render test with game model<br>no light only one shader<br>map in sea3d file');
v.pool.load('sam', onload);
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onload(){
	var m = v.pool.meshes.sam.sam;
	var material = new V.Shader('Spherical', {map:m.material.map, env:envbase, normalMap:m.material.normalMap, useNormal:1, useMap:1, reflection:0.6});
	m.material = material;
	m.scale.set(3,3,-3);
	m.position.set(0,-100,0);
	v.scene.add(m);
	
	env.add(material);
}