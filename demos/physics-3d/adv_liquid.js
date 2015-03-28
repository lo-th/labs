var v = new V.View(180, 45, 130);
//v.mirror(300);
v.tell('The base');
v.metaball(onShader);

loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onShader(){
    var env = new V.Environment();
    env.add(v.postEffect.meta);
    v.addWorker('oimo', onWorker);
}

function onWorker(){
    v.w.room({w:50, h:30, d:50, m:3});
    var x,y;
    var sx,sy,sz;
    for(var i = 0; i<300; i++){
        sx = V.rand(1, 4);
        x = V.rand(-20, 20);
        y = V.rand(0, 40);
        z = V.rand(-20, 20);
        v.add({type:'blob', mass:1, pos:[x, y*(i*0.1), z], size:[sx,sx,sx]});
    }
}