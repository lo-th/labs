var v = new V.View(180, 45, 300);
v.tell('eye test with spherical');
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
var tx0 = THREE.ImageUtils.loadTexture( 'images/dianna/eye.jpg');
var tx1 = THREE.ImageUtils.loadTexture( 'images/dianna/eye_n.png');


tx0.format = THREE.RGBFormat;
tx0.wrapS = tx0.wrapT = THREE.RepeatWrapping;
tx0.minFilter = tx0.magFilter = THREE.LinearFilter;
tx1.format = THREE.RGBFormat;
tx1.wrapS = tx1.wrapT = THREE.RepeatWrapping;
tx1.minFilter = tx1.magFilter = THREE.LinearFilter;

//var tx2 = THREE.ImageUtils.loadTexture( 'images/dianna/studio2_refl.jpg');
//var tx3 = THREE.ImageUtils.loadTexture( 'images/dianna/studio2_diff.jpg');

//var mat  = new V.Shader('Eye', {texEyeCol:tx0, texEyeNrm:tx1, env:envbase, texEnvRfl:tx2, texEnvDif:tx3});
var mat  = new V.Shader('Eye', {texEyeCol:tx0, texEyeNrm:tx1, env:envbase});//, texEnvRfl:tx2, texEnvDif:tx3});
env.add(mat);
//var ball = new THREE.Mesh( new THREE.IcosahedronGeometry( 50, 4 ), mat );
var ball = new THREE.Mesh( new THREE.SphereGeometry( 50, 32,26 ), mat );
v.scene.add(ball);

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}