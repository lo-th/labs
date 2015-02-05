var v = new V.View(-90, 25, 50);
v.tell('The base');
v.addWorker('liquid', onWorker);
var select = null;
v.zone();
v.z.scale.set(300,1,300);
//v.z.visible = true;
loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onWorker(){
	
	var w = 25/2;
    var h = 25/2;

	v.chaine({ points:[-w,h, w,h, w*0.25,-h, -w*0.25,-h], close:true });
	v.addParticle({ radius:0.25, g_radius:7});
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