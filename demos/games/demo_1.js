var v = new V.View(180, 45, 100);
var geo, mat, mat2, map, gui, player, gamePhase = 'start';

v.tell('The dungeon');
v.zone();
v.ssao(true);
v.pool.load('wall', onload);

var oaOption = { only : false, aoClamp : 0.5, lumInfluence : 0.5 }
var lightOption = { luma : false }
loop();

function loop(){
	if(map) map.marker.anim();
    requestAnimationFrame( loop );
    v.render();
}
function mainClick(){
	if(!map) return;
	if(gamePhase === 'start') {	
		if(map.marker.good){
			map.startPosition.set(map.marker.x, map.getPosY(map.marker.x, map.marker.z), map.marker.z)
			player.place(map.startPosition);
			gamePhase = 'target';
		}
	}else if(gamePhase === 'target') {
		if(map.marker.good){
			player.followPath(map.pathPlayer);
			map.clearPath();
			map.startPosition.copy(map.endPosition)
		    gamePhase = 'moving';
		}
	}
}
function mainRay(ray){
	if(!map) return;
	if(gamePhase === 'moving') return;
	var x = V.round(ray.x);
	var z = V.round(ray.z);
    if(map.testPos(x,z)){
    	this.map.marker.move(x, 0, z);
    	if(gamePhase === 'target') {
    		map.endPosition.x = map.marker.x;
			map.endPosition.z = map.marker.z;
			map.findNewPath(100);
    	}
    }else{
		this.map.marker.reset();
	}
}

function onload(){
	geo = {};
	var m = v.pool.meshes.wall;
	for(var n in m) geo[m[n].name] = m[n].geometry; 
	
    var tx =  THREE.ImageUtils.loadTexture( './images/wall.jpg');
    tx.flipY = false;
	//tx.magFilter = THREE.NearestFilter;
    //tx.minFilter = THREE.LinearMipMapLinearFilter;

    mat = new V.Shader();
    mat.apply(V.Ground);
    mat.uniforms.tmap.value = tx;

    var cc = document.createElement('canvas');
	cc.width = cc.height = 32;
	var ctx = cc.getContext('2d');
	ctx.fillStyle = "#EEE";
	ctx.fillRect(0,0,32,32);
	ctx.fillStyle = "#CCC";
	ctx.fillRect(0,0,32,16);
	var txtPath = new THREE.Texture(cc);
	txtPath.needsUpdate = true

    mat2 = new V.Shader();
    mat2.apply(V.Ground);
    mat2.transparent = true;
    mat2.uniforms.alpha.value = 0.5; 
    mat2.uniforms.tmap.value = txtPath;

    map = new V.Map();

    gui = new dat.GUI();
    var opt0 = gui.addFolder('ssao');
    opt0.add(oaOption, 'only').onChange(function(){if(oaOption.only)v.postEffect.ao.uniforms.onlyAO.value = 1; else v.postEffect.ao.uniforms.onlyAO.value = 0;});
    opt0.add(oaOption, 'aoClamp', 0, 2).step(0.1).onChange(function(){ v.postEffect.ao.uniforms.aoClamp.value = oaOption.aoClamp; });
    opt0.add(oaOption, 'lumInfluence', 0, 2).step(0.1).onChange(function(){ v.postEffect.ao.uniforms.lumInfluence.value = oaOption.lumInfluence; });

    var optl = gui.addFolder('light');
    optl.add(lightOption, 'luma').onChange(function(){if(lightOption.luma){mat.uniforms.luma.value = 1; mat2.uniforms.luma.value = 1;} else{mat.uniforms.luma.value = 0; mat2.uniforms.luma.value = 0;}});


    var opt = gui.addFolder('Options');
    opt.add(map.size, 'w', 16, 256).step(1).name('level w');
    opt.add(map.size, 'h', 16, 256).step(1).name('level h');
    opt.add(map.rw, 'min', 4, 20).step(1).name('room w min');
    opt.add(map.rw, 'max', 8, 32).step(1).name('room w max');
    opt.add(map.rh, 'min', 4, 20).step(1).name('room h min');
    opt.add(map.rh, 'max', 8, 32).step(1).name('room h max');
    opt.add(map, 'noiseSize', 30, 200).step(1);
    gui.add(map, 'type', [ 'rogue', 'uniform', 'digger', 'maze'] ).onChange(function(){map.init()});
    gui.add(map, 'init').name('GENARATE');


    v.pool.load('heros', onHerosLoad);
}

function onHerosLoad(){
	player = new V.Player();
}

V.Map = function(size){
	this.marker = new V.Marker();
	this.startPosition = new THREE.Vector3();
	this.endPosition = new THREE.Vector3();
	
	this.pathMesh = null;//new THREE.Group();
	//v.content.add(this.pathMesh);

	this.path = null;
	this.pathPlayer = [];
	this.currentPath = null;

	this.noiseSize = 60;
	this.rw = {min:10, max:20};
	this.rh = {min:10, max:20};
	this.size = size || {w:64, h:64};
	this.type = 'rogue';
	
	this.rot = null;
	this.mesh = null;

	this.init();
}
V.Map.prototype = {
	constructor: V.Map,
	init:function(){
		this.clear();
		v.z.scale.set(this.size.w,1,this.size.h);
		v.z.position.set(this.size.w*0.5,0,this.size.h*0.5);

		this.map = new V.AR8(this.size.w*this.size.h);
		this.depth = new V.AR8(this.size.w*this.size.h);
		switch(this.type){
	        case 'uniform':
	        this.rot = new ROT.Map.Uniform( this.size.w - 1, this.size.h - 1, {
	            roomWidth: [this.rw.min, this.rw.max],
	            roomHeight: [this.rh.min, this.rh.max],
	            dugPercentage: 0.2, // we stop after this percentage of level area has been dug out
	            timeLimit: 1000 // we stop after this much time has passed (msec)
	        }); break;
	        case 'digger':
	        this.rot = new ROT.Map.Digger(this.size.w - 1, this.size.h - 1, {
	            roomWidth: [this.rw.min, this.rw.max],
	            roomHeight: [this.rh.min, this.rh.max],
	            corridorLength: [3, 10], // corridor minimum and maximum length 
	            dugPercentage: 0.2, // we stop after this percentage of level area has been dug out 
	            timeLimit: 1000 // we stop after this much time has passed (msec)
	        }); break;
	        case 'rogue': this.rot = new ROT.Map.Rogue(this.size.w - 1, this.size.h - 1); break;
	        case 'maze': this.rot = new ROT.Map.DividedMaze(this.size.w - 1, this.size.h - 1); break;
	    }
	    this.makeNoise();
	    var _this = this;
	    this.rot.create(function(i, j, tile) { _this.create(i, j, tile); });
	    this.findWall();
	    this.path = new V.PathFinding(this.size, this.map);
	    this.construct();
	},
	clear:function(){
		this.clearPath();
		this.marker.reset();
		if(player)player.reset();
		gamePhase = 'start';
		if(this.mesh){
			v.content.remove(this.mesh);
			this.mesh.geometry.dispose();
			this.map.length = 0;
			this.depth.length = 0;
		}
	},
	create:function(i, j, tile){
        var id = (i+1) + ((j+1) * this.size.w);
        switch(tile) {
            case 1: this.map[id] = 0; break;// empty
            case 0: this.map[id] = 1; break;// floor
        }
    },
    makeNoise:function(){
    	var cNoise = document.createElement('canvas');
    	//cNoise.style.cssText = "position:absolute; left:10px; top:30px; pointer-events:none;";
    	var s = this.noiseSize;
    	var w = this.size.w;
    	cNoise.width = w;
    	cNoise.height = this.size.h;
    	var ctx = cNoise.getContext('2d');
    	var imageData = ctx.getImageData(0,0,w,this.size.h);
    	var data = imageData.data;
    	var noise = new ROT.Noise.Simplex();
    	var i = this.depth.length, x, y, id, r, g, c;
		while(i--){
			id = i*4;
			y = Math.floor(i/w);
			x = i-(y*w);
			val = noise.get(x/s, y/s) * 255;
			r = ~~(val>0 ? val : 0);
            g = ~~(val<0 ? -val : 0);
            c = r+g;
            data[id] = data[id+1] = data[id+2] = c;
            data[id+3] = 255;
            this.depth[i] = c;
		}
		ctx.putImageData(imageData,0,0);
		//document.body.appendChild(cNoise);
		this.depthTexture  =  new THREE.Texture(cNoise);
	    //tx2.flipY = false;
		//tx2.magFilter = THREE.NearestFilter;
	    //tx2.minFilter = THREE.LinearMipMapLinearFilter;
	    this.depthTexture.needsUpdate = true;
	    mat.uniforms.tdeep.value = this.depthTexture;
	    mat2.uniforms.tdeep.value = this.depthTexture;
    },
    findWall:function(){
    	var m = this.map;
    	var w = this.size.w;
        var i = m.length;
        while(i--){
            if(m[i] === 1 ){
                if(m[i+1]===0) m[i+1]=2;
                if(m[i-1]===0) m[i-1]=2;
                if(m[i+w]===0) m[i+w]=2;
                if(m[i-w]===0) m[i-w]=2;
                if(m[i+w-1]===0) m[i+w-1]=2;
                if(m[i+w+1]===0) m[i+w+1]=2;
                if(m[i-w-1]===0) m[i-w-1]=2;
                if(m[i-w+1]===0) m[i-w+1]=2;
            }
        }
    },
	construct:function(){
		var w = this.size.w;
		var l = this.map.length;
		var g = new THREE.Geometry();
		var m = new THREE.Matrix4();
		var s = 0.03125;
		var m0 = new THREE.Matrix4().makeScale(s, s, -s);
		var m00 = new THREE.Matrix4().makeRotationX(V.PI);
		var m1 = new THREE.Matrix4().makeRotationY(V.PI90);//90;
		var m2 = new THREE.Matrix4().makeRotationY(V.PI);//180;
		var m3 = new THREE.Matrix4().makeRotationY(V.PI270);//270;
		var i = l, x, y, type;
		while(i--){
			y = Math.floor(i/w);
			x = i-(y*w);
			m.makeTranslation(x,0,y);
			m.multiply(m0);
			// g limite
			if(i===0 || i===l-1){ m.multiply(m00); g.merge( geo['floor'] , m );}
			
			if(this.map[i] === 1){
				g.merge( geo['floor'] , m );
			}
			if(this.map[i] === 2){
				type = this.wallTest(i);
				if(type[1]===1) m.multiply(m1);
				if(type[1]===2) m.multiply(m2);
				if(type[1]===3) m.multiply(m3);
				g.merge( geo[type[0]] , m );
			}
		}
		this.mesh = new THREE.Mesh( V.TransGeo(g), mat );
		V.ProjectUV(this.mesh.geometry, mat);
		V.ProjectUV(this.mesh.geometry, mat2);

		v.deformSsao(this.mesh.geometry, this.depthTexture );

		var bmax = this.mesh.geometry.boundingBox.max;
		v.nav.moveto(bmax.x*0.5,0,bmax.z*0.5);
		this.mesh.name = 'level';
		v.content.add(this.mesh);
	},
	
	wallTest:function(id){
		var w = "w"; 
		var type = [];
		var f = this.map[id+this.size.w]-1;
		var b = this.map[id-this.size.w]-1;
		var l = this.map[id+1]-1;
		var r = this.map[id-1]-1;
		b = (b<0) ? 0 : b;
		f = (f<0) ? 0 : f;
		l = (l<0) ? 0 : l;
		r = (r<0) ? 0 : r;
		// L
		if(f && b && !l && !r) type = [ w + '_l', 0 ];
		if(!f && !b && l && r) type = [ w + '_l', 1 ];
		// T
		if(f && b && l && !r) type = [ w + '_t', 0 ];
		if(f && b && !l && r) type = [ w + '_t', 2 ];
		if(!f && b && l && r) type = [ w + '_t', 3 ];
		if(f && !b && l && r) type = [ w + '_t', 1 ];
		// X
		if(f && b && l && r) type = [ w + '_x', 0 ];
		if(!f && !b && !l && !r) type = [ w + '_m', 0 ];
		// E
		if(f && !b && !l && !r) type = [ w + '_e', 0 ];
		if(!f && b && !l && !r) type = [ w + '_e', 2 ];
		if(!f && !b && l && !r) type = [ w + '_e', 3 ];
		if(!f && !b && !l && r) type = [ w + '_e', 1 ];
		// C
		if(f && !b && l && !r) type = [ w + '_c', 0 ];
		if(f && !b && !l && r) type = [ w + '_c', 1 ];
		if(!f && b && l && !r) type = [ w + '_c', 3 ];
		if(!f && b && !l && r) type = [ w + '_c', 2 ];
		return type;
	},
	findNewPath:function(max){
		this.findPath(this.startPosition, this.endPosition, max);
	},
	testPos:function(x,z){
		var id = x + (z * this.size.w);
		if(this.map[id] === 1) return true;
		return false;
	},
	idToPos : function(id){
		var p = new V.Point();
		p.z = Math.floor(id/this.size.w);
		p.x = id-(p.z*this.size.w);
		p.y = ((this.depth[id]/255)*6)-3;
		return p;
	},
	getPosY : function(x,z){
		var id = x + (z * this.size.w);
		return ((this.depth[id]/255)*6)-3;
	},
	findPath:function(pathStart, pathEnd, max){
		pathStart.y = 0;
		pathEnd.y = 0;
		var nextPath = this.path.calculatePath(pathStart, pathEnd);
		if(nextPath.length!==0){
			this.clearPath();
			this.currentPath = nextPath.slice(0,max);
			if(nextPath.length>1) this.drawPath(max);
		}
	},
	drawPath:function(max){
		var p = [];
		this.pathPlayer = [];
		this.pathRotation = [];

		var l = this.currentPath.length;
		var prev, curr;
		
		for (var i = 0; i<l; i++){
			p[i] = this.idToPos(this.currentPath[i]);
			curr = p[i];
			if(i>0){
				prev = p[i-1];
				if(curr.x===prev.x){
					if(curr.z<prev.z) curr.s = 1;
					else curr.s = 0;
				}
				if(curr.z===prev.z){
					if(curr.x<prev.x) curr.s = 2;
				    else curr.s = 3;
				}
				
				if(prev.s!==curr.s){ // corner
					prev.c = 1;
					if(curr.s===0){ if(prev.s===2) prev.r = V.PI;    else prev.r = -V.PI90; }
					if(curr.s===1){ if(prev.s===3) prev.r = 0;       else prev.r = V.PI90;  }
					if(curr.s===2){ if(prev.s===0) prev.r = 0;       else prev.r = -V.PI90; }
					if(curr.s===3){ if(prev.s===0) prev.r = V.PI90;  else prev.r = V.PI;    }
				}
				if(curr.s===0) curr.r = V.PI90;
				if(curr.s===1) curr.r = -V.PI90;
				if(curr.s===2) curr.r = V.PI;
				if(curr.s===3) curr.r = 0;

				this.pathPlayer[i] = curr;

				if(i===1){ prev.r = curr.r; prev.s = curr.s; prev.c = 0; }; 
			}
		}
		var g = new THREE.Geometry();
		var s = 0.03125;
		var ms = new THREE.Matrix4().makeScale(s, s, -s);
		var m = new THREE.Matrix4();
		var type;
		var l = p.length;
		i = l;
		while(i--){
			curr = p[i];

			m.makeTranslation(curr.x, 0, curr.z);
			m.multiply(ms);
			m.multiply(new THREE.Matrix4().makeRotationY(curr.r));

			type = 1;// line
			if(i===0) type = 0;// start
			if(i===l-1) type = 3;// end
			if(curr.c) type = 2;// corner

			g.merge( geo['pp'+type], m );
		}
		// add final geometry
		//var mesh = new THREE.Mesh( V.TransGeo(g), mat2 );
		//this.pathMesh.add(mesh);

		this.pathMesh = new THREE.Mesh( V.TransGeo(g), mat2 );
		v.content.add(this.pathMesh);
	},
	clearPath:function(){
		if(this.pathMesh){
			v.content.remove(this.pathMesh);
			this.pathMesh.geometry.dispose();
		}
		/*if(this.pathMesh.children[0]) {
			var m = this.pathMesh.children[0];
			this.pathMesh.remove(m);
			m.geometry.dispose();
		}*/
	},
	checkPath:function(){
		if(this.currentPath!==null && this.currentPath.length>0)return this.currentPath.length;
		else return 0;
	}
}



//++++++ PATHFINDING ++++++

V.PathFinding = function(size, zone){
	this.maxWalkableTileNum = 1;
	this.zone = zone;
	this.size = size;
	this.worldSize = this.size.w*this.size.h;
}

V.PathFinding.prototype = {
	constructor: V.PathFinding,
	neighbours:function (x, z){
		var	N = z - 1, S = z + 1;
		var E = x + 1, W = x - 1,
		myN = N > -1 && this.canWalkHere(x, N),
		myS = S < this.size.h && this.canWalkHere(x, S),
		myE = E < this.size.w && this.canWalkHere(E, z),
		myW = W > -1 && this.canWalkHere(W, z),
		result = [];
		if(myN) result.push({x:x, z:N});
		if(myE) result.push({x:E, z:z});
		if(myS) result.push({x:x, z:S});
		if(myW) result.push({x:W, z:z});
		return result;
	},
	canWalkHere : function (x, z) {
		var i = (x + z * this.size.w);
		return this.zone[i] === this.maxWalkableTileNum;
		//return this.zone[i] <= this.maxWalkableTileNum;
	},
	node : function (Parent, point){
		var newNode = {
			Parent:Parent,
			id:point.x + (point.z * this.size.w),
			x:point.x,
			y:point.y,
			z:point.z,
			f:0,
			g:0
		};

		return newNode;
	},
	distance : function (point, Goal){
		return V.abs(point.x - Goal.x) + V.abs(point.z - Goal.z);
	},
	calculatePath : function (pathStart, pathEnd){
		var	mypathStart = this.node(null, {x:pathStart.x, z:pathStart.z});
		var mypathEnd = this.node(null, {x:pathEnd.x, z:pathEnd.z});
		var AStar = new V.AR8(this.worldSize);
		var Open = [mypathStart];
		var Closed = [];
		var result = [];
		var myNeighbours;
		var myNode;
		var myPath;
		var length, max, min, i, j;
		while(length = Open.length){
			max = this.worldSize;
			min = -1;
			i = length;
			while(i--){ if(Open[i].f < max){ max = Open[i].f; min = i; } }
			myNode = Open.splice(min, 1)[0];
			if(myNode.id === mypathEnd.id){
				myPath = Closed[Closed.push(myNode) - 1];
				do{
					result.push(myPath.id);
				} while (myPath = myPath.Parent);
				AStar = Closed = Open = [];
				result.reverse();
			}else{
				myNeighbours = this.neighbours(myNode.x, myNode.z);
				i = myNeighbours.length;
				while(i--){
					myPath = this.node(myNode, myNeighbours[i]);
					if (!AStar[myPath.id]){
						myPath.g = myNode.g + this.distance(myNeighbours[i], myNode);
						myPath.f = myPath.g + this.distance(myNeighbours[i], mypathEnd);
						Open.push(myPath);
						AStar[myPath.id] = true;
					}
				}
				Closed.push(myNode);
			}
		}
		return result;
	}
}


V.Marker = function(){
	this.g = geo['marker'];
	this.s = V.ModelSize;

	this.x = 0;
	this.z = 0;
	this.good = false;

	this.m = new THREE.Matrix4();
	this.ms = new THREE.Matrix4();
	this.mp = new THREE.Matrix4();

	this.geo = new THREE.Geometry();
	this.mesh = new THREE.Mesh( this.geo , mat2 );
	//this.mesh.position.y = 0.1;
	v.content.add(this.mesh);
	this.mesh.visible = false;

	this.sup = 1;
	this.sm = 1;
}

V.Marker.prototype = {
	constructor: V.Marker,
	reset:function(){
		this.good = false;
		this.mesh.visible = false;
	},
	move: function(x,y,z){
		this.x = x;
		this.z = z;
		this.good = true;
		this.mp.makeTranslation(x,y,z);
		if(!this.mesh.visible)this.mesh.visible=true;
	},
	anim:function(){
		if(this.sup)this.sm+=0.01;
		else this.sm-=0.01;
		this.s = 0.03125 * this.sm;

		this.geo.dispose();
		this.geo = new THREE.Geometry();

		this.ms.makeScale(this.s, this.s, -this.s);
		this.m.multiplyMatrices(this.mp, this.ms);
		this.geo.merge( this.g , this.m );
		this.mesh.geometry = this.geo;

		if(this.sm>1.1)this.sup = 0;
		if(this.sm<0.9)this.sup = 1;
	}
}

V.Player = function(){

	this.pos = { x:0, y:0, z:0, r:0 };

	this.haveMove = false;

	this.weapon = null;
    this.terrain = null;
	this.position = new THREE.Vector3(0,0,0);

	var s = 0.03125;
	var tx = THREE.ImageUtils.loadTexture('images/avatar.png');
	tx.flipY = false;
	tx.minFilter = THREE.LinearMipMapLinearFilter;
	tx.magFilter = THREE.NearestFilter;

	this.mesh = v.pool.meshes.heros['woman'].clone();

	this.mesh.scale.set(s,s,-s);
	this.mesh.geometry.computeBoundingBox();
	var min = this.mesh.geometry.boundingBox.min;
	this.py = -min.y*s;
	this.mesh.material = new THREE.MeshBasicMaterial( {map:tx, skinning:true});
	this.mesh.visible=false;

	this.anims = [];
	var i = this.mesh.animations.length, name;
	this.animLength = i;
	while(i--){
		name = this.mesh.animations[i].name;
		this.pos[name] = 0;
		if(name=='idle') this.pos[name] = 1;
		this.mesh.animations[i].play( 0, this.pos[name] );
		this.anims[i] = name;
	}

	//this.mesh.add(this.model);
	v.skinned.add(this.mesh);

	this.movePath = null;
	this.tween = null;
	this.n = 0;
}
V.Player.prototype = {
	constructor: V.Player,
	reset:function(){
		if(this.tween)this.tween.stop()
		this.tween = null;
		this.mesh.visible=false;
	},
	place:function(p){
		this.mesh.visible=true;
		this.position.x = this.pos.x = p.x;
		this.position.y = this.pos.y = p.y;
		this.position.z = this.pos.z = p.z;

		this.move();
	},
	followPath:function(movePath){
		this.movePath = movePath;
		this.l = movePath.length;
		this.n = 1;
		this.haveMove = false;
		this.moving();
		// replace cursor to end
		map.marker.move( this.movePath[this.l-1].x,0,this.movePath[this.l-1].z);
		map.marker.good = false;
	},
	moving:function(){
		var node = this.movePath[this.n]
		var side = node.s;
		var r;

		if(side===0){ r = -V.PI90;}
		if(side===1){ r = V.PI90; }
		if(side===2){ r = V.PI;   }
		if(side===3){ r = 0;      }


		var newpos = { x:node.x, y:node.y, z:node.z, r:r, walk:1, idle:0 };
		// end walk
		if(this.n===this.l-1){ newpos.walk = 0; newpos.idle = 1; }
		// invers rotation
		if( this.pos.r <= -V.PI90 && newpos.r===V.PI ) newpos.r = -V.PI;
		if( this.pos.r <= -V.PI && newpos.r===V.PI90 ) newpos.r = -V.PI270;
		if( this.pos.r === -V.PI270 && newpos.r===0 ) this.pos.r = this.mesh.rotation.y = V.PI90;
		if( this.pos.r === V.PI && newpos.r===-V.PI90 ) this.pos.r = this.mesh.rotation.y = -V.PI;

		var _this = this;
		this.tween = new TWEEN.Tween( this.pos )
		.to( newpos , 150 )
		.easing( TWEEN.Easing.Linear.None )
		.onUpdate( function () { _this.move(); v.nav.move(_this.position); } )
		.onComplete( function () { 
			_this.n++; 
			if(_this.n===_this.l) _this.endMove(); 
			else  _this.moving();
		}).start();
	},
	endMove:function(){
		this.tween = null;
		this.haveMove = true;
		gamePhase = 'target';
	},
	move:function(){
		// update animation
		var i = this.animLength;
        //while(i--) this.model.animations[i].weight = this.pos[this.anims[i]];
        while(i--) this.mesh.animations[i].weight = this.pos[this.anims[i]];
        // update position
		this.position.set(this.pos.x, this.pos.y+this.py, this.pos.z);
		this.mesh.position.copy(this.position);

		mat.uniforms.lllpos.value.copy(this.position);
		mat2.uniforms.lllpos.value.copy(this.position);
		// update rotation
		this.mesh.rotation.y = this.pos.r + V.PI90;
	},
	getPosition:function(){
		return this.position;
	}
}