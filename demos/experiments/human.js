var v = new V.View(180, 45, 130);
v.tell('human');
v.pool.load('dianna', onload, true);
var head, body, suit, mathead, matbody, matSuit, matCils, matEyeL_lo, matTeethLower, matTeethUpper, matSock, matTongue, matEye;
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
    //head.skeleton = body.skeleton;

	head.setWeight("neck", 1);
    //head.setWeight("earOut", 0.6);
    //head.setWeight("surprise", 1);

	head.scale.set(size,size,size);
    body.scale.set(size,size,size);
    suit.scale.set(size,size,size);

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

    matHead = new V.Shader('Spherical', {map:textures[1], normalMap:textures[10], skinning:true, morphTargets:true, env:envbase, useMap:1, useNormal:1, reflection:0.2});
    matBody = new V.Shader('Spherical', {map:textures[0], normalMap:textures[11], skinning:true, morphTargets:false, env:envbase, useMap:1, useNormal:1, reflection:0.2});
    matSuit = new V.Shader('Spherical', {map:textures[0], normalMap:textures[11], skinning:true, morphTargets:false, env:envbase, useMap:1, useNormal:1, reflection:0.8});
    matCils = new V.Shader('Spherical', {map:textures[2], morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true, side:THREE.DoubleSide});
    matEyeL_lo = new V.Shader('Spherical', {map:textures[3], morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    matTeethLower = new V.Shader('Spherical', {map:textures[4], normalMap:textures[8], morphTargets:true, env:envbase, useMap:1, useNormal:1, reflection:0.5, transparent:true});
    matTeethUpper = new V.Shader('Spherical', {map:textures[5], normalMap:textures[9], env:envbase, useMap:1, useNormal:1, reflection:0.5, transparent:true});
    matSock = new V.Shader('Spherical', {map:textures[6], morphTargets:true, env:envbase, useMap:1, reflection:0.5});
    matTongue = new V.Shader('Spherical', {map:textures[7], morphTargets:true, env:envbase, useMap:1, reflection:0.5});

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
    v.pool.meshes.dianna.sock.material = matSock;
    v.pool.meshes.dianna.tongue.material = matTongue;

    for(var j=0; j<head.skeleton.bones.length; j++){
        var bone = head.skeleton.bones[j]
        var name = bone.name;
        headBones[name] = bone;
        console.log(name)
    }

    var texEyes = [
        'eye.jpg','eye_n.png','refl.jpg'
    ];
    var texturesEyes = [];
    var i = texEyes.length;
    while(i--){
        texturesEyes[i] = THREE.ImageUtils.loadTexture( 'images/dianna/'+texEyes[i]);
        texturesEyes[i].format = THREE.RGBFormat;
        texturesEyes[i].wrapS = texturesEyes[i].wrapT = THREE.RepeatWrapping;
        texturesEyes[i].minFilter = texturesEyes[i].magFilter = THREE.LinearFilter;
    }

    matEye = new V.Shader('Eye', {texEyeCol:texturesEyes[0], texEyeNrm:texturesEyes[1], env:envbase, texEnvRfl:texturesEyes[2]});
    env.add(matEye);
    var ball = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), matEye );
    var ball2 = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), matEye );
    ball.rotation.x = V.PI;
    ball2.rotation.x = V.PI;
    ball.position.set(3.87,1.25,3);
    ball2.position.set(3.87,-1.25,3);
    ball.scale.set(1,1,-1);
    ball2.scale.set(1,1,-1);
    headBones.Bone007.add(ball);
    headBones.Bone007.add(ball2);

    body.animations[0].stop(0);
    body.animations[1].play(0);
    body.animations[2].stop(0);

    head.animations[0].stop(0);
    head.animations[1].play(0);
    head.animations[2].stop(0);

    v.scene.add(body);
    v.scene.add(suit);
	v.scene.add(head);
}