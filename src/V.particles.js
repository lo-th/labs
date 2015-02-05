/**
 * @author loth / http://lo-th.github.io/labs/
 */
 
V.Particle = function(parent, obj){
    this.root = parent;
    this.mode = this.root.renderMode;
    this.radius = obj.radius || 0.25;

    if(this.mode == 'metaball'){
        this.particles = [];
    }else{
        this.geometry = new THREE.Geometry();
        this.material = new THREE.PointCloudMaterial( { size:this.radius*4, sizeAttenuation: true, map:this.makeSprite(), transparent: true} )
        this.particles = new THREE.PointCloud( this.geometry, this.material );
        this.particles.sortParticles = true;
        this.particles.dynamic = true;
        var n = obj.n || 0;
        var i = n;
        while(i--) this.addV();
        this.root.scene.add( this.particles );
    }
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
        if(this.mode == 'metaball') return this.particles.length;
        else return this.particles.geometry.vertices.length;
    },
    addNum:function(n){
        var i = n;
        while(i--) this.addV();
        if(this.mode !== 'metaball')this.update();
    },
    addV : function (x,y,z) {
        var vec = new THREE.Vector3(x||0,y||0,z||0);
        if(this.mode == 'metaball'){
            this.particles.push(v.addBlob(vec, this.radius*4, true));
        }else{ 
            this.particles.geometry.vertices.push( vec );
            this.particles.geometry.dispose();
        }
    },
    move : function(n, x, y, z){
        if(this.mode == 'metaball'){
            this.particles[n].position.set(x,y,z);
            this.particles[n].update(this.root.nav.camera.rotation);
        }else{
            if(this.geometry.vertices[n]){
                this.geometry.vertices[n].x = x || 0;
                this.geometry.vertices[n].y = y || 0;
                this.geometry.vertices[n].z = z || 0;
            }
        }
    },
    update : function(){
        if(this.mode !== 'metaball')this.geometry.verticesNeedUpdate = true;
    }
}

V.Point = function(x,y,z,r,c,s){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.r = r || 0; // extra rotation
    this.c = c || 0; // extra corner
    this.s = s || 0; // extra side
}