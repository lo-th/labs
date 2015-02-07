var timedEffects = [];
var isSerious = false;
var noiseTexture, seriously, simplex, noiseTarget, glitch, chroma, vignette;
var v = new V.View(110, 65, 130);
v.tell('seriously');
v.pool.load('tv', onload);

loop();

function loop(){
    requestAnimationFrame( loop );
    var time = Date.now() / 50;
    for (var i = 0, l = timedEffects.length; i < l; i++) {
        timedEffects[i].time = time % 1000000;
    }
    v.renderer.setRenderTarget(noiseTexture);
    v.render();
}

function initSerious(mat){
    seriously = new Seriously();
    noiseTexture = v.addRenderTarget(1024, 1024);

    mat.map = noiseTexture;
    mat.map.flipY = false;
    mat.needsUpdate = true;

    simplex = seriously.effect('simplex');
    simplex.width = 1024;
    simplex.height = 1024;
    simplex.white = 'white';
    simplex.noiseScale = 30;
    timedEffects.push(simplex);

    vignette = seriously.effect('vignette');
    vignette.source = simplex;

    //chroma = seriously.effect('chroma');
    //chroma.source = reformat;

    glitch = seriously.effect('tvglitch');
    glitch.verticalSync = 0;
    glitch.source = vignette;
    timedEffects.push(glitch)

    noiseTarget = seriously.target(noiseTexture, { canvas:v.canvas });
    noiseTarget.source = glitch;

    seriously.go();
}

function onload(){
    var m = v.pool.meshes.tv;
    m.tv.scale.set(4,4,-4);
    m.screen.scale.set(4,4,-4);
    m.border.scale.set(4,4,-4);

    var cc = new THREE.Group();
    cc.add(m.tv);
    cc.add(m.screen);
    cc.add(m.border);
    cc.position.y = -10;
    v.scene.add(cc);

    var tx = THREE.ImageUtils.loadTexture( 'images/tv.jpg')
    tx.flipY = false;
    m.tv.material = new THREE.MeshBasicMaterial( { map:tx });
    m.border.material = new THREE.MeshBasicMaterial( { color:0x292421 });
    m.screen.material = new THREE.MeshBasicMaterial( { color:0XFFFFFF });
    initSerious(m.screen.material);
}