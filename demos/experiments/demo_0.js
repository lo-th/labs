var timedEffects = [];
var isSerious = false;
var noiseTexture, seriously, simplex, noiseTarget;
var v = new V.View(180, 45, 130);
v.tell('Seriously.js basic');
v.ground();

loop();
initSerious();

function loop(){
    requestAnimationFrame( loop );
    var time = Date.now() / 50;
    for (var i = 0, l = timedEffects.length; i < l; i++) {
        timedEffects[i].time = time % 1000000;
    }
    v.renderer.setRenderTarget(noiseTexture);
    v.render();
}

function initSerious(){
    seriously = new Seriously();

    //var gl = v.renderer.domElement.getContext('webgl') ||
         //   v.renderer.domElement.getContext('experimental-webgl');

    noiseTexture = v.addRenderTarget(1024, 1024);

    v.mat.base.map = noiseTexture;
    v.mat.base.needsUpdate = true;
    v.mat.base.color.setHex(0XFFFFFF)

    simplex = seriously.effect('simplex');
    simplex.width = 1024;
    simplex.height = 1024;
    simplex.white = 'white';
    simplex.noiseScale = 30;
    timedEffects.push(simplex);

    noiseTarget = seriously.target(noiseTexture, { canvas:v.canvas });
  //  noiseTarget = seriously.target(noiseTexture, { canvas:v.renderer.context });
    noiseTarget.source = simplex;

    seriously.go();
}