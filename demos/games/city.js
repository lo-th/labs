var v = new V.View(180, 45, 130);
var geo = [];
var gui, city;
var oaOption = { only : false, aoClamp : 0.5, lumInfluence : 0.5 }
var lightOption = { luma : false }

v.tell('The city');
var shader = new V.Shader('Ground', {}, false , onShaderload );

loop();

function loop(){
    requestAnimationFrame( loop );
    v.render();
}

function onShaderload(){
	v.pool.load('world', onload);
    v.ssao();
}

function onload(){
	v.colorBack(0x25292e);
    var m = v.pool.meshes.world;
    var i = 21, nm = '';
    while(i--){
    	if(i>0){
    		if(i<10) nm = '0';
    		if(m['i_'+nm+i])geo.push(m['i_'+nm+i].geometry);
    		if(m['r_'+nm+i])geo.push(m['r_'+nm+i].geometry);
    		if(m['c_'+nm+i])geo.push(m['c_'+nm+i].geometry);
    	}
    }

	city = new V.City();
	city.init();

	gui = new dat.GUI();
	var opt0 = gui.addFolder('ssao');
    opt0.add(oaOption, 'only').onChange(function(){if(oaOption.only)v.postEffect.ao.uniforms.onlyAO.value = 1; else v.postEffect.ao.uniforms.onlyAO.value = 0;});
    opt0.add(oaOption, 'aoClamp', 0, 2).step(0.1).onChange(function(){ v.postEffect.ao.uniforms.aoClamp.value = oaOption.aoClamp; });
    opt0.add(oaOption, 'lumInfluence', 0, 2).step(0.1).onChange(function(){ v.postEffect.ao.uniforms.lumInfluence.value = oaOption.lumInfluence; });

    var optl = gui.addFolder('light');
    optl.add(lightOption, 'luma').onChange(function(){if(lightOption.luma){city.mat.uniforms.luma.value = 1; } else{city.mat.uniforms.luma.value = 0;}});

	gui.add(city, 'numMesh',  [ 1, 3, 9 ]).onChange(function(){city.init()});
	gui.add(city, 'grid',  [ 16, 32, 64, 128]).onChange(function(){city.init()});
	gui.add(city, 'init').name('GENARATE');
}

V.City = function(){
	this.grid = 32;
	this.numMesh = 1;

	var tx =  THREE.ImageUtils.loadTexture( './images/building.jpg');
    tx.flipY = false;
	tx.magFilter = THREE.NearestFilter;
    tx.minFilter = THREE.LinearMipMapLinearFilter;

    this.depthTexture =  THREE.ImageUtils.loadTexture( './images/depth0.jpg');
    this.depthTexture.flipY = false;
	this.depthTexture.magFilter = THREE.NearestFilter;
    this.depthTexture.minFilter = THREE.LinearMipMapLinearFilter;

    this.mat = shader;
    this.mat.uniforms.tmap.value = tx;
    this.mat.uniforms.tdeep.value = this.depthTexture;

	this.meshs = [];
}

V.City.prototype = {
	constructor: V.City,
	init:function(){
		this.clear();
		this.build()
	},
	clear:function(){
		var i = this.meshs.length;
		while(i--){
			v.content.remove(this.meshs[i]);
			this.meshs[i].geometry.dispose();
		}
		this.meshs.length = 0;
	},
	build:function(){
		var i = this.numMesh;
		while(i--){
			this.buildMesh();
		}
	},
	buildMesh:function(){
		
		var max = geo.length-1;
		var l = this.grid*0.5;
		var g = new THREE.Geometry();
		var m = new THREE.Matrix4();
		var ms = new THREE.Matrix4().makeScale(1, 1, -1);
		var i=l, j, n, r;
		while(i--){
			j = l;
			while(j--){
				n = V.randInt(0,max);
				r = V.PI90*V.randInt(0,3);
			    m.makeTranslation(i*3, 0, j*3);
			    m.multiply(ms);
			    m.multiply(new THREE.Matrix4().makeRotationY(r));
			    g.merge( geo[n], m );
			}
		}
		// remove duplicated vertices
		g.mergeVertices();
		//g.computeVertexNormals(true);
		//g.computeTangents();
		//g.verticesNeedUpdate = true;
		//console.log(g.vertices.length)
		
		var bg = new THREE.BufferGeometry().fromGeometry(g);
		g.dispose();
		bg.computeBoundingBox();
		var bmax = bg.boundingBox.max;

		var id = this.meshs.length;

		
		if(id===0){
			V.ProjectUV(bg, this.mat);
			v.deformSsao(bg, this.depthTexture );
		}

		
		var dx = 0;
		var dz = 0;
		if(id==1) dx = 1;
		if(id==2) dx = -1;
		if(id==3) dz = 1;
		if(id==4) dz = -1;
		if(id==5){ dx = 1; dz = 1; }
		if(id==6){ dx = -1; dz = 1; }
		if(id==7){ dx = 1; dz = -1; }
		if(id==8){ dx = -1; dz = -1; }
		
		this.meshs[id] = new THREE.Mesh(bg, this.mat);
		this.meshs[id].position.set((-bmax.x*0.5)+(bmax.x*dx), 0, -(bmax.z*0.5)+(bmax.x*dz));
		v.content.add(this.meshs[id]);
	}
}