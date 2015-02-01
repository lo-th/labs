var v = new V.View(180, 45, 130);
v.tell('basic shader');
v.initGui(true);

var shader = new V.Shader('Basic');
setTimeout(addParam, 100);

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	v.addModel(shader);
}