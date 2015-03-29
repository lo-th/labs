var timedEffects = [];
var isSerious = false;
var noiseTexture, seriously, simplex, noiseTarget, glitch, chroma, vignette, blend;
var b1, b2, actif = '', prevy=0, prevr = 0;
var v = new V.View(110, 65, 100);
//v.mirror(300, {pos:new THREE.Vector3(0,-14.2,0)});

v.tell('seriously<br><br>Move tv button bro !');
v.pool.load('tv', onload);

v.zone({s:200, type:'plane', pos:[19,8.5,10]});
v.zone({s:10, type:'plane', pos:[19,13.5,14]});
v.zone({s:10, type:'plane', pos:[19,3.5,14]});

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

    var reformat = seriously.transform('reformat');
	reformat.width = 1024;
	reformat.height = 800;
	reformat.mode = 'distort';
	importImage('mire.jpg', reformat);


	vignette = seriously.effect('vignette');
    vignette.source = reformat;

    //chroma = seriously.effect('chroma');
    //chroma.source = reformat;

    glitch = seriously.effect('tvglitch');
    glitch.verticalSync = 0;
    glitch.source = vignette;
    timedEffects.push(glitch);

    blend = seriously.effect('blend');
    blend.bottom = simplex;
	blend.top = glitch;
	blend.opacity = 0;
	blend.mode = 'blend';


    noiseTarget = seriously.target(noiseTexture, { canvas:v.canvas });
    noiseTarget.source = blend;

    seriously.go();
}

function onload(){
    var m = v.pool.meshes.tv;
    m.tv.scale.set(4,4,-4);
    m.screen.scale.set(4,4,-4);
    m.border.scale.set(4,4,-4);
    m.ground.scale.set(4,4,-4);

    var cc = new THREE.Group();
    cc.add(m.tv);
    cc.add(m.screen);
    cc.add(m.border);
    cc.add(m.ground);
    cc.position.y = -14;
    v.scene.add(cc);

    var tx = THREE.ImageUtils.loadTexture( 'images/tv.jpg');
    var tx2 = THREE.ImageUtils.loadTexture( 'images/tvground.jpg');
    tx.flipY = false;
    tx2.flipY = false;

    var tvmat = new THREE.MeshBasicMaterial( { map:tx, envMap:v.environment, reflectivity:0.4 });
    m.tv.material = tvmat;
    b1 = m.tv.children[1];
    b2 = m.tv.children[0];
    b1.material = tvmat;
    b2.material = tvmat;
    m.border.material = new THREE.MeshBasicMaterial( { color:0x292421, envMap:v.environment, reflectivity:0.4 });
    m.screen.material = new THREE.MeshBasicMaterial( { color:0XFFFFFF, envMap:v.environment, reflectivity:0.4 });
    m.ground.material = new V.Shader('MapShad', {tmap:tx2});
    initSerious(m.screen.material);
}

function importImage(url, dest){
	var img = document.createElement("IMG");
	img.src = "images/"+url;
	img.onload = function(e){  
		//return img;
		dest.source = img;
	}
}

function mainDown(){
	down = true;
	if(v.nav.selectName == 'zone1'){ actif = 'b1'; prevy=v.nav.mouse3d.y; prevr=b1.rotation.y; }
	else if(v.nav.selectName == 'zone2'){ actif = 'b2'; prevy=v.nav.mouse3d.y; prevr=b2.rotation.y; }
	else actif = '';

	if(actif!=='') v.nav.mouse.move = false;
	else v.nav.mouse.move = true;
}

function mainMove(){
	if (actif!=='') {
		var r = ((v.nav.mouse3d.y-prevy)*5)*V.ToRad;
		if(actif == 'b1') {b1.rotation.y = r + prevr; blend.opacity = V.abs(v.nav.unwrapRadian(b1.rotation.y)*0.5);}
		if(actif == 'b2') {
			b2.rotation.y = r + prevr;
			var val = V.abs(v.nav.unwrapRadian(b2.rotation.y)*0.5);
			glitch.distortion = val;
			glitch.verticalSync = val;
		}
	}
}

function mainUp(){
	actif='';
	v.nav.mouse.move = true;
}