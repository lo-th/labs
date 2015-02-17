/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

// OIMO for three.js

'use strict';
var f = [0,0,0,0];
var ar;
var dr;
var drn;
var sim = null;
var world = null;

self.onmessage = function(e) {
	var m = e.data.m;
	if(m==='init'){
		importScripts(e.data.url);
		self.postMessage({init:true});
	}
	if(m==='room') sim.room(e.data.obj);
	if(m==='add')  sim.add(e.data.obj);
	if(m==='run'){
		ar = e.data.ar;
		dr = e.data.dr;
		drn = e.data.drn;

		if(world==null) sim.init(e.data);
		else sim.isWorld = true;
		
		sim.step();

		f[1] = Date.now();
	    if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

	    self.postMessage({ w:sim.isWorld, fps:f[3], ar:ar, dr:dr },[ar.buffer]);
	}
}

var W = { rev : 0.1 };

W.Sim = function(){
	this.p = 4; // precission
	this.groups = [0xffffffff, 1 << 0, 1 << 1, 1 << 2];
    this.isWorld = false;
    this.bodys = [];

    this.start_blob = -1;
    this.end_blob = -1;
}

W.Sim.prototype = {
	constructor: W.Sim,
	init:function(data){
		this.d = data.d || [0.01667, 8, 2];
		world = new OIMO.World( this.d[0], this.d[2], this.d[1] );
		world.gravity = new OIMO.Vec3(0, -10, 0);
		world.worldscale(10);
	},
	step:function(){
		var p = this.p, i, id, b, pos, quat;
		world.step();
		i = this.bodys.length;
		while(i--){
			b = this.bodys[i].body;
			id=i*8;
			if(b.sleeeping)ar[id] = 0;
			else{
				ar[id] = 1;
				pos = b.getPosition();
				ar[id+1] = pos.x.toFixed(p)*1;
				ar[id+2] = pos.y.toFixed(p)*1;
				ar[id+3] = pos.z.toFixed(p)*1;
				if(id < this.start_blob || id > this.end_blob){
					quat = b.getQuaternion();
					ar[id+4] = quat.x.toFixed(p)*1;
					ar[id+5] = quat.y.toFixed(p)*1;
					ar[id+6] = quat.z.toFixed(p)*1;
					ar[id+7] = quat.w.toFixed(p)*1;	
				}
			}
		}
	},
	clear:function(){
		world.clear();
	},
	room:function (obj){
		var s = obj.size;
		var p = obj.pos;
		var id, n = obj.n;
		while(n--){
			id = n*3;
			new OIMO.Body({ type:'box', size:[s[id],s[id+1],s[id+2]], pos:[p[id],p[id+1],p[id+2]], world:world });
		}
	},
	add:function(obj){
		var id = this.bodys.length;
		obj.world = world;
		obj.move = true;
		if(obj.type=='blob'){
			if(this.start_blob==-1) this.start_blob=id;
			this.end_blob = id;
		    obj.type = 'sphere';
		}
		this.bodys[id] = new OIMO.Body(obj);

	}
}

sim = new W.Sim();