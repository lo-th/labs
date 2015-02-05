'use strict';
importScripts('../../js/libs/liquidfun.js');
var Wscale = 10;

var f = [0,0,0,0];
var ar;// body position
var pr;// particle position
var prn;// number of particule
var dr = [];
var drn = [];
var drc = [];// close or not

var sim = null;
var world = null; 

var oldPos = new Float32Array(1000*2);
var inv255 = .003921569;

self.onmessage = function(e) {
	var m = e.data.m;
	var m2 = e.data.m2;

	if(m==='add')  sim.add(e.data.obj);
	if(m==='addParticle') sim.addParticle(e.data.obj);
	//if(m==='updecal') sim.updateDecal();

	if(m==='run'){
		ar = e.data.ar;
		pr = e.data.pr;
		//prn = e.data.prn;
		dr = e.data.dr;
		//if(drn !== e.data.drn){ 
		drn=e.data.drn; 
		drc=e.data.drc; 

		if(m2==='updecal') sim.updateDecal();
		
		//sim.updateDecal();
		//	 }
		if(world==null) {
			sim.init(e.data);
			prn = e.data.prn;
		}
		else sim.isWorld = true;
		
		if(sim.step !== undefined) sim.step();

		f[1] = Date.now();
	    if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

	    self.postMessage({ w:sim.isWorld, fps:f[3], ar:ar, pr:pr, prn:prn },[ar.buffer, pr.buffer]);
	}
}

var W = {};

W.SCALE = 10;
W.INV_SCALE = 1/W.SCALE;

W.Sim = function(){
	this.p = 4; // precission
	this.groups = [0xffffffff, 1 << 0, 1 << 1, 1 << 2];
    this.isWorld = false;
    this.bodys = [];
    this.decals = [];

    this.ps = []; // particle systeme

    this.configDecals = [0, 0.5, 0.1, this.groups[1], this.groups[0] ];
}

W.Sim.prototype = {
	constructor: W.Sim,
	init:function(data){
	    // timeStep, velocityIterations, positionIterations
		this.d = data.d || [0.01667, 8, 3];
		this.gravity = new b2Vec2(0, -10);
		world = new b2World( this.gravity, data.sleep || false );
	},
	step:function(){
		var p = this.p, d = this.d, i, id, b, pos, id2;
		world.Step(d[0], d[1], d[2]);
		//i = world.bodies.length;//
		i = this.bodys.length;
		while(i--){
			//b = world.bodies[i];
			b = this.bodys[i];
			pos = b.GetPosition();
			id=i*4;
			/*ar[id] = pos.x.toFixed(p)*1;
			ar[id+1] = pos.y.toFixed(p)*1;
			ar[id+2] = -b.GetAngle().toFixed(p)*1;*/



			id2 = 2*i;
            var pold = new b2Vec2(oldPos[id2], oldPos[id2+1]);
            var direction = new b2Vec2();
            b2Vec2.Sub(direction, pos, pold );
            // vitesse total = distance / temps
            //var prev = Date.now() - f[i]
            var t = direction.Length()/0.017;
            // le vecteur de direction normalisé <= 1
            b2Vec2.Normalize(direction, direction);
            // l'impulsion appliqué a l'objet 
            var impulse = new b2Vec2();
            b2Vec2.MulScalar(impulse, direction, t);
            // le limiteur de vitesse final
            if(impulse.Length() < 10) b.SetLinearVelocity(impulse);
            //if(impulse.Length() < 10) b.ApplyForceToCenter(impulse, true);*/

            ar[id] = pos.x.toFixed(p)*W.SCALE;
			ar[id+1] = pos.y.toFixed(p)*W.SCALE;
			ar[id+2] = -b.GetAngle().toFixed(p)*1;

            oldPos[id2] = pos.x;
            oldPos[id2+1] = pos.y;


			//ar[id+3] = b.IsActive();


		}
		// PARTICLE SYSTEME
		var ps, p;
		//i = world.particleSystems.length;
		i = this.ps.length;
		while(i--){
			//ps = world.particleSystems[i];
			ps = this.ps[i];
	        pos = ps.GetPositionBuffer();
		    var transform = new b2Transform();
		    transform.SetIdentity();
		    var j = prn[i];
		    while(j--){
	            id = 2*j;
		    	pr[id] = pos[id].toFixed(p)*W.SCALE;
		    	pr[id+1] = pos[id+1].toFixed(p)*W.SCALE;
		    }
	    }

	},
	clear:function(){
	    if (world !== null){
	        while(world.joints.length > 0) { world.DestroyJoint(world.joints[0]); }
	        while(world.bodies.length > 0) { world.DestroyBody(world.bodies[0]); }
	        while(world.particleSystems.length > 0) { world.DestroyParticleSystem(world.particleSystems[0]); }
	    }
	},
	add:function (obj, notAdd) {
	    var type = obj.type || 'box';
	    var size = obj.size || [0.5, 0.5, 1,1];
	    var midd = Math.floor(size.length*0.5);// for multy point
	    var pos = obj.pos || [0,0,0];
	    
	    obj.config = obj.config || [0.3, 0.1, this.groups[1], this.groups[0]];
	    var fixtureDef = new b2FixtureDef();
        fixtureDef.density = obj.mass || 0;
        fixtureDef.friction = obj.config[0] || 0.3;
        fixtureDef.restitution = obj.config[1] || 0.1;
        //fixtureDef.filter.groupIndex = obj.config[3];
        fixtureDef.filter.categoryBits = obj.config[2] || this.groups[1];
        fixtureDef.filter.maskBits = obj.config[3] || this.groups[0];

        var bodyDef = new b2BodyDef();
	    bodyDef.position = new b2Vec2(pos[0]*W.INV_SCALE, pos[2]*W.INV_SCALE);
	    bodyDef.allowSleep = obj.canSleep || false;
	    bodyDef.awake = true;
	    bodyDef.bullet = obj.bullet || false; // prevented from tunneling
	    bodyDef.fixedRotation = obj.fixRot || false; // no need rotation
	    //bodyDef.doSleep = obj.canSleep || true; // never sleep
	    bodyDef.type = fixtureDef.density <= 0.0 ? b2_staticBody : b2_dynamicBody;
	    
	    var shape;
	    if(type==="edge" || type==="line"){shape = new b2EdgeShape; shape.Set(new b2Vec2(size[0]*W.INV_SCALE, size[1]*W.INV_SCALE), new b2Vec2(size[2]*W.INV_SCALE, size[3]*W.INV_SCALE)); }
	    if(type==="box"){shape = new b2PolygonShape; shape.SetAsBoxXY((size[0]*W.INV_SCALE)*0.5, (size[2]*W.INV_SCALE)*0.5);}
	    if(type==="poly"){shape = new b2PolygonShape; for(var i=0; i<midd; i++){ shape.vertices.push(new b2Vec2(size[i*2]*W.INV_SCALE, size[(i*2)+1]*W.INV_SCALE)); }  }
	    if(type==="chaine"){shape = new b2ChainShape; for(var i=0; i<midd; i++){ shape.vertices.push(new b2Vec2(size[i*2]*W.INV_SCALE, size[(i*2)+1]*W.INV_SCALE)); } shape.CreateLoop();  }
	    if(type==="circle" || type==="cylinder" || type==="sphere"){shape = new b2CircleShape; shape.radius = size[0]*W.INV_SCALE; }

	    // init shape
	    fixtureDef.shape = shape;
	    // init body
	    var body = world.CreateBody(bodyDef);
	    body.CreateFixtureFromDef(fixtureDef);

	    if(!notAdd) this.bodys[this.bodys.length] = body;
	},


	// PARTICLES
	addParticle:function(obj){
		var id = obj.id || this.ps.length;
		var radius = obj.radius || 0.25;
		var systemDef = new b2ParticleSystemDef();
	    systemDef.radius = radius*W.INV_SCALE;
	    systemDef.dampingStrength = obj.damping || 0.2;
	    this.ps[id] = world.CreateParticleSystem(systemDef);
	    obj.id = id;

	    this.addGroup(obj);
	},
	addGroup:function(obj){
		var pos = obj.pos || {x:0, y:0, z:0};
		var g_radius = obj.g_radius || 6;
	    var circle = new b2CircleShape();
	    circle.position.Set( pos.x*W.INV_SCALE , pos.z*W.INV_SCALE );
	    circle.radius = g_radius*W.INV_SCALE;
	    var pgd = new b2ParticleGroupDef();
	    pgd.shape = circle;
	    pgd.color.Set(255, 0, 0, 255);
	    this.ps[obj.id].CreateParticleGroup(pgd);
	    prn[obj.id] = this.ps[obj.id].GetParticleCount()*0.5;
	    console.log(prn[obj.id]);
	},
	addP:function(obj){
	   /* var shape = new b2CircleShape;
	    //shape.position = new b2Vec2(obj.pos[0], obj.pos[1]);
	    shape.radius = 2;
	    var pd = new b2ParticleDef(); //b2ParticleGroupDef;
	    //pd.flags =  b2_elasticParticle;//b2_viscousParticle
	    pd.position = new b2Vec2(obj.pos[0], obj.pos[1]);
	    pd.shape = shape;
	    this.ps[id].CreateParticle(pd);*/
	},



	// DECAL CHAINE
	updateDecal:function(){
    	var max = drn.length;
    	 //console.log(drn[0]);
    	var n, oldNum = 0;
    	for(var i=0; i<max; i++){
    		n = drn[i];
    		if(n===0){ if(this.decals[i])this.removeDecal(i);} // remove Chain
    		else this.actualizDecale(i, oldNum, oldNum+n); // update Chain
    		oldNum += n;
    	}
    },
    removeDecal:function(n){
		this.decals[n].DestroyFixture(this.decals[n].fixtures[0]);
		world.DestroyBody(this.decals[n]);
		this.decals[n] = null;
    },
    actualizDecale:function(n, start, end){
        //console.log(dr[0])
    	var id;
    	var fixtureDef = new b2FixtureDef();
        fixtureDef.density = this.configDecals[0];
        fixtureDef.friction = this.configDecals[1];
        fixtureDef.restitution = this.configDecals[2];
        fixtureDef.filter.categoryBits = this.configDecals[3];
        fixtureDef.filter.maskBits = this.configDecals[4];
        // creation de la nouvelle chaine
        var shape = new b2ChainShape();
        var vertices = shape.vertices;
        /*var i = end-start;
        while(i--){
        	id = (start+i)*2;
        	vertices[i] = new b2Vec2( dr[id], dr[id+1] );
        }*/

        var h;
        var j = 0
        for(var i=start; i<end; i++ ){
        	h = i*2;
        	vertices[j] = new b2Vec2( dr[h]*W.INV_SCALE, dr[h+1]*W.INV_SCALE );
        	j++;
        }
        // close shape 
        if(drc[n]===1) shape.CreateLoop();
        // add shape to fixture
        fixtureDef.shape = shape;

        if(this.decals[n] == null ){
        	var bodyDef = new b2BodyDef();
            bodyDef.type = b2_staticBody;
            var body = world.CreateBody(bodyDef);
            body.CreateFixtureFromDef(fixtureDef);
            this.decals[n] = body;
            //console.log('addnew');
        }else{
        	this.decals[n].DestroyFixture(this.decals[n].fixtures[0]);
        	this.decals[n].CreateFixtureFromDef(fixtureDef);
        }
    }


}

sim = new W.Sim();