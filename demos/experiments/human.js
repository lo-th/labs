var v = new V.View(-110, 68, 30);
v.tell('Human');
var m = {};
var gui = new V.Gui(false);
var morphsTables = [];
var morphConfig = {
    sad: 0, anger: 0, smileOpen: 0, fear: 0, disgust: 0, surprise: 0, smileClose: 0, blinkRight:0, blinkLeft:0,
    aah: 0, bigaah: 0, ch_j_sh: 0, f_v: 0, i: 0, k: 0, ee: 0,
    b_m_p: 0, n: 0, oh: 0, r: 0, d_s_t: 0, th: 0, w: 0, eh: 0, ooh_q:0
};
var eyeTime = 0;
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
var isModelLoaded = false;
v.pool.load('dianna', onload);
v.nav.target.y = 60;
v.nav.revers();
v.nav.moveCamera();

loop();

function loop(){
    requestAnimationFrame( loop );
    if(isModelLoaded) eyeUpdate();
    v.render();
}

function onload(){
	var size = 1;

    for(var key in v.pool.meshes.dianna) m[key] = v.pool.meshes.dianna[key];

    m.suit.skeleton = m.body.skeleton;
    m.head.skeleton = m.body.skeleton;

	m.head.setWeight("neck", 1);
    //head.setWeight("earOut", 0.6);

	m.head.scale.set(size,size,size);
    m.body.scale.set(size,size,size);
    m.suit.scale.set(size,size,size);

    var texNames = [
        'body.jpg','head.jpg','hair.png','eye_cont.png',
        'teeth.png','mouth.jpg',
        'teeth_n.jpg','hair_n.jpg','head_n.jpg','body_n.jpg', 'mouth_n.jpg',
        'eye.jpg','eye_n.png','eye_r.jpg'
    ];

    v.impool.load('images/dianna/', texNames, onimageload);

}

function onimageload(){

    var textures = {};
    for(var key in v.impool.imgs){
        console.log(key)
        if(key=='eye' || key=='eye_n' || key=='eye_r') textures[key] = v.impool.texture(key, true, true, true, true);
        else textures[key] = v.impool.texture(key);
    }

    var materials = [];

    materials[0] = new V.Shader('Spherical', {map:textures.head, morphTargets:true, skinning:true, normalMap:textures.head_n, env:envbase, useMap:1, useNormal:1, reflection:0.2});
    materials[1] = new V.Shader('Spherical', {map:textures.body, morphTargets:false, skinning:true, normalMap:textures.body_n, env:envbase, useMap:1, useNormal:1, reflection:0.2});
    materials[2] = new V.Shader('Spherical', {map:textures.body, morphTargets:false, skinning:true, normalMap:textures.body_n, env:envbase, useMap:1, useNormal:1, reflection:0.8});
    materials[3] = new V.Shader('Spherical', {map:textures.hair, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true, side:THREE.DoubleSide});
    materials[4] = new V.Shader('Spherical', {map:textures.eye_cont, morphTargets:true, env:envbase, useMap:1, reflection:0.5, transparent:true});
    materials[5] = new V.Shader('Spherical', {map:textures.teeth, morphTargets:true, normalMap:textures.teeth_n, env:envbase, useMap:1, useNormal:1, reflection:0.1, transparent:true, side:THREE.DoubleSide});
    materials[6] = new V.Shader('Spherical', {map:textures.teeth, normalMap:textures.teeth_n, env:envbase, useMap:1, useNormal:1, reflection:0.1, transparent:true, side:THREE.DoubleSide});
    materials[7] = new V.Shader('Spherical', {map:textures.mouth, normalMap:textures.mouth_n, morphTargets:true, env:envbase, useMap:1, useNormal:1, reflection:0.2, side:THREE.DoubleSide});
    materials[8] = new V.Shader('Spherical', {env:envbase, reflection:1});
    materials[9] = new V.Shader('Spherical', {map:textures.hair, normalMap:textures.hair_n, env:envbase, useMap:1, useNormal:1, reflection:0.5, transparent:true});
    materials[10] = new V.Shader('Eye', {texEyeCol:textures.eye, texEyeNrm:textures.eye_n, env:envbase, texEnvRfl:textures.eye_r});

    i = materials.length;
    while(i--) env.add(materials[i]);

    m.head.material = materials[0];
    m.body.material = materials[1];
    m.suit.material = materials[2];
    
    m.cils.material = materials[3];
    m.eyeL_lo.material = materials[4];
    m.teethLower.material = materials[5];
    m.teethUpper.material = materials[6];
    m.sock.material = materials[7];
    m.tongue.material = materials[7];
    m.necklace.material = materials[8];
    m.necklace.visible = false;
    m.hairn.material = materials[9];

    // create eyes
    eyel = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), materials[10] );
    eyer = new THREE.Mesh( new THREE.SphereGeometry( 0.53, 32,16 ), materials[10] );
    eyel.rotation.x = V.PI;
    eyer.rotation.x = V.PI;
    eyel.position.set(3.87,1.25,3);
    eyer.position.set(3.87,-1.25,3);
    eyel.scale.set(1,1,-1);
    eyer.scale.set(1,1,-1);
    var headBone = m.body.skeleton.bones[20];
    headBone.add(eyel);
    headBone.add(eyer);

    m.body.animations[0].stop(0);
    m.body.animations[1].play(0);
    m.body.animations[2].stop(0);

    v.scene.add(m.body);
    v.scene.add(m.suit);
	v.scene.add(m.head);

    initMorph();

    isModelLoaded = true;
}

function initMorph(){
    var mName;
    for (var j=0; j < m.head.geometry.morphTargets.length; j++){
        mName = m.head.geometry.morphTargets[j].name;
        morphsTables[mName] = { 
            cils:testMorph(m.cils, mName),
            tdown:testMorph(m.teethLower, mName), 
            eye:testMorph(m.eyeL_lo, mName), 
            tongue:testMorph(m.tongue, mName), 
            sock:testMorph(m.sock, mName)
        }
    }

    gui.gui.add( morphConfig, 'sad', 0, 100 ).onChange( function() { applyMorph("sad"); });
    gui.gui.add( morphConfig, 'anger', 0, 100 ).onChange( function() { applyMorph("anger"); });
    gui.gui.add( morphConfig, 'smileOpen', 0, 100 ).onChange( function() { applyMorph("smileOpen"); });
    gui.gui.add( morphConfig, 'fear', 0, 100 ).onChange( function() { applyMorph("fear"); });
    gui.gui.add( morphConfig, 'disgust', 0, 100 ).onChange( function() { applyMorph("disgust"); });
    gui.gui.add( morphConfig, 'surprise', 0, 100 ).onChange( function() { applyMorph("surprise"); });
    gui.gui.add( morphConfig, 'smileClose', 0, 100 ).onChange( function() { applyMorph("smileClose"); });
}

function applyMorph( name ) {
    var value = morphConfig[name]/100;
    m.head.setWeight(name, value);
    if( morphsTables[name].cils ) m.cils.setWeight(name, value);
    if( morphsTables[name].tdown ) m.teethLower.setWeight(name, value);
    if( morphsTables[name].eye ) m.eyeL_lo.setWeight(name, value);
    if( morphsTables[name].tongue ) m.tongue.setWeight(name, value);
    if( morphsTables[name].sock ) m.sock.setWeight(name, value);
}

function testMorph(m, name){
    var result = false;
    for (var j=0; j < m.geometry.morphTargets.length; j++){
        if(m.geometry.morphTargets[j].name == name) result = true;
    }
    return result;
}

function eyeUpdate(){
    eyeTime++;
    if(eyeTime>=500 && eyeTime<=525){
        morphConfig.blinkRight +=4; morphConfig.blinkLeft +=4; 
        applyMorph( "blinkRight");
        applyMorph( "blinkLeft");
    }else if(eyeTime>=525 && eyeTime<=550){
        morphConfig.blinkRight -=4; morphConfig.blinkLeft -=4; 
        applyMorph("blinkRight");
        applyMorph("blinkLeft");
    }else if(eyeTime>=550){
        eyeTime = 0;
        morphConfig.blinkRight = 0;
        morphConfig.blinkLeft = 0;
    }   
}