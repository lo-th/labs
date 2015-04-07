var v = new V.View(180, 45, 130, true);
v.initSky();
v.sky.autocycle = true;
v.mirror(600);

var isShadeUpdated = false;
var wheels = [];
var doors = [];
var shaders = {};
var car, carM, carHide, shape, shapemin;

//var sky;// = new V.Skylab(v);

v.tell('Ammo car<p>Use keyboard to drive');
// active keyboard
v.imput.bindKeys();
//v.nav.bindKeys();
// load car model
v.pool.load('c1gt', onload);

loop();

function loop(){
    v.render();
    //if(car) v.tell('ammo car '+ v.speeds[0] +'km/h');
    requestAnimationFrame( loop );
}

function onload(){
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
    shaders['body'] = v.material.basic({ envMap:v.environment, reflectivity:0.6, map:map.body, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });
    shaders['door'] = v.material.basic({ envMap:v.environment, reflectivity:0.6, map:map.door, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });
    shaders['glass'] = v.material.basic({ envMap:v.environment, reflectivity:0.9, map:map.body, transparent:true, color:0xFFFFFF, side:THREE.DoubleSide });
    shaders['wheel'] = v.material.basic({ envMap:v.environment, reflectivity:0.4, map:map.wheel, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });
    shaders['interior'] = v.material.basic({ envMap:v.environment, reflectivity:0.2, map:map.interior, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });
    shaders['headLight'] = v.material.basic({ envMap:v.environment, reflectivity:0.4, map:map.headLight, transparent:false, color:0xFFFFFF, side:THREE.FrontSide });
    shaders['other'] = v.material.basic({ envMap:v.environment, reflectivity:0.4, color:0x333333 });

    // apply material
    for(var m in v.pool.meshes.c1gt){
        mesh = v.pool.meshes.c1gt[m];
        if(m == 'body' || m == 'hood' || m == 'MotorAndBorder' || m == 'bottomCar') mesh.material = shaders.body;
        else if(m == 'doorLeft' || m == 'doorRight') mesh.material = shaders.door;
        else if(m == 'glass' || m == 'doorGlassRight' || m == 'doorGlassLeft' || m == 'trunk') mesh.material = shaders.glass;
        else if(m == 'wheel_av_l' || m == 'wheel_av_r'|| m == 'wheel_ar_l'|| m == 'wheel_ar_r') mesh.material = shaders.wheel;
        else if(m == 'interior') mesh.material = shaders.interior;
        else if(m == 'headLight') mesh.material = shaders.headLight;
        else mesh.material = shaders.other;
    }

    var s = 0.2;
    carM.scale.set(s, s, -s);
    carM.rotation.y = V.PI;
    carM.position.y = -2.3

    car = new THREE.Group();
    car.add( carM );
    v.scene.add( car );
    v.cars.push(car);

    var j = 4;
    //var tt = new THREE.MeshBasicMaterial({color:0x00FF00})
    while(j--){
        wheels[j].scale.set(s, s, -s);
        v.wheels[j] = wheels[j];
        v.scene.add( v.wheels[j] );
    }

    v.steering[0] = wheels[6];

    // init worker
    v.addWorker('ammo', onWorker);
     
}

function onWorker(){
    var centroidY = -2.3;
    var obj = {
        type:'c1gt',
        pos:[0,4,0],
        rot:[0,30,0],
        quat:[0,0,0,0],
        size:[18.5,5,34.4],
        wPos:[7.9,centroidY,12],
        wRadius:3.4,
        wDeepth:2.6,
        nWheels:4,
        mass:400,
        massCenter:[0,centroidY,0],
        carshape:V.getVertex(shape.geometry, [-0.02,0.02,0.02]),
        setting:{ 
            engine:600, stiffness: 40, 
            relaxation: 0.85, compression: 0.82, 
            travel: 500, force: 6000, frictionSlip: 20.5, 
            reslength: 0.1, roll: 0//.1 
        }
    };

    obj.quat = v.quat(obj.rot);

    v.w.post({m:'car', obj:obj });
    v.w.room({w:200, h:30, d:500, m:3});

    var x,y,z,tt;
    var sx,sy,sz;
    for(var i = 0; i<60; i++){
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