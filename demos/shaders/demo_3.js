V.Main = window.top.main;
var v = new V.View(180, 45, 130);
v.tell('fansy shader');
v.initGui(true);

var tx = THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg');
tx.minFilter = tx.magFilter = THREE.LinearFilter;
tx.needsUpdate = true;

var shader = new V.Shader('Fansy', {texTireDiff:tx});
setTimeout(addParam, 100);

loop();

function loop(){
	requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	v.addModel(shader);
}