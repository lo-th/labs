var v = new V.View(180, 45, 130);
v.tell('human');
v.pool.load('dianna', onload, true);
var head, body, mathead, matbody;
var bodyBones = {};
var headBones = {};
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
v.nav.target.y = 40;
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

	head.setWeight("neck", 1);
    head.setWeight("earOut", 0.6);
    head.setWeight("surprise", 1);

	head.scale.set(size,size,size);
    body.scale.set(size,size,size);

    matHead = new V.Shader('Spherical', {skinning:true, morphTargets:true, env:envbase, useMap:1, reflection:0.6});
    matBody = new V.Shader('Spherical', {skinning:true, morphTargets:false, env:envbase, useMap:1, reflection:0.6});

    body.material = matBody;
    head.material = matHead;

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
        console.log(name)
    }

    body.animations[0].stop(0);
    body.animations[1].play(0);
    body.animations[2].stop(0);

    head.animations[0].stop(0);
    head.animations[1].play(0);
    head.animations[2].stop(0);

    upBone()

    v.scene.add(body);
	v.scene.add(head);
}

function upBone(){
    for(var key in headBones){
        var mtx = bodyBones[key].matrix.clone();
        headBones[key].matrix.copy(mtx)
        headBones[key].matrixAutoUpdate = false;
    }
}