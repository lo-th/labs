var v = new V.View(180, 45, 130);
v.tell('human');
v.pool.load('dianna', onload, true);
var head, body, suit, mathead, matbody, matSuit, matCils, matEyeL_lo, matTeethLower, matTeethUpper;
var bodyBones = {};
var headBones = {};

var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');

v.nav.target.y = 40;
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

	head.setWeight("neck", 1);
    head.setWeight("earOut", 0.6);
    head.setWeight("surprise", 1);

	head.scale.set(size,size,size);
    body.scale.set(size,size,size);
    suit.scale.set(size,size,size);

    var tx0 = THREE.ImageUtils.loadTexture( 'images/dianna/full.jpg');
    var tx1 = THREE.ImageUtils.loadTexture( 'images/dianna/head.jpg');
    var tx2 = THREE.ImageUtils.loadTexture( 'images/dianna/hair.png');
    var tx3 = THREE.ImageUtils.loadTexture( 'images/dianna/eye_cont.png');
    var tx4 = THREE.ImageUtils.loadTexture( 'images/dianna/teethLow.png');
    var tx5 = THREE.ImageUtils.loadTexture( 'images/dianna/teethUp.png');
    tx0.flipY = false;
    tx1.flipY = false;
    tx2.flipY = false;
    tx3.flipY = false;
    tx4.flipY = false;
    tx5.flipY = false;


    matHead = new V.Shader('Spherical', {map:tx1, skinning:true, morphTargets:true, env:envbase, useMap:1, reflection:0.4});
    matBody = new V.Shader('Spherical', {map:tx0, skinning:true, morphTargets:false, env:envbase, useMap:1, reflection:0.4});
    matSuit = new V.Shader('Spherical', {map:tx0, skinning:true, morphTargets:false, env:envbase, useMap:1, reflection:0.8});
    matCils = new V.Shader('Spherical', {map:tx2, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    matEyeL_lo = new V.Shader('Spherical', {map:tx3, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    matTeethLower = new V.Shader('Spherical', {map:tx4, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    matTeethUpper = new V.Shader('Spherical', {map:tx5, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});

    env.add(matHead);
    env.add(matBody);
    env.add(matSuit);

    body.material = matBody;
    suit.material = matSuit;
    head.material = matHead;
    v.pool.meshes.dianna.cils.material = matCils;
    v.pool.meshes.dianna.eyeL_lo.material = matEyeL_lo;
    v.pool.meshes.dianna.teethLower.material = matTeethLower;
    v.pool.meshes.dianna.teethUpper.material = matTeethUpper;
    //v.pool.meshes.dianna.cils.material = matCils;

    for(var j=0; j<body.skeleton.bones.length; j++){
        var bone = body.skeleton.bones[j]
        var name = bone.name;
        bodyBones[name] = bone;
        if(name='Bone006')bone.add(head);
    }

    for(var j=0; j<head.skeleton.bones.length; j++){
        var bone = head.skeleton.bones[j]
        var name = bone.name;
        //headBones[name] = bone;
        //bone.matrix.copy(bodyBones[name].matrix)
        //bone.matrixWorld.copy(bodyBones[name].matrixWorld)
        //if(name='Bone006')bone.matrixWorld = bodyBones[name].matrixWorld.clone() ;
        //bone.matrixAutoUpdate = false;
       // bone.matrixWorldNeedsUpdate = true;
        //console.log(name)
    }

    body.animations[0].stop(0);
    body.animations[1].play(0);
    body.animations[2].stop(0);

    head.animations[0].stop(0);
    head.animations[1].play(0);
    head.animations[2].stop(0);

    /*suit.animations[0].stop(0);
    suit.animations[1].play(0);
    suit.animations[2].stop(0);*/

    upBone()

    v.scene.add(body);
    v.scene.add(suit);
	v.scene.add(head);
}

function upBone(){
    for(var key in headBones){
        var mtx = bodyBones[key].matrix.clone();
        headBones[key].matrix.copy(mtx)
        headBones[key].matrixAutoUpdate = false;
    }
}