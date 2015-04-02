var v = new V.View(90, 45, 130);
v.initSky();
v.sky.autocycle = true;
v.tell('infinite terrain<br><br>Move with keyboard<br>Shift to run');
v.nav.bindKeys();

var ball = new THREE.Mesh( new THREE.SphereGeometry(0.3,12,10), new THREE.MeshBasicMaterial({color:0xFF3300}));
ball.geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.3,0));
v.scene.add(ball);

var key;
var x = 0;
var y = 0;
//var env = new V.Environment();
var envUp = false;
var terrain = new TERRAIN.Generate(v)

loop();

function loop(){
    key = v.nav.key;
    requestAnimationFrame( loop );
    terrain.easing();
    ball.position.y = terrain.getz(0,0);
    v.render();
}