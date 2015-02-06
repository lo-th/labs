var v = new V.View(180, 45, 130);
v.tell('terrain test<br>move with keyboard');
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
    if(terrain.fullLoaded){
        if(!envUp) addEnv();
        if (key.up) {x++; up();}
        if (key.down) {x--; up();}
        if (key.left) {y++; up();}
        if (key.right) {y--; up();}
    }
    v.render();
}

function up(){
    terrain.move(x,y, v.clock.getDelta());
}

function addEnv(){
    envUp = true;
    env.add(terrain.mlib.terrain);
}