/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

// TRAFFIC for three.js

'use strict';

var f = [0,0,0,0];
var sim = null;
var world = null;
var ar;
var dr = [];
var drn = [];
var drc = [];// close or not
var tmp;

self.onmessage = function(e) {
    var m = e.data.m;
    if(m==='init'){
        importScripts(e.data.url);
        self.postMessage({init:true});
    }
    /*if(m==='add') sim.addAgent(e.data.obj);
    if(m==='obstacle') sim.addObstacle(e.data.obj);
    if(m==='updecal') sim.updateDecal(e.data);
    if(m==='goal') sim.setGoal(e.data.obj);*/

    if(m==='run'){
        ar = e.data.ar;

        if(sim == null) sim = new W.Simulation();
        else sim.isOk = true;

        sim.run();

        /*var i = sim.agents.length, id, a;
        while(i--){
            a = sim.cars[i];
            id = i*3;
            ar[id] = a.position.x;
            ar[id+1] = a.position.y;
            ar[id+2] = a.getOrientation();
        }*/

        f[1] = Date.now();
        if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

        self.postMessage({ w:sim.isOk, fps:f[3], ar:ar },[ar.buffer]);
    }
}


var W = {};

W.Simulation = function () {
	this.cars = [];
	this.isOk = false;
	this.previousTime = 0;
	this.timeFactor = 5;
	world = new TRAFFIC.World();
}

W.Simulation.prototype = {
	constructor: W.Simulation,
	init : function (obj) {
		world.generateMap(2,2,7, 1);
		world.carsNumber = 100;
	},
	run:function(){
		var o, i, id, idd;
		var time = Date.now();
		var delta = (time - this.previousTime) || 0;
		if (delta > 100) { delta = 100;  }
		this.previousTime = time;
		world.onTick(this.timeFactor * delta / 1000);
		/*o = world.intersections.all();
		for (idd in o) {
			addInter(o[idd]);
	    }
	    o = world.roads.all();
	    for (idd in o) {
	        this.addRoad(o[idd]);
	            this.addSignals(o[idd]);
	    }
	    // remove car 
	    var i = world.toRemove.length;
	    while(i--){ removeCar(world.toRemove[i]); };
	    world.clearTmpRemove();
	    */
	    i = 0;
	    o = world.cars.all();
		for (idd in o) {
			//var id = o[idd].id.substring(3);
			id = i*3;
			ar[id] = o[idd].coords.x;
            ar[id+1] = o[idd].coords.y;
            ar[id+2] = o[idd].direction;
            i++;
	    }
	}
}