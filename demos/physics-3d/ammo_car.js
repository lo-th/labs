var v = new V.View(180, 45, 130, true);
var wheels = [];
var doors = [];
var shaders = [];
var car, carM, carHide, shape, shapemin;
v.tell('ammo car');
// active keyboard
v.nav.bindKeys();
// load car model
v.pool.load('c1gt', onload);

loop();

function loop(){
    v.render();
    if(car){
        v.tell('ammo car '+ v.speeds[0] +'km/h');
        //v.nav.move(car.position);

    }
    requestAnimationFrame( loop );
}

function onload(){
    var environment = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
    environment.mapping = THREE.SphericalReflectionMapping;

    var mesh;
    var map = {};
    for(var m in v.pool.meshes.c1gt){
        mesh = v.pool.meshes.c1gt[m];
        if(m == 'body'){ carM = mesh; map['body'] = mesh.material.map; }
        if(m == 'wheel_av_l'){ wheels[0] = new THREE.Group(); mesh.rotation.x = V.PI; mesh.position.set(0,0,0); wheels[0].add(mesh); map['wheel'] = mesh.material.map;}
        if(m == 'wheel_av_r'){ wheels[1] = mesh; }
        if(m == 'wheel_ar_r'){ wheels[2] = mesh; }
        if(m == 'wheel_ar_l'){ wheels[3] = new THREE.Group(); mesh.rotation.x = V.PI; mesh.position.set(0,0,0); wheels[3].add(mesh); }
        if(m == 'axe_l') wheels[4] = mesh;
        if(m == 'axe_r') wheels[5] = mesh;
        if(m == 'steeringWheel') wheels[6] = mesh;
        if(m == 'doorLeft'){ doors[0] = mesh; map['door'] = mesh.material.map;}
        if(m == 'doorRight') doors[1] = mesh;
        if(m == 'MotorAndBorder'){ carHide = mesh; mesh.visible = false; }
        if(m == 'interior') map['interior'] = mesh.material.map;
        if(m == 'headLight') map['headLight'] = mesh.material.map;

        if(m == 'shape') shape = mesh;
        if(m == 'shape_min') shapemin = mesh;
    }
     // create new materials
    shaders[0] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.6, map:map.body, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });// body
    shaders[1] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.6, map:map.door, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });// door
    shaders[2] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.9, map:map.body, transparent:true, color:0xFFFFFF, side:THREE.DoubleSide });// glass
    shaders[3] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.4, map:map.wheel, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });// wheel
    shaders[4] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.2, map:map.interior, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });// interior
    shaders[5] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.4, map:map.headLight, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });// headLight
    shaders[6] = new THREE.MeshBasicMaterial({ envMap:environment, reflectivity:0.4, color:0x333333 });

    for(var m in v.pool.meshes.c1gt){
        mesh = v.pool.meshes.c1gt[m];
        if(m == 'body' || m == 'hood' || m == 'MotorAndBorder' || m == 'bottomCar') mesh.material = shaders[0];
        else if(m == 'doorLeft' || m == 'doorRight') mesh.material = shaders[1];
        else if(m == 'glass' || m == 'doorGlassRight' || m == 'doorGlassLeft' || m == 'trunk') mesh.material = shaders[2];
        else if(m == 'wheel_av_l' || m == 'wheel_av_r'|| m == 'wheel_ar_l'|| m == 'wheel_ar_r') mesh.material = shaders[3];
        else if(m == 'interior') mesh.material = shaders[4];
        else if(m == 'headLight') mesh.material = shaders[5];
        else mesh.material = shaders[6];
    }

    var s = 0.2;
    //car.scale.set(s, s, -s);
    
    carM.scale.set(s, s, -s);
    carM.rotation.y = V.PI;
    carM.position.y = -2.3

    car = new THREE.Group();
    car.add( carM );
    v.scene.add( car );
    v.cars.push(car);

    var j = 4;
    var tt = new THREE.MeshBasicMaterial({color:0x00FF00})
    while(j--){
        wheels[j].scale.set(s, s, -s);
        v.wheels[j] = wheels[j];
        v.scene.add( v.wheels[j] );
    }

    v.addWorker('ammo', onWorker);
}

function onWorker(){
    var obj = {};
    var centroidY = -2.3;
    obj.type= 'c1gt';
    obj.pos = [0,4,0];
    //obj.size = [18.5,5,34.4];
    obj.size = [18.5,5,34.4];
    obj.wPos = [7.9,centroidY,12];
    obj.wRadius =  3.4;
    obj.wDeepth = 2.6;
    obj.nWheels = 4;
    obj.mass = 400;
    obj.massCenter = [0,centroidY,0];
    obj.type='c1gt';
    obj.v = V.getVertex(shape.geometry, [-0.02,0.02,0.02]);
    v.w.post({m:'car', obj:obj });


    v.w.room({w:200, h:30, d:500, m:3});

    var x,y,z,tt;
    var sx,sy,sz;
    for(var i = 0; i<100; i++){
        sx = V.rand(3, 8);
        sy = V.rand(3, 8);
        sz = V.rand(3, 8);
        x = V.rand(-20, 20);
        y = V.rand(0, 40);
        z = V.rand(-20, 20);
        tt = V.randInt(0, 2);
        if(tt==0) v.add({type:'box', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx,sy,sz]});
        if(tt==1) v.add({type:'sphere', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx*0.5,sx*0.5,sx*0.5]});
        if(tt==2) v.add({type:'cylinder', mass:0.1, pos:[x, y*(i*0.1), z], size:[sx*0.5,sy,sx*0.5]});
    }
}