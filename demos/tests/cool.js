var v = new V.View(180, 45, 300);
v.tell('crowd simulation<br><br>click to add agent !');

var ball = new THREE.Mesh( new THREE.SphereGeometry(2,12,10), new THREE.MeshBasicMaterial({color:0xFF3300}));
v.scene.add(ball);

v.zone();
v.z.scale.set(500,1,500);
//v.z.visible = true;

v.addWorker('crowd', onWorker);
loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onWorker(){
	
	
	
}

function mainDown(){
	var x = v.nav.mouse3d.x;
	var z = v.nav.mouse3d.z;
	v.add({type:'box', pos:[x, 0, z], size:[2,6,2]});
}

function mainMove(){
	ball.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
}