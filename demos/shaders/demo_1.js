V.Main = window.top.main;
var v = new V.View(180, 45, 130);
v.tell('parallax shader');
v.initGui(true);

var shader = new V.Shader('Parallax');
setTimeout(addParam, 100);

loop();

function loop(){
	requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	var tx = THREE.ImageUtils.loadTexture( './images/stones_grad.png');
	tx.minFilter = tx.magFilter = THREE.LinearFilter;
	tx.wrapS = THREE.RepeatWrapping;
	tx.wrapT = THREE.RepeatWrapping;
	tx.needsUpdate = true;
	shader.uniforms.heightMap.value = tx ;

	v.addModel(shader);
}