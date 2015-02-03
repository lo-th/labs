var v = new V.View(180, 45, 130);
v.tell('basic shader');
v.initGui(true);

var tx = THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg');
//tx.minFilter = tx.magFilter = THREE.LinearFilter;
//tx.needsUpdate = true;

var shader = new V.Shader('Spherical',{transparent:true, env:tx}, true);
setTimeout(addParam, 100);

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	v.addModel(shader);
}