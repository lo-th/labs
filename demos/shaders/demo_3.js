V.Main = window.top.main;
var v = new V.View(180, 45, 130);
v.tell('fansy shader');
v.initGui(true);

var shader = new V.Shader('Fansy');
setTimeout(addParam, 100);

loop();

function loop(){
	requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	var tx = THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg');
	tx.minFilter = tx.magFilter = THREE.LinearFilter;
	tx.needsUpdate = true;
	shader.uniforms.texTireDiff.value = tx ;

	v.addModel(shader);
}