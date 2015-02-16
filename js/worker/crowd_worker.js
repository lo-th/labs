'use strict';
//importScripts('../../js/libs/crowd.js');

var f = [0,0,0,0];
var sim = null;
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
    if(m==='add') sim.addAgent(e.data.obj);
    if(m==='obstacle') sim.addObstacle(e.data.obj);
    if(m==='updecal') sim.updateDecal(e.data);
    if(m==='goal') sim.setGoal(e.data.obj);

    if(m==='run'){
        ar = e.data.ar;

        if(sim == null) sim = new W.Simulation();
        else sim.isOk = true;

        sim.run();

        var i = sim.agents.length, id, a;
        while(i--){
            a = sim.agents[i];
            id = i*3;
            ar[id] = a.position.x;
            ar[id+1] = a.position.y;
            //ar[id+2] = a.orientation;
            ar[id+2] = a.getOrientation();//Math.atan2(a.oldPosition.x-a.position.x, a.oldPosition.y-a.position.y);
         
        }

        f[1] = Date.now();
        if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

        self.postMessage({ w:sim.isOk, fps:f[3], ar:ar },[ar.buffer]);
    }
}

var W = {};

W.Simulation = function () {
    this.size = 6000;
    this.agents = [];
    this.obstacles = [];
    this.iteration = 1//.75;
    this.timeStep = 0.3;//0166;
    //this.scene = scene;

    if (!CROWD.init()) {
        throw new Error("Crowd is not initialized");
        return;
    }

    this.setTimeStep(1);
    this.setPrecision(1);

    this.allocateMem_X_Y_RAD();
    this.allocateMemReusable(2);

    this.isOk = true;
}
W.Simulation.prototype = {
	constructor: W.Simulation,
	addAgent : function (obj) {
        var agent = new W.Agent(this, new W.V2(obj.pos[0] || 0, obj.pos[2] || 0 ) , obj.size[0] || 10, obj.useRoadMap || false );
        //agent.setGoal(0,0);
        //this.agents.push(agent);
        //CROWD.addAgentGoal(agent.id, 0, 0);
        //CROWD.recomputeRoadmap();
        //return agent.getAgentNo();
    },
    addObstacle : function(obj){
        var obstacle = new W.Obstacle( this, obj );
        this.processObstacles();

       
    },
    setGoal:function(obj){
        CROWD.addAgentsGoal(obj.x, obj.y);
        CROWD.recomputeRoadmap();
    },

    updateDecal:function(obj){
        dr=obj.dr; 
        drn=obj.drn; 
        drc=obj.drc;
        var max = drn.length;
        var n, oldNum = 0;
        for(var i=0; i<max; i++){
            n = drn[i];
            if(n===0){ if(this.obstacles[i])this.removeDecal(i);} // remove Chain
            else this.actualizDecale(i, oldNum, oldNum+n); // update Chain
            oldNum += n;
        }

        this.processObstacles();
        //this.computeRoadMap();

    },
    removeDecal:function(n){
        //this.decals[n].DestroyFixture(this.decals[n].fixtures[0]);
        //world.DestroyBody(this.decals[n]);
        this.removeObstacle(n);
        this.obstacles[n] = null;
    },
    actualizDecale:function(n, start, end){
        var vertices = [];
        var h, j = 0
        for(var i=start; i<end; i++ ){
            h = i*2;
            vertices[j] = new W.V2( dr[h], dr[h+1] );
            j++;
        }
        // close shape 
        //if(drc[n]===1) shape.CreateLoop();
        // add shape to fixture
        //fixtureDef.shape = shape;

        if(this.obstacles[n] == null ){
            this.obstacles[n] = new W.Obstacle(null, { type:'poly', id:n, arr:vertices });
        }else{
            this.obstacles[n].addByClosedPolygon({ arr:vertices })
            //this.obstacles[n].DestroyFixture(this.obstacles[n].fixtures[0]);
            //this.obstacles[n].CreateFixtureFromDef(fixtureDef);
        }
    },






    addAgentGoal : function (agentId, goal) {
        var i = this.getIndexFromId(agentId, BABYLON.Agent.AgentsOrder);
        if (i == -1) return;
        this.agents[i].addGoal(goal);
    },
    addAgentsGoal : function (goal) {
        CROWD.addAgentsGoal(goal.x, goal.y);
    },
    addAgentsSelectionGoal : function (goal) {
        for (var i = 0; i < BABYLON.Agent.NumAgents; i++)
            if (this.agents[i].getIsSelected())
                CROWD.addAgentGoal(i, goal.x, goal.y);

        CROWD.recomputeRoadmap();
    },
    computeRoadMap : function () {
        CROWD.recomputeRoadmap();
    },
    addWayPoint : function (v, debug) {
        var wp = new W.WayPoint(v.x, v.y);
    },
    /*addObstacleByBoundingBox : function (mesh, position, isVisible) {
        var obstacle = new BABYLON.Obstacle();
        obstacle.addByBoundingBox(mesh, position, isVisible);
        this.obstacles.push(obstacle);
    },
    addObstaclesAsclosedPolygon : function (arr, debug) {
        var obstacle = new BABYLON.Obstacle();
        obstacle.addByClosedPolygon(arr, this.scene, debug);
        this.obstacles.push(obstacle);
    },*/
    processObstacles : function () {
        CROWD.processObstacles();
    },
    removeObstacle : function (obstacleId) {
        var i = this.getIndexFromId(obstacleId, BABYLON.Obstacle.ObstaclesOrder);
        if (i == -1) return;
        this.obstacles[i].remove(i);
        this.obstacles.splice(i, 1);

        CROWD.removeObstacles();

        if (this.obstacles.length == 0) return;

        for (var i = 0; i < this.obstacles.length; i++) {
            this.obstacles[i].rebuild();
        }
        this.processObstacles();
    },
    removeAgent : function (agentId) {
        var i = this.getIndexFromId(agentId, BABYLON.Agent.AgentsOrder);
        if (i == -1)
            return;
        this.agents[i].remove(i);
        this.agents.splice(i, 1);
    },
    setUseRoadmap : function (agentId, useRoadmap) {
        this.agents[agentId].setUseRoadMap(useRoadmap);
    },
    setAgentsSelection : function (selection) {
        for (var i = 0; i < BABYLON.Agent.NumAgents; i++) {
            if (selection[i] == 1) {
                this.agents[i].setIsSelected(true);
            } else {
                this.agents[i].setIsSelected(false);
            }
        }
    },
    setIteration : function (v) {
        this.iteration = v;
    },
    setPrecision : function (v) {
        var neighborsMax = 0;
        var neighborDist = 0;
        var timeHorizon = 0;
        var timeHorizonObst = 0;

        neighborsMax = 0;
        neighborDist = 0;
        timeHorizon = 0;
        timeHorizonObst = 0;
        switch (v) {
            case 1:
                neighborsMax = 10;
                neighborDist = 15;
                timeHorizon = 10;
                timeHorizonObst = 10;
                break;
            case 2:
                neighborsMax = 100;
                neighborDist = 200;
                timeHorizon = 50;
                timeHorizonObst = 30;
                break;
            case 3:
                neighborsMax = 100;
                neighborDist = 100;
                timeHorizon = 100;
                timeHorizonObst = 100;
                break;
        }

        for (var i = 0; i < this.agents.length; i++) {
            this.setAgentMaxNeighbors(i, neighborsMax);
            this.setAgentNeighborDist(i, neighborDist);
            this.setAgentTimeHorizon(i, timeHorizon);
            this.setAgentTimeHorizonObst(i, timeHorizonObst);
        }
    },
    run : function () {
        CROWD.run(this.iteration);
        CROWD.X_Y_RAD = new Float32Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.data.length);

        var i = this.agents.length;
        while(i--){
            this.agents[i].update(i);
        }
    },
    deleteCrowd : function () {
        CROWD.deleteCrowd();
    },
    setTimeStep : function (timeStep) {
        this.timeStep = timeStep;
        CROWD.setTimeStep(this.timeStep);
    },
    setAgentMaxSpeed : function (agentId, maxSpeed) {
        CROWD.setAgentMaxSpeed(agentId, maxSpeed);
    },
    setAgentRadius : function (agentId, radius) {
        CROWD.setAgentRadius(agentId, radius);
    },
    setAgentMaxNeighbors : function (agentId, maxNeighbors) {
        CROWD.setAgentMaxNeighbors(agentId, maxNeighbors);
    },
    setAgentNeighborDist : function (agentId, neighborDist) {
        CROWD.setAgentNeighborDist(agentId, neighborDist);
    },
    setAgentPosition : function (agentId, position) {
        CROWD.setAgentPosition(agentId, position.x, position.y);
    },
    setAgentPrefVelocity : function (agentId, prefVelocity) {
        CROWD.setAgentPrefVelocity(agentId, prefVelocity.x, prefVelocity.y);
    },
    setAgentTimeHorizon : function (agentId, timeHorizon) {
        CROWD.setAgentTimeHorizon(agentId, timeHorizon);
    },
    setAgentTimeHorizonObst : function (agentId, timeHorizonObst) {
        CROWD.setAgentTimeHorizonObst(agentId, timeHorizonObst);
    },
    setAgentVelocity : function (agentId, velocity) {
        CROWD.setAgentVelocity(agentId, velocity.x, velocity.y);
    },
    getAgentMaxNeighbors : function (agentId) {
        return CROWD.getAgentMaxNeighbors(agentId);
    },
    getAgentMaxSpeed : function (agentId) {
        return CROWD.getAgentMaxSpeed(agentId);
    },
    getAgentNeighborDist : function (agentId) {
        return CROWD.getAgentNeighborDist(agentId);
    },
    getAgentRadius : function (agentId) {
        return CROWD.getAgentRadius(agentId);
    },
    getAgentTimeHorizon : function (agentId) {
        return CROWD.getAgentTimeHorizon(agentId);
    },
    getAgentTimeHorizonObst : function (agentId) {
        return CROWD.getAgentTimeHorizonObst(agentId);
    },
    getAgentVelocity : function (agentId) {
        CROWD.getAgentVelocity(agentId);

        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);
        var v = new W.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPosition : function (agentId) {
        CROWD.getAgentPosition(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);

        var v = new W.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPrefVelocity : function (agentId) {
        CROWD.getAgentPrefVelocity(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);
        var v = new W.V2(arr[0], arr[1]);
        return v;
    },
    allocateMem_X_Y_RAD : function () {
        this.data = new Float32Array(this.size);
        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);

        this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap.set(new Uint8Array(this.data.buffer));

        CROWD.allocateMem_X_Y_RAD(this.dataHeap.byteOffset, this.data.length);
    },
    allocateMemReusable : function (size_t) {
        this.data_reusable = new Float32Array(size_t);
        var nDataBytes = this.data_reusable.length * this.data_reusable.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);

        this.dataHeap_reusable = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap_reusable.set(new Uint8Array(this.data_reusable.buffer));

        CROWD.allocateMemResusable(this.dataHeap_reusable.byteOffset, this.data_reusable.length);
    },
    getIndexFromId : function (agentId, arr) {
        var exist = false;
        for (var i = 0; i < arr.length; i++)
            if (arr[i] == agentId) {
                exist = true;
                break;
            }
        if (!exist) {
            throw new Error("Crowd Error Agent || Obstacle id = " + agentId + " unknown from Crowd sim");
            return -1;
        }
        return i;
    }
}

W.PI = Math.PI;
W.TwoPI = 2.0 * Math.PI;


W.V2 = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
}

W.V2.prototype = {
    constructor: W.V2,
    length: function () {
        return Math.sqrt( this.x * this.x + this.y * this.y );
    },
    lerp: function ( v, alpha ) {
        this.x += ( v.x - this.x ) * alpha;
        this.y += ( v.y - this.y ) * alpha;
        return this;
    },
    angle: function(v) {
        return Math.atan2(v.y - this.y, v.x - this.x);
    },
    orient: function(){
        return Math.atan2(this.x , this.y);
        /*var s = 10;
        var vp = new CROWD.V2(this.x * s, this.y * s);
        return Math.atan2(vp.x - this.x , vp.y - this.y);*/
    }
}


W.Agent = function(sim, position, radius, useRoadMap){
    this.sim = sim;

    this.position = position || new W.V2();
    this.oldPosition = position || new W.V2();
    this.orientation = 0;
    this.goal = new W.V2();
    this.useRoadMap = 0;
    //this.isSelected = false;

    this.id = this.sim.agents.length;

    this.radius = radius || 4;

    CROWD.addAgent(this.position.x, this.position.y);
    CROWD.setAgentRadius(this.id, this.radius);

    this.setUseRoadMap(this.useRoadMap);

    //Agent.AgentsNo++;
    //Agent.NumAgents++;

    this.sim.agents.push(this);
}

W.Agent.prototype = {
    constructor: W.Agent,
    remove : function (index) {
        //this.mesh.dispose();
        CROWD.removeAgent(index);
        Agent.AgentsOrder.splice(index, 1);
        Agent.NumAgents--;
    },
    setGoal:function(x,y){
        this.goal.x = x; 
        this.goal.y = y;
        CROWD.addAgentGoal(this.id, this.goal.x, this.goal.y);
    },
    addGoal : function (goal) {
        CROWD.addAgentGoal(this.id, goal.x, goal.y);
    },
    setUseRoadMap : function (useRoadmap) {
        this.useRoadMap = useRoadmap;
        CROWD.setAgentUseRoadMap(this.id, this.useRoadMap);
      //  CROWD.recomputeRoadmap();
    },
    /*setAbstractMesh : function (mesh) {
    },
    setMesh : function (mesh) {
        this.mesh = mesh;
    },*/
    setType : function (type) {
        this.type = type;
    },
    setPosition : function (v) {
        this.position = v;
    },
    getOrientation : function () {
        var oldOr = this.orientation;
        //this.orientation = Math.atan2(this.goal.x-this.position.x, this.goal.y-this.position.y);
       // var v = ;
       // var r = this.unwrapRadian(Math.atan2 (v.x , v.y));
       /// var r = Math.atan2 (v.x , v.y);
        //var tr = ( r-this.orientation)*0.1;
        var ne = this.getVelocity().orient()//this.unwrapRadian(this.getVelocity().orient());
        this.orientation = this.lerp(oldOr, ne, this.sim.timeStep);//r;
        // this.orientation = oldOr + Math.cos(this.sim.timeStep) * (ne-oldOr);
        //this.orientation += tr;
        //this.orientation = this.lerp(this.orientation, r, 0.66)
        return this.orientation;
    },
    unwrapRadian : function(r){
        r = r % W.TwoPI;
        if (r > W.PI) r -= W.TwoPI;
        if (r < -W.PI) r += W.TwoPI;
        return r;
    },
    lerp : function (a, b, percent) { 
        return a + (b - a) * percent;
    },
    setOrientation : function (angle) {
        this.orientation = angle;
    },
    getVelocity : function (agentId) {
        CROWD.getAgentVelocity(this.id);

        var arr = new Float32Array(this.sim.dataHeap_reusable.buffer, this.sim.dataHeap_reusable.byteOffset, this.sim.data_reusable.length);
        var v = new W.V2(arr[0], arr[1]);
        return v;
    },
    //setIsSelected : function (isSelected) {
    //    this.isSelected = isSelected;

        /*var mat = new BABYLON.StandardMaterial("", this.mesh.getScene());
        if (this.isSelected) {
            mat.emissiveColor = new BABYLON.Color3(.2, .2, .8);
            mat.diffuseColor = new BABYLON.Color3(.2, .2, .5);
            this.mesh.material = mat;
        } else {
            this.mesh.material = this.matOriginal;
        }*/
    //},
    update : function (id) {
        this.position.x = CROWD.X_Y_RAD[id * 3 + 0];
        this.position.y = CROWD.X_Y_RAD[id * 3 + 1];
        this.orientation = CROWD.X_Y_RAD[id * 3 + 2];
    },
    getPosition : function () {
        return this.position;
    },
    getIsSelected : function () {
        return this.isSelected;
    },
    getAgentNo : function () {
        return this.id;
    },
    getRadius : function () {
        return this.radius;
    }
}




W.Obstacle = function (sim, obj) {
    obj = obj || {};
    this.sim = sim;
    //Obstacle.ObstacleNo;

    this.dataHeap = null;
    this.data = null;

    
    obj.type = obj.type || 'box';
    if(obj.type == 'box'){
        this.addByBoundingBox(obj);
    }else{
        this.addByClosedPolygon(obj);
    }
    //Obstacle.ObstaclesOrder.push(this.id);
    //Obstacle.NumObstacles++;
    //Obstacle.ObstacleNo++;
    if(this.sim!==null){
        this.id = obj.id || this.sim.obstacles.length;
        this.sim.obstacles.push(this);
    }
}

W.Obstacle.prototype = {
    constructor: W.Obstacle,
    addByBoundingBox : function (obj) {
        var pos = obj.pos || [1,0,1];
        var size = obj.size || [20,20,20];

        var x = pos[0];
        var y = pos[2];
        var mw = size[0]*0.5;
        var mh = size[2]*0.5;

        //var min = {x:x+mw, z:y+mh }
        //var max = {x:x-mh, z:y-mh }

        //var min = {x:-20, z:-20 }
        //var max = {x:20, z:20 }

        this.data = new Float32Array([x+mw, y+mh, x-mw, y+mh, x-mw, y-mh, x+mw, y-mh]);
        //this.data = new Float32Array([max.x, max.z, min.x, max.z, min.x, min.z, max.x, min.z]);
      
        this.allocateMem();
        this.addToSimulation();
        _free(this.dataHeap.byteOffset);

        //console.log('box added', this.data)
    },
    addByClosedPolygon : function (obj) {
        var index = 0;
        this.data = new Float32Array(obj.arr.length * 2);
        for (var i = 0; i < obj.arr.length; i++) {
            this.data[index++] = obj.arr[i].x;
            this.data[index++] = obj.arr[i].y;
        }

        this.allocateMem();
        this.addToSimulation();
        _free(this.dataHeap.byteOffset);
    },
    rebuild : function () {
        this.allocateMem();
        //this.addToSimulation();
        _free(this.dataHeap.byteOffset);
    },
    remove : function (index) {
       // if (this.mesh) this.mesh.dispose();
        Obstacle.ObstaclesOrder.splice(index, 1);
        Obstacle.NumObstacles--;
    },
    addToSimulation : function () {
        CROWD.addObstacle(this.dataHeap.byteOffset, this.data.length);
        //CROWD.processObstacles();
        //CROWD.recomputeRoadmap();
        //BABYLON.CrowdPlugin.addObstacle(this.dataHeap.byteOffset, this.data.length);
    },
    allocateMem : function () {
        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);
        this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap.set(new Uint8Array(this.data.buffer));
    }
}



W.WayPoint = function (x, y) {
    CROWD.addWayPoint(x, y);
}