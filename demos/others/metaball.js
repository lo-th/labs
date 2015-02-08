var v = new V.View(-90, 45, 130);
v.tell('metaball');

var select = null;
v.metaball(onShader);
//v.addWorker('liquid', onWorker);
var ball = new THREE.Mesh( new THREE.SphereGeometry(2,12,10), new THREE.MeshBasicMaterial({color:0xFF3300}));
v.scene.add(ball);
ball.position.x=20;

v.zone({s:300});

loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onShader(){
	//console.log('shader loaded');
	var env = new V.Environment();
	env.add(v.postEffect.meta);
	var i = 200;
	var position = new THREE.Vector3();
	var radius = 20;
	while(i--){
		position.x = V.rand(-200, 200);
		position.z = V.rand(-200, 200);
		radius =  V.rand(20, 50);
		v.addBlob(position, radius);
	}
}

function onWorker(){
	
	/*var w = 50/2;
    var h = 50/2;

	v.chaine({ points:[-w,h, w,h, w,-h, -w,-h], close:true });
*/
	v.addParticle({radius:0.5});
}

function mainMove(){
	
	v.meshs[0].position.copy(v.nav.mouse3d);
	/*if (select) {
		select.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
		v.upAnchor(select);
	}*/
}
/*function mainDown(){
	select = v.anchors[v.nav.selectName];
	if (select) { 
		v.nav.mouse.move = false;
		select.material = v.mat.Sanchor;
	}
}
function mainUp(){
	if (select) { 
		v.nav.mouse.move = true;
		select.material = v.mat.anchor; 
		select = null;
	}
}*/