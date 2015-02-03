'use strict';
importScripts('../../js/crowd.js');

var f = [0,0,0,0];
var simulation;
var agentData;
var tmp;



self.onmessage = function(e) {
    var m = e.data.m;
    agentData = e.data.agentData;
    tmp = e.data.tmp;

    if(tmp){
        //console.log(tmp.m, tmp.x, tmp.y)
        if(tmp.m=='add')simulation.addAgent( new RVO.V2(tmp.x, tmp.y), tmp.r )
    }


    if(m=='init'){
        simulation = new RVO.Simulation();
    }

    if(simulation.isOk){
        simulation.run();

        var i = simulation.agents.length, id, a;
        while(i--){
            a = simulation.agents[i];
            id = i*3;
            agentData[id] = a.position.x;
            agentData[id+1] = a.position.y;
            agentData[id+2] = a.orientation;
        }

    }


    f[1] = Date.now();
    if(f[1]-1000>f[0]){ f[0]=f[1]; f[3]=f[2]; f[2]=0; } f[2]++;

    self.postMessage({ m:m, fps:f[3], agentData:agentData },[agentData.buffer]);
}


var RVO = {};

RVO.init = Module.cwrap('init', 'boolean', []);
RVO.run = Module.cwrap('run', '', ['number']);
RVO.deleteCrowd = Module.cwrap('deleteCrowd', '', []);

RVO.allocateMem_X_Y_RAD = Module.cwrap('allocateMem', '', ['number', 'number']);
RVO.allocateMemResusable = Module.cwrap('allocateMemReusable', '', ['number', 'number']);

RVO.addObstacle = Module.cwrap('addObstacle', '', ['number', 'number']);
RVO.processObstacles = Module.cwrap('processObstacles', 'number', []);
RVO.removeObstacles = Module.cwrap('removeObstacles', 'number', []);

RVO.addAgent = Module.cwrap('addAgent', '', ['number', 'number']);
RVO.removeAgent = Module.cwrap('removeAgent', 'number', ['number']);

RVO.addAgentGoal = Module.cwrap('addAgentGoal', '', ['number', 'number', 'number']);
RVO.addAgentsGoal = Module.cwrap('addAgentsGoal', '', ['number', 'number']);

RVO.addWayPoint = Module.cwrap('addWayPoint', '', ['number', 'number']);
RVO.recomputeRoadmap = Module.cwrap('recomputeRoadmap', '', []);

RVO.setTimeStep = Module.cwrap('setTimeStep', '', ['number']);
RVO.setAgentMaxSpeed = Module.cwrap('setAgentMaxSpeed', '', ['number', 'number']);
RVO.setAgentRadius = Module.cwrap('setAgentRadius', '', ['number']);
RVO.setAgentMaxNeighbors = Module.cwrap('setAgentMaxNeighbors', '', ['number']);
RVO.setAgentNeighborDist = Module.cwrap('setAgentNeighborDist', '', ['number']);
RVO.setAgentPosition = Module.cwrap('setAgentPosition', '', ['number', 'number']);
RVO.setAgentPrefVelocity = Module.cwrap('setAgentPrefVelocity', '', ['number', 'number']);
RVO.setAgentTimeHorizon = Module.cwrap('setAgentTimeHorizon', '', ['number']);
RVO.setAgentTimeHorizonObst = Module.cwrap('setAgentTimeHorizonObst', '', ['number']);
RVO.setAgentVelocity = Module.cwrap('setAgentVelocity', '', ['number', 'number']);
RVO.setAgentUseRoadMap = Module.cwrap('setAgentUseRoadMap', '', ['number', 'number']);

RVO.getTimeStep = Module.cwrap('getTimeStep', 'number', ['number']);
RVO.getAgentMaxSpeed = Module.cwrap('getAgentMaxSpeed', 'number', ['number']);
RVO.getAgentRadius = Module.cwrap('getAgentRadius', 'number', ['number']);
RVO.getAgentMaxNeighbors = Module.cwrap('getAgentMaxNeighbors', 'number', ['number']);
RVO.getAgentNeighborDist = Module.cwrap('getAgentNeighborDist', 'number', ['number']);
RVO.getAgentTimeHorizon = Module.cwrap('getAgentTimeHorizon', 'number', ['number']);
RVO.getAgentTimeHorizonObst = Module.cwrap('getAgentTimeHorizonObst', 'number', ['number']);
RVO.getAgentPosition = Module.cwrap('getAgentPosition', 'number', ['number']);
RVO.getAgentPrefVelocity = Module.cwrap('getAgentPrefVelocity', 'number', ['number']);
RVO.getAgentVelocity = Module.cwrap('getAgentVelocity', 'number', ['number']);
RVO.getAgentUseRoadMap = Module.cwrap('getAgentUseRoadMap', 'boolean', ['number']);


RVO.Simulation = function () {
    this.size = 6000;
    this.agents = [];
    this.obstacles = [];
    this.iteration = 1;
    this.timeStep = 0.3;
    //this.scene = scene;

    if (!RVO.init()) {
        throw new Error("Crowd is not initialized");
        return;
    }

    this.setTimeStep(1);

    this.allocateMem_X_Y_RAD();
    this.allocateMemReusable(2);

    this.isOk = true;
}
RVO.Simulation.prototype = {
	constructor: RVO.Simulation,
	addAgent : function ( position, radius, useRoadMap) {
        var agent = new RVO.Agent(this, position, radius, useRoadMap);
        this.agents.push(agent);
        RVO.addAgentGoal(agent.id, 0, 0);
        RVO.recomputeRoadmap();
        //return agent.getAgentNo();
    },
    addAgentGoal : function (agentId, goal) {
        var i = this.getIndexFromId(agentId, BABYLON.Agent.AgentsOrder);
        if (i == -1)
            return;
        this.agents[i].addGoal(goal);
    },
    addAgentsGoal : function (goal) {
        RVO.addAgentsGoal(goal.x, goal.y);
    },
    addAgentsSelectionGoal : function (goal) {
        for (var i = 0; i < BABYLON.Agent.NumAgents; i++)
            if (this.agents[i].getIsSelected())
                RVO.addAgentGoal(i, goal.x, goal.y);

        RVO.recomputeRoadmap();
    },
    computeRoadMap : function () {
        RVO.recomputeRoadmap();
    },
    addWayPoint : function (v, debug) {
        var wp = new RVO.WayPoint(v.x, v.y);
    },
    addObstacleByBoundingBox : function (mesh, position, isVisible) {
        var obstacle = new BABYLON.Obstacle();
        obstacle.addByBoundingBox(mesh, position, isVisible);
        this.obstacles.push(obstacle);
    },
    addObstaclesAsclosedPolygon : function (arr, debug) {
        var obstacle = new BABYLON.Obstacle();
        obstacle.addByClosedPolygon(arr, this.scene, debug);
        this.obstacles.push(obstacle);
    },
    processObstacles : function () {
        RVO.processObstacles();
    },
    removeObstacle : function (obstacleId) {
        var i = this.getIndexFromId(obstacleId, BABYLON.Obstacle.ObstaclesOrder);
        if (i == -1)
            return;

        this.obstacles[i].remove(i);
        this.obstacles.splice(i, 1);

        RVO.removeObstacles();

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
        RVO.run(this.iteration);
        RVO.X_Y_RAD = new Float32Array(this.dataHeap.buffer, this.dataHeap.byteOffset, this.data.length);

        var i = this.agents.length;
        while(i--){
            this.agents[i].update(i);
        }
    },
    deleteCrowd : function () {
        RVO.deleteCrowd();
    },
    setTimeStep : function (timeStep) {
        this.timeStep = timeStep;
        RVO.setTimeStep(this.timeStep);
    },
    setAgentMaxSpeed : function (agentId, maxSpeed) {
        RVO.setAgentMaxSpeed(agentId, maxSpeed);
    },
    setAgentRadius : function (agentId, radius) {
        RVO.setAgentRadius(agentId, radius);
    },
    setAgentMaxNeighbors : function (agentId, maxNeighbors) {
        RVO.setAgentMaxNeighbors(agentId, maxNeighbors);
    },
    setAgentNeighborDist : function (agentId, neighborDist) {
        RVO.setAgentNeighborDist(agentId, neighborDist);
    },
    setAgentPosition : function (agentId, position) {
        RVO.setAgentPosition(agentId, position.x, position.y);
    },
    setAgentPrefVelocity : function (agentId, prefVelocity) {
        RVO.setAgentPrefVelocity(agentId, prefVelocity.x, prefVelocity.y);
    },
    setAgentTimeHorizon : function (agentId, timeHorizon) {
        RVO.setAgentTimeHorizon(agentId, timeHorizon);
    },
    setAgentTimeHorizonObst : function (agentId, timeHorizonObst) {
        RVO.setAgentTimeHorizonObst(agentId, timeHorizonObst);
    },
    setAgentVelocity : function (agentId, velocity) {
        RVO.setAgentVelocity(agentId, velocity.x, velocity.y);
    },
    getAgentMaxNeighbors : function (agentId) {
        return RVO.getAgentMaxNeighbors(agentId);
    },
    getAgentMaxSpeed : function (agentId) {
        return RVO.getAgentMaxSpeed(agentId);
    },
    getAgentNeighborDist : function (agentId) {
        return RVO.getAgentNeighborDist(agentId);
    },
    getAgentRadius : function (agentId) {
        return RVO.getAgentRadius(agentId);
    },
    getAgentTimeHorizon : function (agentId) {
        return RVO.getAgentTimeHorizon(agentId);
    },
    getAgentTimeHorizonObst : function (agentId) {
        return RVO.getAgentTimeHorizonObst(agentId);
    },
    getAgentVelocity : function (agentId) {
        RVO.getAgentVelocity(agentId);

        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);
        var v = new RVO.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPosition : function (agentId) {
        RVO.getAgentPosition(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);

        var v = new RVO.V2(arr[0], arr[1]);
        return v;
    },
    getAgentPrefVelocity : function (agentId) {
        RVO.getAgentPrefVelocity(agentId);
        var arr = new Float32Array(this.dataHeap_reusable.buffer, this.dataHeap_reusable.byteOffset, this.data_reusable.length);
        var v = new RVO.V2(arr[0], arr[1]);
        return v;
    },
    allocateMem_X_Y_RAD : function () {
        this.data = new Float32Array(this.size);
        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);

        this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap.set(new Uint8Array(this.data.buffer));

        RVO.allocateMem_X_Y_RAD(this.dataHeap.byteOffset, this.data.length);
    },
    allocateMemReusable : function (size_t) {
        this.data_reusable = new Float32Array(size_t);
        var nDataBytes = this.data_reusable.length * this.data_reusable.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);

        this.dataHeap_reusable = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap_reusable.set(new Uint8Array(this.data_reusable.buffer));

        RVO.allocateMemResusable(this.dataHeap_reusable.byteOffset, this.data_reusable.length);
    },
    getIndexFromId : function (agentId, arr) {
        var exist = false;
        for (var i = 0; i < arr.length; i++)
            if (arr[i] == agentId) {
                exist = true;
                break;
            }
        if (!exist) {
            throw new Error("Crowd Error Agent || Obstacle id = " + agentId + " unknown from Crowd simulation");
            return -1;
        }
        return i;
    }
}

RVO.V2 = function(x,y){
    this.x = x || 0;
    this.y = y || 0;
};

RVO.Agent = function(simulation, position, radius, useRoadMap){
    this.simulation = simulation;

    this.position = position || new RVO.V2();
    this.orientation = 0;
    this.goal = new RVO.V2();
    this.useRoadMap = 1;
    this.isSelected = false;


    this.id = this.simulation.agents.length;

    this.radius = radius || 4;

    RVO.addAgent(this.position.x, this.position.y);
    RVO.setAgentRadius(this.id, this.radius);

    this.setUseRoadMap(useRoadMap);

    //Agent.AgentsNo++;
    //Agent.NumAgents++;
}

RVO.Agent.prototype = {
    constructor: RVO.Agent,
    remove : function (index) {
        //this.mesh.dispose();
        RVO.removeAgent(index);
        Agent.AgentsOrder.splice(index, 1);
        Agent.NumAgents--;
    },
    addGoal : function (goal) {
        RVO.addAgentGoal(this.id, goal.x, goal.y);
    },
    setUseRoadMap : function (useRoadmap) {
        this.useRoadMap = useRoadmap;
        RVO.setAgentUseRoadMap(this.id, this.useRoadMap);
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
    setOrientation : function (angle) {
        this.orientation = angle;
    },
    setIsSelected : function (isSelected) {
        this.isSelected = isSelected;

        /*var mat = new BABYLON.StandardMaterial("", this.mesh.getScene());
        if (this.isSelected) {
            mat.emissiveColor = new BABYLON.Color3(.2, .2, .8);
            mat.diffuseColor = new BABYLON.Color3(.2, .2, .5);
            this.mesh.material = mat;
        } else {
            this.mesh.material = this.matOriginal;
        }*/
    },
    update : function (id) {
        this.position.x = RVO.X_Y_RAD[id * 3 + 0];
        this.position.y = RVO.X_Y_RAD[id * 3 + 1];
        this.orientation = RVO.X_Y_RAD[id * 3 + 2];
    },
    getPosition : function () {
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




RVO.Obstacle = function () {
    this.id = Obstacle.ObstacleNo;
    Obstacle.ObstaclesOrder.push(this.id);
    Obstacle.NumObstacles++;
    Obstacle.ObstacleNo++;
}

RVO.Obstacle.prototype = {
    constructor: RVO.Obstacle,
    addByBoundingBox : function (position, isVisible) {

        mesh.getBoundingInfo()._update(this.mesh.getWorldMatrix());
        var bbox = mesh.getBoundingInfo().boundingBox;
        var min = bbox.minimumWorld;
        var max = bbox.maximumWorld;

        this.data = new Float32Array([max.x, max.z, min.x, max.z, min.x, min.z, max.x, min.z]);
        this.allocateMem();

        this.addToSimulation();

        _free(this.dataHeap.byteOffset);
    },
    addByClosedPolygon : function (arr, scene, debug) {
        var index = 0;
        this.data = new Float32Array(arr.length * 2);
        for (var i = 0; i < arr.length; i++) {
            this.data[index++] = arr[i].x;
            this.data[index++] = arr[i].y;
        }

        this.allocateMem();

        this.addToSimulation();

        _free(this.dataHeap.byteOffset);

        var lines = [];

        if (debug) {
            for (var i = 0; i < arr.length; i++) {
                lines[i] = new BABYLON.Vector3(arr[i].x, 0, arr[i].y);
            }

            lines.push(new BABYLON.Vector3(arr[0].x, 0, arr[0].y));
            this.mesh = BABYLON.Mesh.CreateLines("lines", lines, scene);
        }
    },
    rebuild : function () {
        this.allocateMem();
        this.addToSimulation();
        _free(this.dataHeap.byteOffset);
    },
    remove : function (index) {
        if (this.mesh)
            this.mesh.dispose();
        Obstacle.ObstaclesOrder.splice(index, 1);
        Obstacle.NumObstacles--;
    },
    addToSimulation : function () {
        BABYLON.CrowdPlugin.addObstacle(this.dataHeap.byteOffset, this.data.length);
    },
    allocateMem : function () {
        var nDataBytes = this.data.length * this.data.BYTES_PER_ELEMENT;
        var dataPtr = _malloc(nDataBytes);
        this.dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
        this.dataHeap.set(new Uint8Array(this.data.buffer));
    }
}



RVO.WayPoint = function (x, y) {
    RVO.addWayPoint(x, y);
}