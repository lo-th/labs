var v = new V.View(180, 45, 130);
v.tell('ammo basic');
v.addWorker('ammo', onWorker);

loop();

function loop(){
    v.render();
    requestAnimationFrame( loop );
}

function onWorker(){
    v.w.room({w:50, h:30, d:50, m:3});
    var x,y,z,tt;
    var sx,sy,sz;
    for(var i = 0; i<300; i++){
        sx = V.rand(1, 8);
        sy = V.rand(1, 8);
        sz = V.rand(1, 8);
        x = V.rand(-20, 20);
        y = V.rand(0, 40);
        z = V.rand(-20, 20);
        tt = V.randInt(0, 2);
        if(tt==0) v.add({type:'box', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx,sy,sz]});
        if(tt==1) v.add({type:'sphere', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx*0.5,sx*0.5,sx*0.5]});
        if(tt==2) v.add({type:'cylinder', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx*0.5,sy,sx*0.5]});
    }
}