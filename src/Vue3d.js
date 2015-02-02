'use strict';
var canvas, info, debug;
var THREE, mainClick, mainDown, mainUp, mainMove, mainRay, v, dat, shader;
var V = {};
var TWEEN = TWEEN || null;
V.AR8 = typeof Uint8Array!="undefined"?Uint8Array:Array;
V.AR16 = typeof Uint16Array!="undefined"?Uint16Array:Array;
V.AR32 = typeof Float32Array!="undefined"?Float32Array:Array;

V.PI = Math.PI;
V.PI90 = Math.PI*0.5;
V.PI270 = V.PI+V.PI90;
V.TwoPI = 2.0 * Math.PI;
V.ToRad = Math.PI / 180;
V.Resolution = { w:1600, h:900, d:200, z:10, f:40 };
V.sqrt = Math.sqrt;
V.abs = Math.abs;
V.max = Math.max;
V.pow = Math.pow;
V.floor = Math.floor;
V.round = Math.round;
V.lerp = function (a, b, percent) { return a + (b - a) * percent; }
V.rand = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 3)*1;}
V.randInt = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 0)*1;}

V.MeshList = [ 'plane', 'sphere', 'skull', 'skullhigh', 'head', 'woman', 'babe'];

V.Main = null;

V.View = function(h,v,d){
    this.dimentions = {w:window.innerWidth,  h:window.innerHeight, r:window.innerWidth/window.innerHeight };

	this.canvas = canvas;
    this.debug = debug;
    this.info = info;

    this.renderer = new THREE.WebGLRenderer({canvas:canvas, precision: "mediump", antialias:true, alpha: true, stencil:false });
    this.renderer.setSize( this.dimentions.w, this.dimentions.h );
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.autoClear = false;

    this.clock = new THREE.Clock();

    this.z = null;

    this.scene = new THREE.Scene();
    this.nav = new V.Nav(this,h,v,d);
    this.base = new THREE.Group();
    this.content = new THREE.Group();
    this.skinned = new THREE.Group();
    this.scene.add(this.base);
    this.scene.add(this.content);
    this.scene.add(this.skinned);
    this.initGeo();
    this.initMat();
    this.pool = new V.SeaPool();

    this.postEffect = null;

    this.deb = '';
    this.f = [0,0,0,0];

    this.meshs = [];

    this.lines = [];
    this.anchors = {};

    this.ps = [];

    this.model = "skull";
    this.basic = null;

    this.w = null;
    this.isW = false;

    this.isWithSerious = false;

	var _this = this;
	window.onresize = function(e) {_this.resize(e)};
}

V.View.prototype = {
    constructor: V.View,
    render:function(){
        var i;
        
        // worker test
        if(this.w && !this.isW){
            var _this = this;
            if(this.w.isReady){ this.wFun(); this.isW=true; }
        }

        // serious update
        if(this.isWithSerious) this.renderer.resetGLState();
        // tween update
		if(TWEEN)TWEEN.update();
        // three animation update
    	THREE.AnimationHandler.update( this.clock.getDelta() );
        // render
        if(this.postEffect!==null){
            this.postEffect.render();
        }else{
            this.renderer.render( this.scene, this.nav.camera );
        }

        var f = this.f;
        f[0] = Date.now();
        if (f[0]-1000 > f[1]){ f[1] = f[0]; f[3] = f[2]; f[2] = 0; } f[2]++;
        this.debug.innerHTML ='three ' + f[3] + ' fps'+ this.deb;
    },
    initGui:function(isWithModel){
        this.gui = new V.Gui(isWithModel);
    },
    ssao:function(adv){
        this.postEffect = new V.PostEffect(this,'ssao', adv);
    },
    deformSsao:function( g, map ){
        this.postEffect.deformSsao( g, map );
    },
    resize:function(){
    	this.dimentions.w = window.innerWidth;
		this.dimentions.h = window.innerHeight;
		this.dimentions.r = this.dimentions.w/this.dimentions.h;
		this.renderer.setSize( this.dimentions.w, this.dimentions.h );
		this.nav.camera.aspect = this.dimentions.r;
		this.nav.camera.updateProjectionMatrix();
        if(this.postEffect!==null){
            this.postEffect.resize();
        }
    },
    colorBack:function(c){
    	if(this.postEffect!==null) this.renderer.setClearColor( c, 1 );
    },
    zone:function(){
        this.z = new THREE.Mesh( this.geo.ground, this.mat.zone );
        this.z.name = 'zone';
        this.z.scale.set(1,1,1);
        this.z.visible=false;
        this.base.add(this.z);
    },
    addModel:function(mat){
        if(this.basic!==null){ this.scene.remove(this.basic); }
        if(this.model==='plane'){
            this.basic = new THREE.Mesh( this.geo.ground, mat );
            this.basic.geometry.computeTangents();
            this.basic.scale.set(50,50,50);
            this.scene.add(this.basic);
        }
        else if(this.model==='sphere'){
            this.basic = new THREE.Mesh( this.geo.sphereHigh, mat );
            //this.basic.geometry.computeTangents();
            this.basic.scale.set(25,25,25);
            this.scene.add(this.basic);
        } else { 
            this.tmpmat = mat;
            var _this = this;
            this.pool.load(_this.model, _this.onModelLoaded); 
        }
    },
    onModelLoaded:function(){
       // console.log(v.tmpmat.attributes);
        var m = v.pool.meshes[v.model];
        var g = new THREE.Geometry();
        for(var n in m){
            g.merge( m[n].geometry );
        }

        v.basic = new THREE.Mesh( V.TransGeo(g, true), v.tmpmat );
        //for(var a in v.tmpmat.attributes) v.tmpmat.attributes[a].needsUpdate = true;

        if(v.model=='skull')v.basic.scale.set(10,10,-10);
        else if(v.model=='skullhigh')v.basic.scale.set(2,2,-2);
        else if(v.model=='head'){v.basic.scale.set(8,8,-8); v.basic.position.y = -40; }
        else if(v.model=='woman'){v.basic.scale.set(60,60,-60); v.basic.position.y = -37; }
        else v.basic.scale.set(1,1,-1);
        v.scene.add(v.basic);
    },
    basic:function(){
        this.basic = new THREE.Mesh( this.geo.ground, this.mat.base );
        this.basic.scale.set(50,50,50);
        this.scene.add(this.basic);
    },
    ground:function(){
        this.m = new THREE.Mesh( this.geo.ground, this.mat.base );
        this.m.scale.set(50,50,50);
        this.scene.add(this.m);
    },
    tell:function(s){
        this.info.innerHTML = s;
    },
    add:function(obj){
        var m = new THREE.Mesh( this.geo[obj.type||'box'], this.mat[obj.mat||'base2'] );
        obj.pos = obj.pos || [0,0,0];
        obj.size = obj.size || [1,1,1];
        m.scale.set(obj.size[0],obj.size[1],obj.size[2]);
        m.position.set(obj.pos[0],obj.pos[1],obj.pos[2]);
        m.rotation.set(0,0,0);
        this.scene.add(m);
        this.meshs[this.meshs.length] = m;

        if(this.w) this.w.add(obj);
    },
    addParticle:function(obj){
        var id = this.ps.length;
        this.ps[id] = new V.Particle(this, obj);
        obj.id = id;
        if(this.w) this.w.addParticle(obj);
    },
    initGeo:function(){
    	var geo = {};
		geo['sphere'] = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(1,12,10));
        geo['sphereHigh'] = new THREE.BufferGeometry().fromGeometry(new THREE.SphereGeometry(1,34,28));
		geo['box'] = new THREE.BufferGeometry().fromGeometry(new THREE.BoxGeometry(1,1,1));
		geo['cylinder'] = new THREE.BufferGeometry().fromGeometry(new THREE.CylinderGeometry(1,1,1,12,1));
	    geo['plane'] = new THREE.PlaneBufferGeometry(1,1);
	    geo['ground'] = new THREE.PlaneBufferGeometry(1,1);
	    geo.ground.applyMatrix(new THREE.Matrix4().makeRotationX(-V.PI90));
	    this.geo = geo;
    },
    initMat:function(){
    	var mat = {};
    	mat['none'] = new THREE.MeshBasicMaterial( { transparent:true, opacity:0, fog:false, depthTest:false, depthWrite:false});
        mat['zone'] = new THREE.MeshBasicMaterial( { color:0X00FF00, transparent:true, opacity:0.1, fog:false, depthTest:false, depthWrite:false});
    	mat['base'] = new THREE.MeshBasicMaterial( { color:0X000000 });
        mat['anchor'] = new THREE.MeshBasicMaterial( { color:0XFF3300 });
        mat['Sanchor'] = new THREE.MeshBasicMaterial( { color:0XFFFFFF });
        mat['base2'] = new THREE.MeshBasicMaterial( { color:0X00FF00, map:THREE.ImageUtils.loadTexture( 'images/grid1.jpg' ) });
    	this.mat = mat;
    },
    addWorker:function(name, fun){
        this.w = new V.Worker(this, name);
        this.wFun = fun || function(){};
    },
    addRenderTarget:function(w,h){
        var tx = new THREE.WebGLRenderTarget( w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
        this.isWithSerious = true;
        return tx;
    },

    // for physique 2D

    chaine:function(obj){
        var close = obj.close || false;
        var id = this.lines.length;
        var material = new THREE.LineBasicMaterial({ color: 0xFF6611 });
        var geometry = new THREE.Geometry();
        var l = obj.points.length*0.5, n, pos;
        for(var i=0; i<l; i++){
            n = i*2; 
            pos = new THREE.Vector3(obj.points[n], 0, obj.points[n+1]);
            geometry.vertices.push(pos);
            this.addAnchor(pos, id, i, close);
        }
        if(obj.close) geometry.vertices.push(new THREE.Vector3(obj.points[0], 0, obj.points[1]));
        var line = new THREE.Line(geometry, material);
        this.scene.add(line);
        //line.geometry.dynamic = true;

        this.lines[id] = line;

        if(this.w) this.w.chaine(obj);
    },
    addAnchor:function(p, id, n, closed){
        var m = new THREE.Mesh(this.geo.box, this.mat.anchor);
        m.position.copy(p);
        if(closed) m.name = 'ca'+id+'_'+n;
        else m.name = 'oa'+id+'_'+n;
        this.base.add(m);
        this.anchors[ m.name ] = m;
    },
    upAnchor:function(obj){
        var name = obj.name;
        var n = name.lastIndexOf("_")
        var id = name.substring(2, n) || 0;
        id*=1;
        var pid = name.substring(n+1, name.length) || 0;
        pid*=1;
        var line = this.lines[id];
        var l = line.geometry.vertices.length;
        line.geometry.vertices[pid].copy(obj.position);
        if(name.substring(0, 1) == 'c' && pid == 0){
            line.geometry.vertices[l-1].copy(obj.position);
        }
        line.geometry.verticesNeedUpdate = true;

        if(this.w){
            //console.log(pid*2, (pid*2)+1)
            this.w.dr[pid*2] = obj.position.x;
            this.w.dr[(pid*2)+1] = obj.position.z;
            this.w.msg = 'updecal';
           // this.w.post({m:'updecal'})
        }
    }



}

V.PostEffect = function(parent, name, adv){
    this.root = parent;
    this.name = name;

    this.init(adv);
}

V.PostEffect.prototype = {
    constructor: V.PostEffect,
    init:function(adv){
        var w = this.root.dimentions.w;
        var h = this.root.dimentions.h;

        this.composer = new THREE.EffectComposer( this.root.renderer );
        this.renderModel = new THREE.RenderPass( this.root.scene, this.root.nav.camera );
        this.composer.addPass( this.renderModel);

        if(this.name == 'ssao'){
            this.isAdvancedSSAO = adv || false;

            if(this.isAdvancedSSAO){
                this.oldMap = [];
                this.oldSkinMap = [];

                this.depthShader2 = THREE.DepthDef;
                this.depthUniforms2 = THREE.UniformsUtils.clone( this.depthShader2.uniforms );
                this.depthMaterial2 = new THREE.ShaderMaterial( { fragmentShader: this.depthShader2.fragmentShader, vertexShader: this.depthShader2.vertexShader, uniforms: this.depthUniforms2, skinning:true } );
                this.depthMaterial2.blending = THREE.NoBlending;
            }

            // depth
            this.depthShader = THREE.DepthDef;
            this.depthUniforms = THREE.UniformsUtils.clone( this.depthShader.uniforms );
            this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: this.depthShader.fragmentShader, vertexShader: this.depthShader.vertexShader, uniforms: this.depthUniforms } );
            this.depthMaterial.blending = THREE.NoBlending;

            this.depthParam  = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false };
            this.depthTarget = new THREE.WebGLRenderTarget( w, h, this.depthParam );
       
            this.fxaa = new THREE.ShaderPass( THREE.FXAAShader );
            var dpr = 1;
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
            this.composer.addPass( this.fxaa );

            this.ao = new THREE.ShaderPass( THREE.SSAOShader );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.ao.uniforms.cameraNear.value = this.root.nav.camera.near;
            this.ao.uniforms.cameraFar.value = this.root.nav.camera.far;
            this.ao.needsSwap = true;
            this.ao.renderToScreen = true;
            this.composer.addPass( this.ao );

            this.root.renderer.autoClear = true;
        }
        if(this.name == 'metaball'){
        }
    },
    render:function(){
        var R = this.root;
        if(this.name == 'ssao'){
            if(this.isAdvancedSSAO){
                var skin = R.skinned.children.length;
                var content = R.content.children.length;
                var i = content;
                while(i--){
                    if(!this.oldMap[i])this.oldMap[i] = R.content.children[i].material;
                    R.content.children[i].material = this.depthMaterial;
                }
                i = skin;
                while(i--){
                    if(!this.oldSkinMap[i])this.oldSkinMap[i] = R.skinned.children[i].material;
                    R.skinned.children[i].material = this.depthMaterial2;
                }
                R.renderer.render( R.scene, R.nav.camera, this.depthTarget );
                i = content;
                while(i--) R.content.children[i].material = this.oldMap[i];
                i = skin;
                while(i--) R.skinned.children[i].material = this.oldSkinMap[i];
            } else {
                R.scene.overrideMaterial = this.depthMaterial;
                R.renderer.render( R.scene, R.nav.camera, this.depthTarget );
                R.scene.overrideMaterial = null;
            }
        }
        if(this.name == 'metaball'){
        }
        this.composer.render();
    },
    resize:function(){
        if(this.name == 'ssao'){
            var w = this.root.dimentions.w;
            var h = this.root.dimentions.h;
            this.depthTarget = new THREE.WebGLRenderTarget( w, h, this.depthParam );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
        }
        if(this.name == 'metaball'){
        }
        this.composer.setSize( w, h );
    },
    deformSsao:function( g, map ){
        g.computeBoundingBox();
        var max = g.boundingBox.max;
        var min = g.boundingBox.min;
        this.depthUniforms.tdeep.value = map;
        this.depthUniforms.offset.value = new THREE.Vector2(0 - min.x, 0 - min.z);
        this.depthUniforms.range.value = new THREE.Vector2(max.x - min.x, max.z - min.z);
    }
}



//---------------------------------------------------
//
//   GUI
//
//---------------------------------------------------

V.Gui = function(isWithModel){
    this.gui = new dat.GUI();
    this.tmp = {};
    if(isWithModel) this.model3d();
}
V.Gui.prototype = {
    constructor: V.Gui,
    model3d:function(){
        this.gui.add(v, 'model', V.MeshList ).onChange(function(){v.addModel(shader)});
    },
    color:function(name, c){
        var _this = this;
        this.tmp[name] = [c["r"]*255, c.g*255, c.b*255];
        this.gui.addColor(this.tmp, name).onChange(function(){ shader.upColor(name, _this.tmp[name]) });
    },
    int:function(name, c){
        var _this = this;
        this.tmp[name] = c ? true : false;
        this.gui.add(this.tmp, name).onChange(function(){ shader.upBool(name, _this.tmp[name]) });
    },
    float:function(name, c){
        var _this = this;
        this.tmp[name] = c;
        this.gui.add(this.tmp, name).step(0.1).onChange(function(){ shader.up(name, _this.tmp[name]) });
        //this.gui.add(this.tmp, name, 0, 2).step(0.1).onChange(function(){ shader.up(name, _this.tmp[name]) });
    },
    textures:function(name){

    }
}


//---------------------------------------------------
//
//   WORKER
//
//---------------------------------------------------

V.Worker = function(parent, name){
    this.name = name;
    this.root = parent;
    this.msg = '';

    var url, max, max2, max3, max4, nValue, nValue2;
    switch(this.name){
        case 'liquid':
            url = './js/worker/liquid_worker.js';
            max = 1000;
            max2 = 100;
            max3 = 10;
            max4 = 1000;
            nValue = 4;
            nValue2 = 2;
        break;
        case 'oimo':
            url = './js/worker/oimo_worker.js';
            max = 1000;
            max2 = 10;
            max3 = 10;
            max4 = 0;
            nValue = 8;
            nValue2 = 3;
        break;
    }

    this.ar = new V.AR32(max*nValue);
    this.dr = new V.AR32(max2*nValue2);
    this.pr = new V.AR32(max4*nValue2);
    this.drn = new V.AR8(max3);
    this.drc = new V.AR8(max3);
    this.prn = new V.AR8(max3);

    this.w = new Worker(url);
    this.w.postMessage = this.w.webkitPostMessage || this.w.postMessage;

    var _this = this;
    
    this.d = [16.667, 0, 0];
    this.isReady = false;

    this.loop();
    this.w.onmessage = function(e){_this.onMessage(e)};
}
V.Worker.prototype = {
    constructor: V.Worker,
    clear:function(){
        this.w.terminate();
    },
    onMessage:function(e){
        var d = this.d;
        var _this = this;
        if(e.data.w && !this.isReady) this.isReady = true;

        this.ar = e.data.ar;
        //this.dr = e.data.dr;

        
        if(this.name === 'liquid'){
            this.pr = e.data.pr;
            this.prn = e.data.prn;
            this.upLiquid();
        }
        else this.upOimo();

        d[1] = d[0]-(Date.now()-d[2]);
        d[1] = d[1]<0 ? 0 : d[1];

        this.root.deb = ' | '+this.name +' '+ e.data.fps + ' fps ';
        setTimeout(function(e) {_this.loop()}, d[1]);
    },
    upLiquid:function(){
        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*4;
            m[i].position.x = this.ar[id];
            m[i].position.z = this.ar[id+1];
            m[i].rotation.y = this.ar[id+2];
        }

        i = this.root.ps.length;
        var p, j, k;
        while(i--){
            p = this.root.ps[i];
            j = this.prn[i]
            if(p.getLength() !== j) p.addNum(j);
            k = j;
            while(k--){
                id = k*2;
                p.move(k, this.pr[id], 0, this.pr[id+1]);
            }
            p.update();
        }

    },
    upOimo:function(){
        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*8;
            if(this.ar[id]){
                m[i].position.set( this.ar[id+1], this.ar[id+2], this.ar[id+3] );
                m[i].quaternion.set( this.ar[id+4], this.ar[id+5], this.ar[id+6], this.ar[id+7] );
            } 
        }
    },
    loop:function(){
        this.d[2] = Date.now();
        if(this.name === 'liquid') this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, dr:this.dr, ar:this.ar, pr:this.pr, prn:this.prn},[this.ar.buffer, this.pr.buffer]);
        else this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, ar:this.ar, dr:this.dr},[this.ar.buffer]);
        this.msg = '';
        //this.w.postMessage({m:'run', drn:this.drn, ar:this.ar, dr:this.dr},[this.ar.buffer, this.dr.buffer]);
    },
    add:function(obj){
        this.w.postMessage({m:'add', obj:obj});
    },
    addParticle:function(obj){
        this.w.postMessage({m:'addParticle', obj:obj});
    },
    post:function(obj){
        this.w.postMessage(obj);
    },
    chaine:function(obj){
        if(obj.close) this.drc[0] = 1;

        var l = obj.points.length * 0.5;
        this.drn[0] = l;
        var n;
        for(var i=0; i<l; i++){
            n = i*2;
            this.dr[n] = obj.points[n];
            this.dr[n+1] = obj.points[n+1];
        }
       // this.post({m:'updecal'})
        this.msg = 'updecal';
    }
}


//---------------------------------------------------
//
//   NAVIGATION
//
//---------------------------------------------------

V.Nav = function(parent, h, v, d){
    this.EPS = 0.000001;
	this.root = parent;

	this.cursor = new V.Cursor();
    this.lockView = false;

	this.camera = new THREE.PerspectiveCamera( V.Resolution.f, this.root.dimentions.r, 0.1, 1000 );
	this.mouse3d = new THREE.Vector3();
	this.selectName = '';

	this.rayVector = new THREE.Vector3( 0, 0, 1 );
	this.raycaster = new THREE.Raycaster();
	this.target = new THREE.Vector3();
    this.position = new THREE.Vector3();
	this.cam = { horizontal:h||0, vertical:v||90, distance:d||20, automove:false };
    this.mouse = { x:0, y:0, ox:0, oy:0, h:0, v:0, mx:0, my:0, down:false, move:true, button:0 };

    this.moveCamera();

    var _this = this;
    this.root.canvas.oncontextmenu = function(e){e.preventDefault()};
    this.root.canvas.onclick = function(e) {_this.onMouseClick(e)};
    this.root.canvas.onmousemove = function(e) {_this.onMouseMove(e)};
    this.root.canvas.onmousedown = function(e) {_this.onMouseDown(e)};
    this.root.canvas.onmouseout = function(e) {_this.onMouseUp(e)};
    this.root.canvas.onmouseup = function(e) {_this.onMouseUp(e)};
    this.root.canvas.onmousewheel = function(e) {_this.onMouseWheel(e)};
    this.root.canvas.onDOMMouseScroll = function(e) {_this.onMouseWheel(e)};
}

V.Nav.prototype = {
	constructor: V.Nav,
	moveCamera:function(){
        this.orbit()
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);
    },
    orbit:function(){
        var p = this.position;
        var d = this.cam.distance;
        var phi = this.cam.vertical*V.ToRad;
        var theta = this.cam.horizontal*V.ToRad;
        phi = Math.max( this.EPS, Math.min( Math.PI - this.EPS, phi ) );
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        p.add(this.target);
    },
    move:function(v){
        this.target.copy(v);
        this.moveCamera();
    },
    moveto:function(x,y,z){
        this.target.set(x,y,z);
        this.moveCamera();
    },
    onMouseClick:function(e){
        e.preventDefault();
        if (typeof mainClick == 'function') { mainClick(); }
    },
    onMouseDown:function(e){
        this.mouse.down = true;
        this.mouse.button = e.which;
        this.mouse.ox = e.clientX;
        this.mouse.oy = e.clientY;
        this.mouse.h = this.cam.horizontal;
        this.mouse.v = this.cam.vertical;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
	    this.rayTest();
        if (typeof mainDown == 'function') { mainDown(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseUp:function(e){
        this.mouse.down = false;
        this.cursor.change();
        if (typeof mainUp == 'function') { mainUp(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseMove:function(e){
        if (this.mouse.down && this.mouse.move && !this.lockView) {
    		this.cursor.change('move');
            this.cam.horizontal = ((e.clientX - this.mouse.ox) * 0.3) + this.mouse.h;
            this.cam.vertical = (-(e.clientY - this.mouse.oy) * 0.3) + this.mouse.v;
            if (this.cam.vertical < 0){ this.cam.vertical = 0; }
            this.moveCamera();
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.rayTest();
        if (typeof mainMove == 'function') { mainMove(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseWheel:function(e){
    	e.preventDefault();
        var delta = 0;
        if(e.wheelDeltaY){delta=e.wheelDeltaY*0.01;}
        else if(e.wheelDelta){delta=e.wheelDelta*0.05;}
        else if(e.detail){delta=-e.detail*1.0;}
        this.cam.distance -= delta;
        if(this.cam.distance<2)this.cam.distance = 2;
        this.moveCamera();
    },
    rayTest:function(e){
    	this.rayVector.x = ( this.mouse.x / this.root.dimentions.w ) * 2 - 1;
	    this.rayVector.y = - ( this.mouse.y / this.root.dimentions.h ) * 2 + 1;
		this.rayVector.unproject( this.camera );
		this.raycaster.ray.set( this.camera.position, this.rayVector.sub( this.camera.position ).normalize() );
		var intersects = this.raycaster.intersectObjects( this.root.base.children );
		if ( intersects.length > 0 ) {
			//this.mouse.move = false;
			this.selectName = intersects[0].object.name;
            this.mouse3d.copy(intersects[0].point);

            if (typeof mainRay == 'function') { mainRay(this.mouse3d, this.selectName); }
			
		} else {
			this.selectName = '';
			//this.mouse.move = true;
			//this.cursor.change();
		}
	}
}


//---------------------------------------------------
//   CURSOR
//---------------------------------------------------

V.Cursor = function(){
	this.current = 'auto';
	this.type = {
		drag : 'url(img/hand.png) 16 16,auto',
		draw : 'url(img/draw.png) 16 16,auto',
		cut  : 'url(img/cut.png) 0 30,auto',
		move : 'move',
		auto : 'auto'
	}
}

V.Cursor.prototype = {
	constructor: V.Cursor,
	change: function(name){
		name = name || 'auto';
		if(name!==this.current){
			this.current = name;
			document.body.style.cursor = this.type[this.current];
		}
	}
}


//---------------------------------------------------
//
//   SEA3D LOADER
//
//---------------------------------------------------

V.SeaPool = function(){
    this.meshes = {};
}
V.SeaPool.prototype = {
    constructor: V.SeaPool,
    load:function(name, end){
        var _this = this;
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {
            _this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                _this.meshes[name][m.name] = m;
            }
            if(end)end();
        }
        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( './models/'+name+'.sea' );
    }
}

V.BufferGeo = function(g, rev){
    if(rev){
        var mtx = new THREE.Matrix4().makeScale(1, 1, -1);
        g.applyMatrix(mtx);
        //g.computeBoundingBox();
        //g.computeBoundingSphere();
    }
    g.mergeVertices();
    g.computeVertexNormals( true );
    //g.computeFaceNormals();
    //g.computeMorphNormals()
    g.computeTangents();
    g.verticesNeedUpdate = true;

    g.dynamic = false;
    var Bufferg = new THREE.BufferGeometry().fromGeometry(g);
    g.dispose();
    return Bufferg;
}

V.ProjectUV = function( g, mat ){
    if ( g.boundingBox === null ) g.computeBoundingBox();
    var max = g.boundingBox.max;
    var min = g.boundingBox.min;
    mat.up('offset', new THREE.Vector2(0 - min.x, 0 - min.z));
    mat.up('range', new THREE.Vector2(max.x - min.x, max.z - min.z));
}

V.TransGeo = function(g, noBuffer){
    g.mergeVertices();
    //g.computeVertexNormals( true );
    //g.computeTangents();
    //g.computeBoundingBox();
    //g.computeBoundingSphere();
    g.verticesNeedUpdate = true;
    g.normalsNeedUpdate = true;
    //g.colorsNeedUpdate = true;

    g.computeFaceNormals();
    g.computeVertexNormals(true);
    g.computeTangents() ;

    //console.log(g.hasTangents) 

    //g.dynamic = false;

    if(!noBuffer){
        var bg = new THREE.BufferGeometry().fromGeometry(g);
        g.dispose();
        return bg;
    } else{
        return g;
    }
}



//---------------------------------------------------
//
//   PARTICLES
//
//---------------------------------------------------


V.Particle = function(parent, obj){
    this.root = parent;
    var r = obj.radius || 0.25;
    this.geometry = new THREE.Geometry();
    this.material = new THREE.PointCloudMaterial( { size:r*2, sizeAttenuation: true, map:this.makeSprite(), transparent: true} )
    this.particles = new THREE.PointCloud( this.geometry, this.material );
    this.particles.sortParticles = true;
    this.particles.dynamic = true;
    var n = obj.n || 0;
    var i = n;
    while(i--) this.addV();
    this.root.scene.add( this.particles );
}
V.Particle.prototype = {
    constructor: V.Particle,
    makeSprite:function(){
        var canvas = document.createElement('canvas');
        canvas.width=canvas.height=32;

        var context = canvas.getContext('2d');
        var centerX = canvas.width * 0.5;
        var centerY = canvas.height * 0.5;
        var radius = 16;

        context.beginPath();
        context.fillStyle = '#FF0000';
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.fill();
        var tx = new THREE.Texture(canvas);
        tx.needsUpdate = true;
        return tx;
    },
    getLength:function(){
        return this.particles.geometry.vertices.length;
    },
    addNum:function(n){
        
        var i = n;
        while(i--) this.addV();
        this.update()
        //console.log(n,this.particles.geometry.vertices.length )
    },
    addV : function (x,y,z) {
        var v = new THREE.Vector3(x||0,y||0,z||0);
        this.particles.geometry.vertices.push( v );
        this.particles.geometry.dispose();
    },
    move : function(n, x, y, z){
        if(this.geometry.vertices[n]){
            this.geometry.vertices[n].x = x || 0;
            this.geometry.vertices[n].y = y || 0;
            this.geometry.vertices[n].z = z || 0;
        }
    },
    update : function(){
        this.geometry.verticesNeedUpdate = true;
    }
}



//---------------------------------------------------
//
//   SHADER
//
//---------------------------------------------------

V.Shader = function(name, parameters){
    THREE.ShaderMaterial.call( this, parameters );
    this.parameters = parameters;
    if(name)this.load(name);
}
V.Shader.prototype = Object.create( THREE.ShaderMaterial.prototype );
V.Shader.prototype.constructor = V.Shader;
V.Shader.prototype.load = function(name){
    if(V.Main !== null) V.Main.shader.open(name);
}
V.Shader.prototype.up = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value = n;
}
V.Shader.prototype.upColor = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value.setRGB( n[0]/255, n[1]/255, n[2]/255);
}
V.Shader.prototype.upBool = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value = n ? 1:0;
}
V.Shader.prototype.init = function(parameters){
    this.setValues( parameters );
}
V.Shader.prototype.apply = function(shad){
    this.uniforms = THREE.UniformsUtils.clone( shad.uniforms );
    this.vertexShader = shad.vs;
    this.fragmentShader  = shad.fs;
    this.needsUpdate = true;
    for ( var key in this.parameters ) {
        //console.log(key)
        if(this.uniforms[key]) this.uniforms[key].value = this.parameters[key];
    }
}


V.Ground = {
    uniforms:{
    tmap : { type: "t", value: null },
    tdeep : { type: "t", value: null },
    tover : { type: "t", value: null },
    tluma : { type: "t", value: null },
    alpha : {type: "f", value: 1.0 },
    overlay : {type: "i", value: 0 },
    luma : {type: "i", value: 0 },
    lllpos : { type: "v3", value: new THREE.Vector3() },
    offset : { type: "v2", value: new THREE.Vector2() },
    range : { type: "v2", value: new THREE.Vector2() },
    tDisplacement: { type: "t", value: null },
    uDisplacementBias: { type: "f", value: -3.0 },
    uDisplacementScale: { type: "f", value: 6.0 }/*,

    "size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },
    "cameraNear":   { type: "f", value: 0.1 },
    "cameraFar":    { type: "f", value: 3 },
    "onlyAO":       { type: "i", value: 0 },
    "aoClamp":      { type: "f", value: 0.5 },
    "lumInfluence": { type: "f", value: 0.5 },
    "attenuation": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
    "texelSize": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
    "occluderBias":      { type: "f", value: 0.5 },
    "samplingRadius": { type: "f", value: 0.5 }*/
    },
    fs: [
    "uniform sampler2D tdeep;",
    "uniform sampler2D tmap;",
    "uniform sampler2D tover;",
    "uniform sampler2D tluma;",
    "uniform vec3 lllpos;",
    
    "uniform int overlay;",
    "uniform int luma;",
    "uniform float alpha;",
    "varying vec2 vUv2;",
    "varying vec2 vUv;",
    "varying vec3 vNormal;",
    "varying vec3 pos;",

    "void main() {",
        "vec4 color = vec4(1.0, 1.0, 1.0, 1.0);",
        "float factor = 1.0;",
        "if(luma == 1){",
            //"if(pos.y<0.1)color *= texture2D(tluma, vUv2).xyz;",
            "vec4 addedLights = vec4(0.0,0.0,0.0,1.0);",
            //"vec3 posl = vec3(30.0,30.0,30.0);",
            "vec3 colorl = vec3(1.0,1.0,1.0);",
            
            //"for(int l = 0; l < 1; l++) {",
            "vec3 lightDirection = normalize(pos - vec3(lllpos.x, lllpos.y+10.0, lllpos.z));",
              //  "vec3 lightDirection = normalize(pos - vec3(lllpos.x, pos.y+lllpos.y, lllpos.z));",
                "addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * colorl;",
            //"}",
            "color*=addedLights;",
        "}",
        "if(overlay == 1) color *= texture2D(tover, vUv2);",
        //"gl_FragColor *= texture2D(tmap, vUv);",
        "vec3 map = texture2D(tmap, vUv).xyz;",
        //"vec3 map = texture2D(tdeep, vUv2).xyz;",
        //"gl_FragColor = vec4(mix(map,color,factor), alpha);",
       //"gl_FragColor = vec4(map*color*vNormal, alpha);",
        "gl_FragColor = vec4(map, alpha)*color;",
    "}"
    ].join("\n"),
    vs: [
    "uniform sampler2D tdeep;",
    "uniform float uDisplacementScale;",
    "uniform float uDisplacementBias;",
    "uniform vec2 offset;",
    "uniform vec2 range;",
    "varying vec2 vUv;",
    "varying vec2 vUv2;",
    "varying vec3 vNormal;",
    "varying vec3 pos;",
    "void main() {",
        "vNormal = normalize( normalMatrix * normal );",

        "vUv = uv;",
        //"pos = position;",
        "vUv2 = (vec2(position.x, position.z)+offset)/range;",
        "vUv2.y = 1.0-vUv2.y;",// reverse Y
        "vec3 dv = texture2D( tdeep, vUv2 ).xyz;",
        "float df = (uDisplacementScale * dv.x) + uDisplacementBias;",
        "vec3 displacedPosition = position;",
        "displacedPosition.y += df;",
        "pos = displacedPosition;",
        "pos = (modelMatrix * vec4(displacedPosition, 1.0 )).xyz;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition,1.0);",
    "}"
    ].join("\n")
}


V.Point = function(x,y,z,r,c,s){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.r = r || 0; // extra rotation
    this.c = c || 0; // extra corner
    this.s = s || 0; // extra side
}