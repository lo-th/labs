var v = new V.View(-90, 25, 50);
v.tell('The base');
v.metaball(onShader);

var select = null;
v.zone({s:300});
loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onShader(){
	var env = new V.Environment();
	env.add(v.postEffect.meta);
	v.addWorker('liquid', onWorker);
}

function onWorker(){
	var w = 25*0.5;
    var h = 25*0.5;
	v.chaine({ points:[ w,h, w*0.25,-h, -w*0.25,-h, -w,h], close:false });
	v.addParticle({ radius:0.4, g_radius:10, pos:[0, 0, 20]});
}

function mainMove(){
	if (select) {
		select.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
		v.upAnchor(select);
	}
}
function mainDown(){
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
}