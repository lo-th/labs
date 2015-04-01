var v = new V.View(90, 80, 10);
var geo = [];
var player;

v.tell('third person');
// active keyboard
v.nav.bindKeys();
var env = new V.Environment();
var envbase = THREE.ImageUtils.loadTexture( 'images/spherical/e_chrome.jpg');
var fullLoaded = false;

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
    if(player){
        player.update( v.delta );
        if(fullLoaded){
            var level = player.miniMap.level;
            //console.log(player.obj.position.y)
            if(player.obj.position.y>2 && level==0){
                player.miniMap.meshs[0].visible=false; 
                player.miniMap.meshs[1].visible=true; 
                player.miniMap.changeLevel(1);
            }
            if(player.obj.position.y<2 && level==1){
                player.miniMap.meshs[0].visible=true;
                player.miniMap.meshs[1].visible=false;
                player.miniMap.changeLevel(0);
            }
        }
    }
    
}

V.deepShader={
    attributes:{},
    uniforms:{ 
        color: {type: 'c', value: new THREE.Color(0x444444)},
    	deep: {type: 'f', value:10.0}
    },
    fs:[
        //'precision lowp float;',
        'uniform vec3 color;',
        'varying vec3 vc;',
        'void main(void) { gl_FragColor = vec4(vc, 1.0); }'
    ].join("\n"),
    vs:[
        'uniform float deep;',
        'varying vec3 vc;',
        'void main(void) {',
            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            'float dy = (position.y+3.27)*12.3;',//((position.y+3.27)*deep);',
            'vc = vec3( dy / 255., dy / 255., dy / 255.);',
            //'if(position.y>0.){ vc = vec3( dy / 255., dy / 255., dy / 255.);}',//else{vc = vec3(0,0,-dy);}',
        '}'
    ].join("\n")
};

V.Minimap = function(revers, debug){
    this.level = 0;
    this.meshs = [];
	this.debug = debug || false;
    this.ar8 = typeof Uint8Array!="undefined"?Uint8Array:Array;
    this.miniSize = { w:64, h:64, f:0.25 };
    this.cc = {r:255, g:0, b:0, a:255}; 

    this.camy = 100;

    this.content = document.createElement('div');
    this.content.style.cssText = 'position:absolute; bottom:10px; right:100px; width:64px; height:64px; border:3px solid #74818b;';
    document.body.appendChild( this.content );

    this.miniGlCanvas = document.createElement('canvas');
    this.miniTop = document.createElement('canvas');
    this.mapTest = document.createElement('canvas');

    this.mmCanvas = document.createElement('canvas');
    this.mmCanvas.width = this.mmCanvas.height = 64;
    this.tmCanvas = document.createElement('canvas');
    this.tmCanvas.width = this.tmCanvas.height = 16;

    this.miniGlCanvas.width = this.miniTop.width = this.miniSize.w;
    this.miniGlCanvas.height = this.miniTop.height = this.miniSize.h;
    this.mapTest.width = 16;
    this.mapTest.height = 16;

    this.miniGlCanvas.style.cssText = 'position:absolute; top:0px; left:0px;';
    this.miniTop.style.cssText = 'position:absolute; top:0px; left:0px;';
    this.mapTest.style.cssText = 'position:absolute; top:24px; left:24px;';
    this.mmCanvas.style.cssText = 'position:absolute; top:-66px; left:0px;';

    this.content.appendChild( this.miniGlCanvas );
    this.content.appendChild( this.miniTop );
    this.content.appendChild( this.mapTest );

    //if(this.debug)body.appendChild( this.mmCanvas );
    if(this.debug)this.content.appendChild( this.mmCanvas );

    this.posY = 0;
    this.oldColors = [];

    this.init();
};

V.Minimap.prototype = {
    constructor: V.Minimap,
    init:function() {
        this.setMapTestSize(8);
        this.renderer = new THREE.WebGLRenderer({ canvas:this.miniGlCanvas, precision: "lowp", antialias: false });
        this.renderer.setSize( this.miniSize.w, this.miniSize.h );
        //this.renderer.sortObjects = false;
        //this.renderer.sortElements = false;
        this.renderer.setClearColor( 0xff0000, 1 );
        this.scene = new THREE.Scene();

        var w = 2//2;//6;// 500*this.miniSize.f;
        this.camera = new THREE.OrthographicCamera( -w , w , w , -w , 0.1, this.camy*10 );
        this.camera.position.x = 0;
        this.camera.position.z = 0;
        this.camera.position.y = this.camy;
        this.camera.lookAt( new THREE.Vector3(0,0,0) );

        this.player = new THREE.Object3D();
        this.player.position.set(0,0,0);
        this.scene.add(this.player);
        this.player.add(this.camera);

        this.gl = this.renderer.getContext();
        this.initTopMap();

        this.deepShader = new THREE.ShaderMaterial({
            uniforms: V.deepShader.uniforms,
            vertexShader: V.deepShader.vs,
            fragmentShader: V.deepShader.fs
        });
    },
    addGeometry:function(geo){
        var mesh = new THREE.Mesh( geo, this.deepShader);
        //mesh.scale.set(1,1,-1);
        mesh.position.set(0,0,0);
        this.scene.add(mesh);
    },
    add:function(mesh, s, decal){
        //var mesh = new THREE.Mesh( geo, );
        mesh.material = this.deepShader;
        mesh.scale.set(s,s,-s);
        mesh.position.set(0,decal,0);
        this.scene.add(mesh);
        this.meshs[this.meshs.length] = mesh;
    },
    updatePosition:function(v,r){
    	this.player.position.copy(v);
        this.player.rotation.y = r;

    },
    drawMap:function(){
        this.renderer.render( this.scene, this.camera );
        this.gl.readPixels(this.zsize[0], this.zsize[1], this.zsize[2], this.zsize[2], this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.zone);

        if(this.debug){
        	// revers y pixel data
	        var m = 0, n =  0;
	        for(var y = 15; y>=0; y--){
	            for(var x = 0; x<16; x++){
	                n = ((y*16)*4)+(x*4);
	                this.zoneInv[m+0] = this.zone[n+0];
	                this.zoneInv[m+1] = this.zone[n+1];
	                this.zoneInv[m+2] = this.zone[n+2];
	                this.zoneInv[m+3] = this.zone[n+3];
	                m+=4
	            }
	        }
	        this.drawBIGMap();
	    }

        // collision
        var i = 8;//9;
        while(i--){ this.lock[i] = this.colorTest(this.pp[i]); }

        // height
        this.posY = this.zone[this.pp[8]+1]/10;
        //this.player.position.y = this.posY;

        if(this.ctxTest) this.drawMapTest();
        
    },
    drawBIGMap:function(){
        var c = this.mmCanvas;
        var ctx2 = c.getContext('2d');
        var ctx = this.tmCanvas.getContext('2d');
        var image = ctx.getImageData(0, 0, 16, 16);
        var i = this.zoneInv.length;
        while(i--) image.data[i] = this.zoneInv[i];
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, 16, 16);
        ctx.putImageData(image, 0, 0);
        var imageObject=new Image();
        imageObject.onload=function(){
            ctx2.clearRect(0,0,64,64);
            ctx2.drawImage(imageObject,0,0, 64, 64);
        }
        imageObject.src=this.tmCanvas.toDataURL();
    },
    colorTest:function(n){
        var b=0, z=this.zone, c=this.cc, w = this.oldColors[n] || 0;
        // test out
        if(z[n]==c.r && z[n+1]==c.g && z[n+2]==c.b && z[n+3]==c.a) b = 1;
        // test max height
        //if((z[n]-w) > 10) b = 1;
        //else this.oldColors[n] = z[n];
        return b;
    },
    changeLevel:function(n){
        
        var i = 8;//9;
        while(i--){ this.oldColors[this.pp[i]] = this.zone[this.pp[i]]; }
        this.level = n;
        //this.zone = new V.AR8(max);
        //this.zoneInv = new V.AR8(max);
    },
    setMapTestSize:function(s){
        this.zsize = [(this.miniSize.w*0.5)-s, (this.miniSize.h*0.5)-s, s*2];
        this.lock =  [0,0,0,0, 0,0,0,0];
        var max =((s*2)*(s*2))*4;

        //[          front,  back,  left,        right,                fl,   fr,     bl,  br,       middle];
        //             0       1      2             3                  4     5       6    7         8
        this.pp = [max-(s*4), s*4, max*0.5, max*0.5 + (((s*4)*2)-4), 211*4, 222*4, 34*4, 45*4,  max*0.5+(s*4)];

        this.zone = new V.AR8(max);
        this.zoneInv = new V.AR8(max);
    },
    initTopMap:function(){
        var ctx3 = this.miniTop.getContext("2d");
        ctx3.fillStyle = 'black';
        ctx3.fillRect(0, 0, 1, this.miniSize.h);
        ctx3.fillRect(this.miniSize.w-1, 0, 1, this.miniSize.h);
        ctx3.fillRect(1, 0, this.miniSize.w-2, 1);
        ctx3.fillRect(1,this.miniSize.h-1, this.miniSize.w-2, 1);
        ctx3.save();
        ctx3.translate((this.miniSize.w*0.5), (this.miniSize.h*0.5));
        this.drawPlayer(ctx3);
        ctx3.restore();

        this.ctxTest = this.mapTest.getContext("2d");
    },
    drawMapTest:function() {
        this.ctxTest.clearRect ( 0 , 0 , 16 , 16 );
        var id = this.ctxTest.createImageData(16,16);
        var d  = id.data;
        var i = 8;//7;
        while(i--) d[i] = 0;

        if(this.lock[1]) this.dp(d, this.pp[0]);
        if(this.lock[0]) this.dp(d, this.pp[1]);
        if(this.lock[2]) this.dp(d, this.pp[2]);
        if(this.lock[3]) this.dp(d, this.pp[3]);
        if(this.lock[4]) this.dp(d, this.pp[6]);
        if(this.lock[5]) this.dp(d, this.pp[7]);
        if(this.lock[6]) this.dp(d, this.pp[4]);
        if(this.lock[7]) this.dp(d, this.pp[5]);
        
        this.ctxTest.putImageData( id, 0, 0);
    },
    dp:function(d, p) {
        d[p] = 255;
        d[p+1] = 255;
        d[p+3] = 255;
    },
    drawPlayer:function(ctx) {
        ctx.fillStyle = "rgba(255,255,200,0.2)";
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(30, -30);
        ctx.lineTo(-30, -30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(200,200,100,1)";
        ctx.fillRect(-2, -2, 4, 4);
    }
};

V.Player = function( debug ){
	this.obj = new THREE.Group();
	/*var shadow = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ),  new THREE.MeshBasicMaterial( { color:0x666666, transparent:true, opacity:0.5, blending:THREE.MultiplyBlending }) );
	shadow.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(90*HeroGame.ToRad));
	shadow.position.y = 0.05
	this.obj.add(shadow)*/
    this.obj.position.y = 0.5;
    v.scene.add(this.obj);

    this.velocity = new THREE.Vector3( 0, 0, 0 );
    this.rotation = new THREE.Vector3( 0, 0, 0 );
    this.newRotation = new THREE.Vector3( 0, 0, 0 );
    this.model = false;

    this.timeScale = 1;
    this.delta = 0;

    this.isMove = false;
    this.isJump = false;
    this.isFall = false;
    this.onGround = true;
    
    this.weights = {};

    this.levelOrigin = new THREE.Vector3(0,0,0);
    this.level = new THREE.Vector3(0,0,0);
    this.ease = new THREE.Vector3();
    this.easeRot = new THREE.Vector3();
    this.cfg = { speed:0.025, maxSpeed:0.25, g:9.8, posY:0, maxJump:4, maxHeight:4 };

    this.miniMap = new V.Minimap( this.revers, debug );

}

V.Player.prototype = {
    constructor: V.Player,
    addHero:function(m, size, modelname){
    	size = size || 0.023;
        this.hero = m;

        this.hero.scale.set(size,size,-size);

        this.animLength = this.hero.animations.length;
        var i = this.animLength, name;

        while(i--){
            name = this.hero.animations[i].name;
            //console.log(name)
            this.weights[name] = 0;
            if(name=='idle') this.weights[name] = 1;
            this.hero.animations[i].play( 0, this.weights[name] );
        }

        this.obj.add(this.hero);
        if(modelname=='bob'){ 
        	this.hero.position.x = 0;
        	this.hero.position.z = 0;
            this.hero.position.y = 0.9;
        }
        this.model = true;

        v.nav.target = this.getPosition().clone();
        v.nav.target.add(new THREE.Vector3(0, 1.2, 0));
        v.nav.moveCamera()
    },
    update:function(delta){
    	//TWEEN.update();
    	this.delta = delta;
    	//THREE.AnimationHandler.update( this.delta );
        this.move();
    },
    move:function(k) {
        var key = v.nav.key;

        // jumping
        if( key.space && this.onGround ){ this.isJump = true; this.onGround = false;}

        //acceleration and speed limite
        if (key.up && this.onGround) this.ease.z = (this.ease.z > this.cfg.maxSpeed) ?  this.cfg.maxSpeed : this.ease.z+this.cfg.speed;
        if (key.down && this.onGround) this.ease.z = (this.ease.z < -this.cfg.maxSpeed)? -this.cfg.maxSpeed : this.ease.z-this.cfg.speed;
        if (key.left && this.onGround) this.ease.x = (this.ease.x > this.cfg.maxSpeed) ?  this.cfg.maxSpeed : this.ease.x+this.cfg.speed;
        if (key.right && this.onGround) this.ease.x = (this.ease.x < -this.cfg.maxSpeed)? -this.cfg.maxSpeed : this.ease.x-this.cfg.speed;
        
        
        //deceleration
        if (!key.up && !key.down) {
            if (this.ease.z > this.cfg.speed) this.ease.z -= this.cfg.speed;
            else if (this.ease.z < -this.cfg.speed) this.ease.z += this.cfg.speed;
            else this.ease.z = 0;
        }
        if (!key.left && !key.right) {
            if (this.ease.x > this.cfg.speed) this.ease.x -= this.cfg.speed;
            else if (this.ease.x < -this.cfg.speed) this.ease.x += this.cfg.speed;
            else this.ease.x = 0;
        }

        // ease
        var mx = 0;
        var mz = 0;
        if(this.ease.z!==0 || this.ease.x!==0){
            if(this.ease.z>0){this.WalkFront(); mz = 1;}
            else if(this.ease.z<0){this.WalkBack(); mz = -1;}
	        if(this.ease.x<0){this.stepLeft(mz);mx=-1}
	        else if(this.ease.x>0){this.stepRight(mz);mx=1;}
        } else {
            this.stopWalk();
        }
        
        // stop if no move
        if (this.ease.x == 0 && this.ease.z == 0 && !v.nav.mouse.down && this.onGround) return;
        
        // find direction of player
        this.easeRot.y = v.nav.cam.horizontal * V.ToRad;
        var rot =  v.nav.unwrapDegrees(Math.round(v.nav.cam.horizontal));
        this.easeRot.x = Math.sin(this.easeRot.y) * this.ease.x + Math.cos(this.easeRot.y) * this.ease.z;
        this.easeRot.z = Math.cos(this.easeRot.y) * this.ease.x - Math.sin(this.easeRot.y) * this.ease.z;

        this.setRotation(-(this.easeRot.y+(90*V.ToRad)));

        this.level.x = this.levelOrigin.x-this.easeRot.x;
        this.level.z = this.levelOrigin.z+this.easeRot.z;

        // update 2d map
        //this.miniMap.updatePosition(this.levelOrigin, -this.easeRot.y);
        this.miniMap.drawMap();

        // test pixel collision
        var nohitx = 0;
        var nohitz = 0;
        var lock = this.miniMap.lock;
     
    	if(rot >= 45 && rot <= 135){
            if(this.level.z < this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
            if(this.level.z > this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
            if(this.level.x < this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
            if(this.level.x > this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
        } else if (rot <= -45 && rot >= -135){
            if(this.level.z > this.levelOrigin.z) if(!lock[0] && !lock[4] && !lock[5]) nohitz = 1;
            if(this.level.z < this.levelOrigin.z) if(!lock[1] && !lock[6] && !lock[7]) nohitz = 1;
            if(this.level.x > this.levelOrigin.x) if(!lock[2] && !lock[4] && !lock[6]) nohitx = 1;
            if(this.level.x < this.levelOrigin.x) if(!lock[3] && !lock[5] && !lock[7]) nohitx = 1;
        } else if (rot < 45 && rot > -45){
            if(this.level.z > this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
            if(this.level.z < this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
            if(this.level.x < this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
            if(this.level.x > this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
        } else {
            if(this.level.z < this.levelOrigin.z) if(!lock[2] && !lock[4] && !lock[6]) nohitz = 1;
            if(this.level.z > this.levelOrigin.z) if(!lock[3] && !lock[5] && !lock[7]) nohitz = 1;
            if(this.level.x > this.levelOrigin.x) if(!lock[0] && !lock[4] && !lock[5]) nohitx = 1;
            if(this.level.x < this.levelOrigin.x) if(!lock[1] && !lock[6] && !lock[7]) nohitx = 1;
        }

        this.level.y = this.miniMap.posY + this.cfg.posY;
        var diff = Math.abs(this.levelOrigin.y - this.level.y);

        //this.levelOrigin.y = this.level.y;
        if(this.levelOrigin.y>this.level.y){ // down
        	if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        	else{ this.isFall = true; this.onGround=false;} 
        } else {
        	if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        	//else {nohitz=0; nohitx=0}
        }

        if(nohitx)this.levelOrigin.x = this.level.x;
        if(nohitz)this.levelOrigin.z = this.level.z;

        /*var diff = Math.abs(this.levelOrigin.y - this.level.y);
        if(diff<this.cfg.maxHeight) this.levelOrigin.y = this.level.y;
        else{ this.isFall = true; this.onGround=false;} */


        // gravity
        if(this.isJump){
        	this.ease.y += this.cfg.g * this.delta;
            if(this.ease.y>this.cfg.maxJump){ this.isFall = true; this.isJump = false; }
        }
        if(this.isFall){
        	this.ease.y -= this.cfg.g * this.delta;
        	if(diff<this.cfg.maxHeight && this.ease.y<0){  this.isFall = false; this.ease.y = 0; this.onGround=true; }
        	//if(this.ease.y<0){ this.isFall = false; this.ease.y = 0; this.onGround=true; }
        }
       
        //if(this.ease.y>this.cfg.maxJump) this.ease.y -= this.cfg.g * this.delta;

        this.levelOrigin.y += this.ease.y;

        // update 2d map
        this.miniMap.updatePosition(this.levelOrigin, -this.easeRot.y);

        //this.player.position.lerp(this.levelOrigin, 0.1);
        this.lerp(this.levelOrigin, 0.5);
        //this.lerp(this.levelOrigin, this.delta);

        v.nav.target = this.getPosition().clone();
        v.nav.target.add(new THREE.Vector3(0, 1.2, 0));
        v.nav.moveCamera();
    },
    getPosition:function(){
    	return this.obj.position;
    },
    setPosition:function(x,y,z){
    	this.obj.position.set(x,y,z);
    },
    setRotation:function(y){
        this.rotation.y = y;
        if(this.isMove){
            this.newRotation.lerp(this.rotation, 0.25);
            this.obj.rotation.y = this.newRotation.y;
         }
    },
    lerp:function(v,f){
    	this.obj.position.lerp(v,f);
    },
    WalkFront:function(){
        if(this.model){
            this.timeScale=1;
            this.easing({idle:0, walk:1, step_left:0, step_right:0});    
        }
        this.isMove = true;
    },
    WalkBack:function(){
        if(this.model){
            this.timeScale=-1;
            this.easing({idle:0, walk:1, step_left:0, step_right:0});  
        }
        this.isMove = true;
    },
    stepLeft:function(){
        if(this.model){
            this.easing({idle:0, walk:0, step_left:1, step_right:0});
            
        }
        this.isMove = true;
    },
    stepRight:function(){
        if(this.model){
            this.easing({idle:0, walk:0, step_left:0, step_right:1});
        }
        this.isMove = true;
    },
    stopWalk:function(){
        if(this.model){
            if(this.weights['walk']!==0 || this.weights['step_right']!==0 || this.weights['step_left']!==0){ 
                this.easing({idle:1, walk:0, step_left:0, step_right:0});       
            }
        }
        this.isMove = false;
    },
    easing:function(newWeights){
    	var _this = this;
        this.tween = new TWEEN.Tween( this.weights )
            .to( newWeights, 200 )
            .easing( TWEEN.Easing.Linear.None )
            .onUpdate( function () {_this.weight()} )
            .start();
    },
    weight:function(t){
        var i = this.animLength, name;
        while(i--){
        	name = this.hero.animations[i].name;
        	this.hero.animations[i].weight = this.weights[name];
            if(name=='walk'){
                this.hero.animations[i].timeScale = this.timeScale;
            }
        }
    }

}

var modelName = 'bob';

player = new V.Player(true);
v.pool.load('museum', onload);

function onload(){
    var sc = 1.23;
    var decal = 3.27*sc;
	player.miniMap.add(v.pool.meshes.museum.floor_0, sc, decal);
    player.miniMap.add(v.pool.meshes.museum.floor_1, sc, decal);

    player.miniMap.meshs[1].visible=false;

    var tx0 = THREE.ImageUtils.loadTexture( 'images/museum/facade.png');
    var tx1 = THREE.ImageUtils.loadTexture( 'images/museum/escalator.png');
    var tx2 = THREE.ImageUtils.loadTexture( 'images/museum/floor.jpg');
    var tx3 = THREE.ImageUtils.loadTexture( 'images/museum/bigwall.jpg');
    var tx4 = THREE.ImageUtils.loadTexture( 'images/museum/floor2.jpg');
    tx0.flipY = false;
    tx1.flipY = false;
    tx2.flipY = false;
    tx3.flipY = false;
    tx4.flipY = false;

    var material0 = new V.Shader('Spherical', { map:tx0, env:envbase, useMap:1, reflection:0.2, transparent:false });
    var material1 = new V.Shader('Spherical', { map:tx1, env:envbase, useMap:1, reflection:0.2, transparent:false });
    var material2 = new V.Shader('Spherical', { map:tx2, env:envbase, useMap:1, reflection:0.2 });
    var material3 = new V.Shader('Spherical', { map:tx3, env:envbase, useMap:1, reflection:0.2 });
    var material4 = new V.Shader('Spherical', { map:tx0, env:envbase, useMap:1, reflection:0.2, transparent:true, side:THREE.DoubleSide });
    var material5 = new V.Shader('Spherical', { map:tx1, env:envbase, useMap:1, reflection:0.2, transparent:true,  side:THREE.DoubleSide });
    var material6 = new V.Shader('Spherical', { map:tx4, env:envbase, useMap:1, reflection:0.2 });

    env.add(material0);
    env.add(material1);
    env.add(material2);
    env.add(material3);
    env.add(material4);
    env.add(material5);
    env.add(material6);
    
    var names = ['facade', 'elevator','facade_w','elevator_w','floor','bigwall', 'floor2'];
    var i = names.length, m, name;
    while(i--){
        name = names[i];
        m = v.pool.meshes.museum[names[i]];
        m.scale.set(sc,sc,-sc);
        m.position.y = decal;
        v.scene.add(m);

        if(m.name == "facade"){ m.material = material0; }
        if(m.name == "elevator"){ m.material = material1; }
        if(m.name == "facade_w"){ m.material = material4; }
        if(m.name == "elevator_w"){ m.material = material5;}

        if(m.name == "floor"){ m.material = material2;  }
        if(m.name == "floor2"){ m.material = material6;  }
        if(m.name == "bigwall"){ m.material = material3;  }

    }

	v.pool.load(modelName, onloadNext);

    fullLoaded = true;
}

function onloadNext(){
	var model = v.pool.meshes[modelName][modelName].clone();
	
	var map = model.material.map;
	var size = 0.023, morph = false;
	if(modelName=='droid'){ size = 0.01; morph = true; }
	var material = new V.Shader('Spherical', {skinning:true, morphTargets:morph, map:map, env:envbase, useMap:1, reflection:0.6});

	env.add(material);

	model.material = material;

	player.addHero(model, size, modelName);
}
