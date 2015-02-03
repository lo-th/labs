var v = new V.View(180, 45, 130);
v.tell('xray shader');
v.initGui(true);

var tx = THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg');
tx.minFilter = tx.magFilter = THREE.LinearFilter;
tx.needsUpdate = true;

var shader = new V.Shader('Xray', {env:tx, transparent:true, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, wrapping: THREE.ClampToEdgeWrapping, shading: THREE.SmoothShading, depthTest: false,
	depthWrite: true }, true);

var env = new V.Environment();
env.add(shader);

setTimeout(addParam, 100);

loop();

function loop(){
	requestAnimationFrame( loop );
    v.render();
}

function addParam(){
	v.addModel(shader);
}