'use strict';
importScripts('../../js/libs/crowd.js');

var f = [0,0,0,0];
var sim = null;
var ar;
var tmp;

self.onmessage = function(e) {
    var m = e.data.m;
    

    if(m==='add') sim.addAgent(e.data.obj);
    if(m==='obstacle') sim.addObstacle(e.data.obj);
    if(m==='goal') sim.setGoal(e.data.obj);

    if(m==='run'){
        ar = e.data.ar;

        if(sim == null) sim = new CROWD.Simulation();
        else sim.isOk = true;

        sim.run();

        var i = sim.agents.length, id, a;
        while(i--){
            a = sim.agents[i];
            id = i*3;
            ar[id] = a.position.x;
            ar[id+1] = a.position.y;
            ar[id+2] = a.orientation;
            //ar[id+2] = a.getOrientation();//Math.atan2(a.oldPosition.x-a.position.x, a.oldPosition.y-a.position.y);
         
        }

        f[1] = Date.now();
        if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

        self.postMessage({ w:sim.isOk, fps:f[3], ar:ar },[ar.buffer]);
    }
}


var CROWD = {};

CROWD.init = Module.cwrap('init', 'boolean', []);
CROWD.run = Module.cwrap('run', '', ['number']);
CROWD.deleteCrowd = Module.cwrap('deleteCrowd', '', []);

CROWD.allocateMem_X_Y_RAD = Module.cwrap('allocateMem', '', ['number', 'number']);
CROWD.allocateMemResusable = Module.cwrap('allocateMemReusable', '', ['number', 'number']);

CROWD.addObstacle = Module.cwrap('addObstacle', '', ['number', 'number']);
CROWD.processObstacles = Module.cwrap('processObstacles', 'number', []);
CROWD.removeObstacles = Module.cwrap('removeObstacles', 'number', []);

CROWD.addAgent = Module.cwrap('addAgent', '', ['number', 'number']);
CROWD.removeAgent = Module.cwrap('removeAgent', 'number', ['number']);

CROWD.addAgentGoal = Module.cwrap('addAgentGoal', '', ['number', 'number', 'number']);
CROWD.addAgentsGoal = Module.cwrap('addAgentsGoal', '', ['number', 'number']);

CROWD.addWayPoint = Module.cwrap('addWayPoint', '', ['number', 'number']);
CROWD.recomputeRoadmap = Module.cwrap('recomputeRoadmap', '', []);

CROWD.setTimeStep = Module.cwrap('setTimeStep', '', ['number']);
CROWD.setAgentMaxSpeed = Module.cwrap('setAgentMaxSpeed', '', ['number', 'number']);
CROWD.setAgentRadius = Module.cwrap('setAgentRadius', '', ['number']);
CROWD.setAgentMaxNeighbors = Module.cwrap('setAgentMaxNeighbors', '', ['number']);
CROWD.setAgentNeighborDist = Module.cwrap('setAgentNeighborDist', '', ['number']);
CROWD.setAgentPosition = Module.cwrap('setAgentPosition', '', ['number', 'number']);
CROWD.setAgentPrefVelocity = Module.cwrap('setAgentPrefVelocity', '', ['number', 'number']);
CROWD.setAgentTimeHorizon = Module.cwrap('setAgentTimeHorizon', '', ['number']);
CROWD.setAgentTimeHorizonObst = Module.cwrap('setAgentTimeHorizonObst', '', ['number']);
CROWD.setAgentVelocity = Module.cwrap('setAgentVelocity', '', ['number', 'number']);
CROWD.setAgentUseRoadMap = Module.cwrap('setAgentUseRoadMap', '', ['number', 'number']);

CROWD.getTimeStep = Module.cwrap('getTimeStep', 'number', ['number']);
CROWD.getAgentMaxSpeed = Module.cwrap('getAgentMaxSpeed', 'number', ['number']);
CROWD.getAgentRadius = Module.cwrap('getAgentRadius', 'number', ['number']);
CROWD.getAgentMaxNeighbors = Module.cwrap('getAgentMaxNeighbors', 'number', ['number']);
CROWD.getAgentNeighborDist = Module.cwrap('getAgentNeighborDist', 'number', ['number']);
CROWD.getAgentTimeHorizon = Module.cwrap('getAgentTimeHorizon', 'number', ['number']);
CROWD.getAgentTimeHorizonObst = Module.cwrap('getAgentTimeHorizonObst', 'number', ['number']);
CROWD.getAgentPosition = Module.cwrap('getAgentPosition', 'number', ['number']);
CROWD.getAgentPrefVelocity = Module.cwrap('getAgentPrefVelocity', 'number', ['number']);
CROWD.getAgentVelocity = Module.cwrap('getAgentVelocity', 'number', ['number']);
CROWD.getAgentUseRoadMap = Module.cwrap('getAgentUseRoadMap', 'boolean', ['number']);


CROWD.Simulation = function () {
    this.size = 6000;
    this.agents = [];
    this.obstacles = [];
    this.iteration = 1.75;
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
CROWD.Simulation.prototype = {
	constructor: CROWD.Simulation,
	addAgent : function (obj) {
        var agent = new CROWD.Agent(this, new CROWD.V2(obj.pos[0] || 0, obj.pos[2] || 0 ) , obj.size[0] || 10, obj.useRoadMap || false );
        //agent.setGoal(0,0);
        //this.agents.push(agent);
        //CROWD.addAgentGoal(agent.id, 0, 0);
        //CROWD.recomputeRoadmap();
        //return agent.getAgentNo();
    },
    addObstacle : function(obj){
        var obstacle = new CROWD.Obstacle( this, obj );
        this.processObstacles();

       
    },
    setGoal:function(obj){
        CROWD.addAgentsGoal(obj.x, obj.y);
        CROWD.recomputeRoadmap();
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
        var wp = new CROWD.WayPoint(v.x, v.y);
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
        if (i == -1)
            return;

        this.obstacles[i].remove(i);
        this.obstacles.splice(i, 1);

        CROWD.removeObstacles();

        if (this.obstacles.length == 0)
            return;

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
        var v = new CROWD.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPosition : function (agentId) {
        CROWD.getAgentPosition(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);

        var v = new CROWD.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPrefVelocity : function (agentId) {
        CROWD.getAgentPrefVelocity(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);
        var v = new CROWD.V2(arr[0], arr[1]);
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

CROWD.V2 = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
};

CROWD.Agent = function(sim, position, radius, useRoadMap){
    this.sim = sim;

    this.position = position || new CROWD.V2();
    this.oldPosition = position || new CROWD.V2();
    this.orientation = 0;
    this.goal = new CROWD.V2();
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

CROWD.Agent.prototype = {
    constructor: CROWD.Agent,
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
    setAbstractMesh : function (mesh) {
    },
    setMesh : function (mesh) {
        this.mesh = mesh;
    },
    setType : function (type) {
        this.type = type;
    },
    setPosition : function (v) {
        this.position = v;
    },
    getOrientation : function () {
        this.orientation = Math.atan2(this.goal.x-this.position.x, this.goal.y-this.position.y);
        return this.orientation;
    },
    setOrientation : function (angle) {
        this.orientation = angle;
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




CROWD.Obstacle = function (sim, obj) {
    this.sim = sim;
    this.id = this.sim.obstacles.length;//Obstacle.ObstacleNo;

     this.dataHeap = null;
     this.data = null;

    obj = obj || {};
    obj.type = obj.type || 'box';

    if(obj.type == 'box'){
        this.addByBoundingBox(obj);
    }else{
        this.addByClosedPolygon(obj);
    }
    //Obstacle.ObstaclesOrder.push(this.id);
    //Obstacle.NumObstacles++;
    //Obstacle.ObstacleNo++;
    this.sim.obstacles.push(this);
}

CROWD.Obstacle.prototype = {
    constructor: CROWD.Obstacle,
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
       //  this.data = new Float32Array([x-mw, y+mh, x+mw, y+mh, x+mw, y-mh, x-mw, y-mh]);
        this.data = new Float32Array(arr.length * 2);
        for (var i = 0; i < obj.arr.length; i++) {
            this.data[index++] = obj.arr[i].x;
            this.data[index++] = obj.arr[i].y;
        }

        this.allocateMem();

        this.addToSimulation();

        _free(this.dataHeap.byteOffset);

       // var lines = [];

/*        if (debug) {
            for (var i = 0; i < arr.length; i++) {
                lines[i] = new BABYLON.Vector3(arr[i].x, 0, arr[i].y);
            }

            lines.push(new BABYLON.Vector3(arr[0].x, 0, arr[0].y));
            this.mesh = BABYLON.Mesh.CreateLines("lines", lines, scene);
        }*/
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



CROWD.WayPoint = function (x, y) {
    CROWD.addWayPoint(x, y);
}