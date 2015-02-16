var v = new V.View(180, 45, 300);
v.tell('dante<br><br>render test with game model<br>no light only one shader<br>map in sea3d file');
v.pool.load('dante', onload);
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onload(){
	var m = v.pool.meshes.dante.dante;
	var material = new V.Shader('Spherical', {map:m.material.map, env:envbase, normalMap:m.material.normalMap, useNormal:1, useMap:1, reflection:0.6});
	m.material = material;
	m.scale.set(30,30,-30);
	m.position.set(0,-100,0);
	v.scene.add(m);
	var m2 = v.pool.meshes.dante.jean;
	var material2 = new V.Shader('Spherical', {map:m.material.map, env:envbase, normalMap:m.material.normalMap, useNormal:1, useMap:1, reflection:0.3});
	m2.material = material2;
	m2.scale.set(30,30,-30);
	m2.position.set(0,-100,0);
	v.scene.add(m2);
	env.add(material);
	env.add(material2);
}