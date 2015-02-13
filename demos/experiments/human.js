var v = new V.View(180, 45, 130);
v.tell('human');
v.pool.load('dianna', onload, true);
var head, body, suit, eyel, eyer;
var bodyBones = {};
var headBones = {};

var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');

v.nav.target.y = 60;
v.nav.revers();
v.nav.moveCamera();

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onload(){
	var size = 1;

	head = v.pool.meshes.dianna.head;
	body = v.pool.meshes.dianna.body;
    suit = v.pool.meshes.dianna.suit;

    suit.skeleton = body.skeleton;
    head.skeleton = body.skeleton;

	head.setWeight("neck", 1);
    //head.setWeight("earOut", 0.6);
    //head.setWeight("surprise", 1);

	head.scale.set(size,size,size);
    body.scale.set(size,size,size);
    suit.scale.set(size,size,size);

    // body textures
    var texNames = [
        'full.jpg','head.jpg','hair.png','eye_cont.png',
        'teethLow.png','teethUp.png','sock.jpg','tongue.jpg',
        'teethLow_n.jpg','teethUp_n.jpg','head_n.jpg','body_n.jpg'
    ];
    var textures = [];
    var i = texNames.length;
    while(i--){
        textures[i] = THREE.ImageUtils.loadTexture( 'images/dianna/'+texNames[i]);
        textures[i].flipY = false;
    }

    // eye textures
    var texEyes = [ 'eye.jpg','eye_n.png','refl.jpg' ];
    var texturesEyes = [];
    i = texEyes.length;
    while(i--){
        texturesEyes[i] = THREE.ImageUtils.loadTexture( 'images/dianna/'+texEyes[i]);
        texturesEyes[i].format = THREE.RGBFormat;
        texturesEyes[i].wrapS = texturesEyes[i].wrapT = THREE.RepeatWrapping;
        texturesEyes[i].minFilter = texturesEyes[i].magFilter = THREE.LinearFilter;
    }

    var materials = [];

    materials[0] = new V.Shader('Spherical', {map:textures[1], morphTargets:true, skinning:true, normalMap:textures[10], env:envbase, useMap:1, useNormal:1, reflection:0.2});
    materials[1] = new V.Shader('Spherical', {map:textures[0], morphTargets:false, skinning:true, normalMap:textures[11], env:envbase, useMap:1, useNormal:1, reflection:0.2});
    materials[2] = new V.Shader('Spherical', {map:textures[0], morphTargets:false, skinning:true, normalMap:textures[11], env:envbase, useMap:1, useNormal:1, reflection:0.8});
    materials[3] = new V.Shader('Spherical', {map:textures[2], morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true, side:THREE.DoubleSide});
    materials[4] = new V.Shader('Spherical', {map:textures[3], morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    materials[5] = new V.Shader('Spherical', {map:textures[4], morphTargets:true, normalMap:textures[8], env:envbase, useMap:1, useNormal:1, reflection:0.5, transparent:true});
    materials[6] = new V.Shader('Spherical', {map:textures[5], normalMap:textures[9], env:envbase, useMap:1, useNormal:1, reflection:0.5, transparent:true});
    materials[7] = new V.Shader('Spherical', {map:textures[6], morphTargets:true, env:envbase, useMap:1, reflection:0.5});
    materials[8] = new V.Shader('Spherical', {map:textures[7], morphTargets:true, env:envbase, useMap:1, reflection:0.5});
    materials[9] = new V.Shader('Spherical', {env:envbase, reflection:1});
    materials[10] = new V.Shader('Eye', {texEyeCol:texturesEyes[0], texEyeNrm:texturesEyes[1], env:envbase, texEnvRfl:texturesEyes[2]});

    i = materials.length;
    while(i--) env.add(materials[i]);

    body.material = materials[1];
    suit.material = materials[2];
    head.material = materials[0];
    v.pool.meshes.dianna.cils.material = materials[3];
    v.pool.meshes.dianna.eyeL_lo.material = materials[4];
    v.pool.meshes.dianna.teethLower.material = materials[5];
    v.pool.meshes.dianna.teethUpper.material = materials[6];
    v.pool.meshes.dianna.sock.material = materials[7];
    v.pool.meshes.dianna.tongue.material = materials[8];
    v.pool.meshes.dianna.necklace.material = materials[9];
    v.pool.meshes.dianna.necklace.visible = false;

    // create eyes
    eyel = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), materials[10] );
    eyer = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), materials[10] );
    eyel.rotation.x = V.PI;
    eyer.rotation.x = V.PI;
    eyel.position.set(3.87,1.25,3);
    eyer.position.set(3.87,-1.25,3);
    eyel.scale.set(1,1,-1);
    eyer.scale.set(1,1,-1);
    var headBone = body.skeleton.bones[20];
    headBone.add(eyel);
    headBone.add(eyer);

    body.animations[0].stop(0);
    body.animations[1].play(0);
    body.animations[2].stop(0);

    v.scene.add(body);
    v.scene.add(suit);
	v.scene.add(head);
}