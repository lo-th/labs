var v = new V.View(90, 45, 130);
v.tell('infinite terrain<br><br> Move with keyboard');
v.nav.bindKeys();
var key;
var x = 0;
var y = 0;
var env = new V.Environment();
var envUp = false;
var terrain = new TERRAIN.Generate(v)

loop();

function loop(){
    key = v.nav.key;
    requestAnimationFrame( loop );
    terrain.easing();
    v.render();
}