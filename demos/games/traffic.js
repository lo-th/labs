var v = new V.View(180, 45, 200);
v.tell('traffic simulation');

var cars_geo = [];

var workerOn = false;
//var ball = new THREE.Mesh( new THREE.SphereGeometry(2,12,10), new THREE.MeshBasicMaterial({color:0xFF3300}));
//v.scene.add(ball);
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');

v.zone({s:500});
var select = null;
//v.zone({s:20, v:true});
//v.zone({s:20, v:true, pos:[0,0,30]})
//v.pool.load('boblow', onload);
v.pool.load('cars', onload, true);

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onload(){
	var i = 14;
	while(i--){
		if(i<9) cars_geo[i] = v.pool.getGeometry('cars', 'car00'+(i+1), true);
		else cars_geo[i] = v.pool.getGeometry('cars', 'car0'+(i+1), true);
	}

	var canvas = document.createElement( 'canvas' );
	canvas.width = canvas.height = 1024;
	var ctx = canvas.getContext('2d');
	i = 16;
	var n=0,j=0;
	for(i=0; i<16;i++){
		ctx.beginPath();
		if(i!==11 && i!==15) ctx.fillStyle = V.randCarColor();
		ctx.rect(n*256, j*256, 256, 256);
		ctx.fill();
		n++
		if(n==4){ n=0; j++; }
	}
	
	var tx;
	var img = new Image();
    img.onload = function(){
        ctx.drawImage(img, 0, 0, 1024,1024);
        tx = new THREE.Texture(canvas);
        tx.needsUpdate = true;
        tx.flipY = false;
        carTest(tx)
    }
    img.src = 'images/cars.png';

    // init worker
	v.addWorker('traffic', onWorker);
}

function carTest(tx){
    var material = new V.Shader('Spherical', { map:tx, env:envbase, useMap:1, reflection:0.6});
	env.add(material);

	i = cars_geo.length;
	while(i--){
		var c = new THREE.Mesh( cars_geo[i], material );
		v.scene.add( c );
		c.position.set(-60+(i*8), 0, 0);
		c.scale.set(2, 2, -2);
	}
}

function onWorker(){
	console.log('ok')
}


/*
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
	var w = 100/2;
    var h = 50/2;

	v.chaine({ points:[ -w,h,  w,h, w,-h, -w,-h   ], close:true });
	//v.w.post({m:'obstacle', obj:{type:'box', pos:[0,0,0], size:[20,10,20]}})
	//v.w.post({m:'obstacle', obj:{type:'box', pos:[0,0,30], size:[20,10,20]}})

	workerOn = true;
}

function mainDown(){
	var x = v.nav.mouse3d.x;
	var z = v.nav.mouse3d.z;
	//v.add({type:'box', pos:[x, 0, z], size:[2,6,2]});
	addClone(x, 0, z);

	select = v.anchors[v.nav.selectName];
	if (select) { 
		v.nav.mouse.move = false;
		select.material = v.mat.Sanchor;
	}
}

function mainMove(){
	ball.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
	if(workerOn)v.w.post({m:'goal', obj:{ x:v.nav.mouse3d.x, y:v.nav.mouse3d.z}})

	if (select) {
		select.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
		v.upAnchor(select);
	}
}

function mainUp(){
	if (select) { 
		v.nav.mouse.move = true;
		select.material = v.mat.anchor; 
		select = null;
	}
}*/