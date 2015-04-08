
/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

//--------------
//    PLAYER 
//--------------

V.BvhPlayer = function(parent){
	this.root = parent;
	this.reader = new V.BvhReader(this.root);
	this.model = null;
}

V.BvhPlayer.prototype = {
    constructor: V.BvhPlayer,
    init:function(){


    },
    skin:function(mesh, bsize){
    	if(this.model!==null) this.clearSkin();
    	this.model = mesh;
    	this.bones = this.model.skeleton.bones;
        this.boneInverses = this.model.skeleton.boneInverses;
        this.preservesBoneSize = bsize || false;

        /*var i = this.bones.length;
        while(i--){
        	console.log(this.bones[i].name);
        }*/

        this.root.scene.add(this.model);
    },
    clearSkin:function(){
    	this.root.scene.remove(this.model);
    	//this.model.material.dispose();
    	//this.model.geometry.dispose();
    },
    boneSize:function(v){
    	var s = v/30;
		if(s<0) s = 0.1;
    	this.reader.boneSize = s;
    },
    speed:function(speed){
    	this.reader.speed = speed || 1;
    },
    load:function(name, callback){
    	this.reader.load(name, callback);
    },
    update:function(){
    	this.reader.update();
    	if(this.model !== null) this.updateSkin();
    },
    updateSkin:function(){
    	var bone, node, name;
		var nodes = this.reader.Nodes;
		var len = this.bones.length;
		var globalMtx, localMtx, parentMtx, tmpMtx, worldMtx;
		var globalQuat = new THREE.Quaternion();
	    var globalPos = new THREE.Vector3();
	    var tmpPos = new THREE.Vector3();

	    for(var i=0; i<len; i++){
	        bone = this.bones[i];
	        name = bone.name;
	        worldMtx = bone.parent.matrixWorld;
	        parentMtx = bone.parent.mtx ? bone.parent.mtx : worldMtx;
	        if ( node = nodes[name] ){
				
				// LOCAL TO GLOBAL
				tmpMtx = node.matrixWorld.clone();
				globalPos.setFromMatrixPosition( tmpMtx );
	            globalQuat.setFromRotationMatrix( tmpMtx );

				// PREPARES MATRIX
				globalMtx = new THREE.Matrix4();	
				if (!bone.rootMatrix) bone.rootMatrix = bone.matrixWorld.clone();		
				
				// MODIFY TRANSFORM
	            globalMtx.makeRotationFromQuaternion( globalQuat );
				globalMtx.multiply( bone.rootMatrix );
				globalMtx.setPosition( globalPos );
				
				// GLOBAL TO LOCAL
				tmpMtx = new THREE.Matrix4().getInverse( worldMtx );
				localMtx = new THREE.Matrix4().multiplyMatrices( tmpMtx, globalMtx );
				globalMtx.multiplyMatrices( worldMtx, localMtx );

				// PRESERVES BONE SIZE
				if(this.preservesBoneSize && name!=='Hips'){
					tmpMtx = new THREE.Matrix4().getInverse( parentMtx );
					tmpPos.setFromMatrixPosition( bone.matrix );
	    			localMtx = new THREE.Matrix4().multiplyMatrices( tmpMtx, globalMtx );
	    			localMtx.setPosition( tmpPos );
	    			globalMtx = new THREE.Matrix4().multiplyMatrices( parentMtx, localMtx );
				}
	        } else {
	        	globalMtx = new THREE.Matrix4().multiplyMatrices( parentMtx, bone.matrix );
			}

			// UPDATE BONE
			bone.mtx = globalMtx;
	    }
    }
}

//---------------------
//   THREE BONE HACK 
//---------------------

THREE.Skeleton.prototype.update = ( function () {

	var offsetMatrix = new THREE.Matrix4();
	
	return function () {

		// flatten bone matrices to array

		//for ( var b = 0, bl = this.bones.length; b < bl; b ++ ) {
		var b =  this.bones.length;
		while(b--){

			// compute the offset between the current and the original transform
            if(!this.bones[ b ].mtx ) this.bones[ b ].mtx = this.bones[ b ].matrixWorld; 

			var matrix = this.bones[ b ] ? this.bones[ b ].mtx : this.identityMatrix;
            //var matrix = this.bones[ b ] ? this.bones[ b ].matrixWorld : this.identityMatrix;

			offsetMatrix.multiplyMatrices( matrix, this.boneInverses[ b ] );
			//offsetMatrix.multiplyMatrices(  this.boneInverses[ b ], matrix );
			offsetMatrix.flattenToArrayOffset( this.boneMatrices, b * 16 );
		}

		if ( this.useVertexTexture ) {
			this.boneTexture.needsUpdate = true;
		}
		
	};

} )();


//--------------
//    READER 
//--------------

V.BvhReader = function(parent){
	this.root = parent;
	this.debug = true;
	this.type = "";
	this.data = null;
	this.rootBone = null;
	this.numFrames = 0;
	this.secsPerFrame = 0;
	this.play = false;
	this.channels = null;
	this.lines = "";
	
	this.speed = 0.5;

	this.nodes = null;
	this.order = {};

	this.ParentNodes = null;
	this.ChildNodes = null;
	this.BoneByName = null;
	this.Nodes = null;

	
	this.frame = 0;
	this.oldFrame = 0;
	this.startTime = 0;
	
	this.position = new THREE.Vector3( 0, 0, 0 );
	this.scale = 1;

	this.tmpOrder = "";
	this.tmpAngle = [];

	this.skeleton = null;
	this.bones = [];
	this.nodesMesh = [];

	this.boneSize = 0.4;
	this.nodeSize = 0.4;

	this.endFunction = null;

	// geometry
	this.boxgeo = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry( 1.5, 1.5, 1 ) );
    this.boxgeo.applyMatrix( new THREE.Matrix4().makeTranslation( 0, 0, 0.5 ) );

    this.nodegeo = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry ( this.nodeSize, 8, 6 ) );

	// material
    this.boneMaterial = new THREE.MeshBasicMaterial({ color:0xffff44 });
    this.nodeMaterial = new THREE.MeshBasicMaterial({ color:0x88ff88 });
}

V.BvhReader.prototype = {
    constructor: V.BvhReader,

    load:function(fname, callback){
    	this.callback = callback || function(){};
    	this.type = fname.substring(fname.length-3,fname.length);
			
		if(this.type === 'bvh'){// direct from file
			var xhr = new XMLHttpRequest();
		    xhr.open( 'GET', fname, true );
			xhr.onreadystatechange = function(){ if ( xhr.readyState == 4 ){ this.parseData(xhr.responseText.split(/\s+/g));}}.bind(this);
			xhr.send( null );
	    } else if(this.type === 'png'){// from png link
	    	window.top.main.transcode.load(fname, function(string) { this.parseData(string.split(/\s+/g))}.bind(this) );
		}
    },
    parseData:function(data){
    	this.data = data;
		this.channels = [];
		this.nodes = [];
		this.Nodes = {};
		this.distances = {};

		this.ParentNodes = {};
		this.ChildNodes = {};
		this.BoneByName = {};
		var done = false;
		while (!done) {
			switch (this.data.shift()) {
			case 'ROOT':
			    if(this.rootBone !== null) this.clearNode();
			    if(this.skeleton !== null) this.clearSkeleton();

				this.rootBone = this.parseNode(this.data);
				this.rootBone.position.copy(this.position);
				this.rootBone.scale.set(this.scale,this.scale,this.scale);

				break;
			case 'MOTION':
				this.data.shift();
				this.numFrames = parseInt( this.data.shift() );
				this.data.shift();
				this.data.shift();
				this.secsPerFrame = parseFloat(this.data.shift());
				done = true;
			}
		}

		console.log("BVH frame:"+this.numFrames+" s/f:"+this.secsPerFrame + " channels:"+this.channels.length + " node:"+ this.nodes.length);
		//debugTell("BVH frame:"+this.numFrames+" s/f:"+this.secsPerFrame + " channels:"+this.channels.length + " node:"+ this.nodes.length);
		this.getDistanceList();
		this.getNodeList();

		if(this.debug) this.addSkeleton();

		this.startTime = Date.now();
		this.play = true;
    },
    reScale:function (s) {
    	this.scale = s;
    	if(this.rootBone)this.rootBone.scale.set(this.scale,this.scale,this.scale);
    },
    rePosition:function (v) {
    	this.position = v;
    	this.rootBone.position.copy(this.position);
    },
    getDistanceList:function () {
    	this.distances = {};
    	var n = this.nodes.length, node, name;
    	while (n--){
    		node = this.nodes[n];
    		name = node.name;
    		if(node.children.length){
    			this.distances[name] = V.DistanceTest(new THREE.Vector3().setFromMatrixPosition( node.matrixWorld ), node.children[0].position);
    		} else this.distances[name] = 2;
    	}
    },
    getNodeList:function () {
    	var n = this.nodes.length, node, s = "", name, p1,p2;
    	for(var i=0; i<n; i++){
    		node = this.nodes[i];
    		name = node.name;

    		this.Nodes[name] = node;
    		if(node.parent){ 
    			this.ParentNodes[name] = node.parent; 
    		} else this.ParentNodes[name] = null;
		    if(node.children.length){
		    	//p1 = new THREE.Vector3().setFromMatrixPosition( node.matrixWorld )
		    	//p2 = node.children[0].position;
		    	//this.distances[name] = BVH.DistanceTest(p1, p2);
		    	this.ChildNodes[name] = node.children[0]; 
		    } else{
		        this.ChildNodes[name] = null; 
		        //this.distances[name] = 2;
		    }
            
    		s += node.name + " _ "+ i +"<br>"//+" _ "+node.parent.name +" _ "+node.children[0].name+"<br>";
    	}

    	//console.log(this.distances)
    	//if(out2)out2.innerHTML = s;
    	this.callback();
    	if(this.endFunction!== null)this.endFunction();
    },
    showHideSkeleton:function (b) {
    	if(b) this.skeleton.visible = true;
    	else this.skeleton.visible = false;
    },
    addSkeleton:function () {
    	this.skeleton = new THREE.Group();
    	this.bones = [];
    	this.nodesMesh = [];

    	var n = this.nodes.length, node, bone;

    	for(var i=0; i<n; i++){
    		node = this.nodes[i];

    		this.nodesMesh[i] = new THREE.Mesh( this.nodegeo, this.nodeMaterial  )
    		this.skeleton.add(this.nodesMesh[i]);

    		if ( node.name !== 'Site' ){
    			bone = new THREE.Mesh( this.boxgeo, this.boneMaterial);
    			bone.castShadow = true;
                bone.receiveShadow = true;
    			bone.rotation.order = 'XYZ';
	    		bone.name = node.name;
	    		this.skeleton.add(bone);
	    		this.bones[i] = bone;
	    		this.BoneByName[node.name]= bone;
    	    }
    	}
    	this.root.scene.add( this.skeleton );
    },
    clearSkeleton:function () {
    	var n = this.skeleton.children.length;
    	while(n--){
    		this.skeleton.remove(this.skeleton.children[n]);
    	}
    	this.root.scene.remove( this.skeleton );
    	this.skeleton = null;
    },
    updateSkeleton:function (  ) {
    	var mtx, node, bone, name;
    	var n = this.nodes.length;
    	var target;
    	for(var i=0; i<n; i++){
    		node = this.nodes[i];
    		bone = this.bones[i];
    		name = node.name;

    		mtx = node.matrixWorld;

    		this.nodesMesh[i].position.setFromMatrixPosition( mtx );

    		if ( name !== 'Site' ){
	    		
	    		bone.position.setFromMatrixPosition( mtx );
	    		//this.skeletonBones[i].rotation.setFromRotationMatrix( mtx );
	    		if(node.children.length){
	    			target = new THREE.Vector3().setFromMatrixPosition( node.children[0].matrixWorld );
	    			bone.lookAt(target);
	    			bone.rotation.z = 0;

	    			//if(bone.name==="Head")bone.scale.set(this.boneSize*2,this.boneSize*2,BVH.DistanceTest(bone.position, target)*(this.boneSize*1.3));
	    			//else bone.scale.set(this.boneSize,this.boneSize,BVH.DistanceTest(bone.position, target));
	    			if(name=="Head")bone.scale.set(this.boneSize*2,this.boneSize*2,this.distances[name]*(this.boneSize*1.3));
	    			else bone.scale.set(this.boneSize,this.boneSize,this.distances[name]);
	    		}
	    		/*if(node.parent){
	    			target = new THREE.Vector3().setFromMatrixPosition( node.parent.matrixWorld );
	    			this.skeletonBones[i].lookAt(target);
	    		}*/
	    	}
    	}
    },
	transposeName:function(name){
		if(name==="hip" || name==="SpineBase") name = "Hips";
		if(name==="abdomen" || name==="SpineBase2") name = "Spine1";
		if(name==="chest" || name==="SpineMid") name = "Chest";
		if(name==="neck" || name==="Neck2") name = "Neck";
		if(name==="head") name = "Head";
		if(name==="lCollar") name = "LeftCollar";
		if(name==="rCollar") name = "RightCollar";
		if(name==="lShldr") name = "LeftUpArm";
		if(name==="rShldr") name = "RightUpArm";
		if(name==="lForeArm") name = "LeftLowArm";
		if(name==="rForeArm") name = "RightLowArm";
		if(name==="lHand") name = "LeftHand";
		if(name==="rHand") name = "RightHand";
		if(name==="lFoot") name = "LeftFoot";
		if(name==="rFoot") name = "RightFoot";
		if(name==="lThigh") name = "LeftUpLeg";
		if(name==="rThigh") name = "RightUpLeg";
		if(name==="lShin") name = "LeftLowLeg";
		if(name==="rShin") name = "RightLowLeg";

		// leg
		if(name==="RightHip" || name==="HipRight") name = "RightUpLeg";
		if(name==="LeftHip" || name==="HipLeft") name = "LeftUpLeg";
		if(name==="RightKnee" || name==="KneeRight") name = "RightLowLeg";
		if(name==="LeftKnee" || name==="KneeLeft") name = "LeftLowLeg";
		if(name==="RightAnkle" || name==="AnkleRight") name = "RightFoot";
		if(name==="LeftAnkle" || name==="AnkleLeft") name = "LeftFoot";
		// arm
		if(name==="RightShoulder" || name==="ShoulderRight") name = "RightUpArm";
		if(name==="LeftShoulder" || name==="ShoulderLeft") name = "LeftUpArm";
		if(name==="RightElbow" || name==="ElbowRight") name = "RightLowArm";
		if(name==="LeftElbow" || name==="ElBowLeft") name = "LeftLowArm";
		if(name==="RightWrist" || name==="WristRight") name = "RightHand";
		if(name==="LeftWrist"|| name==="WristLeft") name = "LeftHand";

		if(name==="rcollar" || name==="CollarRight") name = "RightCollar";
		if(name==="lcollar" || name==="CollarLeft") name = "LeftCollar";

		if(name==="rtoes") name = "RightToe";
		if(name==="ltoes") name = "LeftToe";

		if(name==="upperback") name = "Spine1";
		
		return name;
	},
    parseNode:function(data){
    	var name, done, n, node, t;
		name = data.shift();
		name = this.transposeName(name);
		node = new THREE.Group();


		//node = new THREE.Mesh( this.nodegeo, this.nodeMaterial  )
		//node.add(b);
		node.name = name;

		done = false;
		while ( !done ) {
			switch ( t = data.shift()) {
				case 'OFFSET':
					node.position.set( parseFloat( data.shift() ), parseFloat( data.shift() ), parseFloat( data.shift() ) );
					node.offset = node.position.clone();
					break;
				case 'CHANNELS':
					n = parseInt( data.shift() );
					for ( var i = 0;  0 <= n ? i < n : i > n;  0 <= n ? i++ : i-- ) { 
						this.channels.push({ node: node, prop: data.shift() });
					}
					break;
				case 'JOINT':
				case 'End':
					node.add( this.parseNode(data) );
					break;
				case '}':
					done = true;
			}
		}
		//
		this.nodes.push(node);
		//console.log(name);

		//this.Nodes[node.name] = node;
		   // if(node.parent){this.ParentNodes[node.name] = node.parent.name; console.log('pp')}
		   // else this.ParentNodes[node.name] = null;

		//if(name == 'Hips') scene.add( node );

		return node;
    },
    clearNode:function(){
    	//console.log('clear');
    	var i;
    	//if(out2)out2.innerHTML = "";

    	if(this.nodes){

	    	for (i=0; i<this.nodes.length; i++){
				this.nodes[i] = null;
			}
			this.nodes.length = 0;

			/*if(this.bones.length > 0){
		    	for ( i=0; i<this.bones.length; i++){
					if(this.bones[i]){
						this.bones[i].geometry.dispose();
					}
				}
				this.bones.length = 0;
		        scene.remove( this.skeleton );
		   }*/
		}
    },
    animate:function(){
    	//debugTell("frame" +  this.frame);
    	var ch;
		var n =  this.frame % this.numFrames * this.channels.length;
		var ref = this.channels;
		var isRoot = false;

		for ( var i = 0, len = ref.length; i < len; i++) {
			ch = ref[ i ];
			if(ch.node.name === "Hips") isRoot = true;
			else isRoot = false;


			switch ( ch.prop ) {
				case 'Xrotation':
				    this.autoDetectRotation(ch.node, "X", parseFloat(this.data[n]));
					//ch.node.rotation.x = (parseFloat(this.data[n])) * V.ToRad;
					break;
				case 'Yrotation':
				    this.autoDetectRotation(ch.node, "Y", parseFloat(this.data[n]));
					//ch.node.rotation.y = (parseFloat(this.data[n])) * V.ToRad;
					break;
				case 'Zrotation':
				    this.autoDetectRotation(ch.node, "Z", parseFloat(this.data[n]));
					//ch.node.rotation.z = (parseFloat(this.data[n])) * V.ToRad;
					break;
				case 'Xposition':
				    if(isRoot) ch.node.position.x = ch.node.offset.x + parseFloat(this.data[n])+ this.position.x;
					else ch.node.position.x = ch.node.offset.x + parseFloat(this.data[n]);
					break;
				case 'Yposition':
				    if(isRoot) ch.node.position.y = ch.node.offset.y + parseFloat(this.data[n])+ this.position.y;
					else ch.node.position.y = ch.node.offset.y + parseFloat(this.data[n]);
					break;
				case 'Zposition':
				    if(isRoot) ch.node.position.z = ch.node.offset.z + parseFloat(this.data[n])+ this.position.z;
					else ch.node.position.z = ch.node.offset.z + parseFloat(this.data[n]);
				break;
			}

			n++;
		}

		if(this.bones.length > 0) this.updateSkeleton();
		
    },
    autoDetectRotation:function(Obj, Axe, Angle){

    	this.tmpOrder += Axe;
    	var angle = Angle * V.ToRad;

    	if(Axe === "X")this.tmpAngle[0] = angle;
    	else if(Axe === "Y")this.tmpAngle[1] = angle;
    	else this.tmpAngle[2] = angle;

    	if(this.tmpOrder.length===3){
    		//console.log(this.tmpOrder)
    		var e = new THREE.Euler( this.tmpAngle[0], this.tmpAngle[1], this.tmpAngle[2], this.tmpOrder );
    		this.order[Obj.name] =  this.tmpOrder;

    		//Obj.rotation.order = this.tmpOrder;
    		//Obj.rotation.copy(e);
    		//Obj.quaternion.setFromEuler(e);

    		Obj.setRotationFromEuler(e);
    		Obj.updateMatrixWorld();

    		this.tmpOrder = "";
    		this.tmpAngle.length = 0;
    	}

    },
    update:function(){
    	if ( this.play ) { 
			this.frame = ((((Date.now() - this.startTime) / this.secsPerFrame / 1000) )*this.speed)| 0;
			if(this.oldFrame!==0)this.frame += this.oldFrame;
			if(this.frame > this.numFrames ){this.frame = 0; this.oldFrame=0; this.startTime = Date.now(); }

			this.animate();
		}
    },
    next:function(){
    	this.play = false;
    	this.frame ++;
    	if(this.frame > this.numFrames )this.frame = 0;
    	this.animate();
    },
    prev:function(){
    	this.play = false;
    	this.frame --;
    	if(this.frame<0)this.frame = this.numFrames;
    	this.animate();
    }

}

V.DistanceTest = function( p1, p2 ){
    var x = p2.x-p1.x;
    var y = p2.y-p1.y;
    var z = p2.z-p1.z;
    var d = Math.sqrt(x*x + y*y + z*z);
    if(d<=0)d=0.1;
    return d;
}