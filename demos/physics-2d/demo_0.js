var v = new V.View(-90, 45, 130);
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

	var w = 100/2;
    var h = 50/2;

	

	//v.add({type:'box', mass:1, pos:[0, 0.5, -20], size:[3,1,6]});

	//v.chaine({ points:[ -w,h,  w,h  ], close:true });

	v.chaine({ points:[ -w,h,  w,h, w,-h, -w,-h   ], close:true });

	var x,y;
	var sx,sy,sz;
	for(var i = 0; i<300; i++){
		sx = V.rand(0.1, 2);
		sz = V.rand(0.1, 2);
		x = V.rand(-20, 20);
		y = V.rand(-20, 20);
		v.add({type:'box', mass:1, pos:[x, 0.5, y], size:[sx,1,sz]});
	}
}


function mainMove(){
	if (select) {
		select.position.set(v.nav.mouse3d.x, 0, v.nav.mouse3d.z);
		console.log(v.nav.mouse3d.x, 0, v.nav.mouse3d.z, select.name)
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