var v = new V.View(180, 45, 130);
v.tell('The base');
v.addWorker('oimo', onWorker);

loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onWorker(){
    v.w.room({w:50, h:30, d:50, m:3});
    var x,y;
    var sx,sy,sz;
    for(var i = 0; i<300; i++){
        sx = V.rand(1, 8);
        sy = V.rand(1, 8);
        sz = V.rand(1, 8);
        x = V.rand(-20, 20);
        y = V.rand(0, 40);
        z = V.rand(-20, 20);
        v.add({type:'box', mass:1, pos:[x, y*(i*0.1), z], size:[sx,sy,sz]});
    }
}