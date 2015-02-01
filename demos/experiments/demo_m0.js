var v = new V.View(180, 45, 130);
v.tell('The experiment');

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}