var v = new V.View(180, 45, 130);
v.tell('The base');
v.addWorker('oimo', onWorker);

loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onWorker(){
    v.w.post({m:'room', obj:{w:50, h:50, d:50, m:2}});
    var x,y;
    var sx,sy,sz;
    for(var i = 0; i<300; i++){
        sx = V.rand(0.1, 2);
        x = V.rand(-20, 20);
        y = V.rand(0, 40);
        z = V.rand(-20, 20);
        v.add({type:'sphere', mass:1, pos:[x, y, z], size:[sx,sx,sx]});
    }
}