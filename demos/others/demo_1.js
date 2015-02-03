var v = new V.View(180, 45, 130);
v.tell('shader load test');

var shader = new V.Shader('Basic', {}, false);
loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}