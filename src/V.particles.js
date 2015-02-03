
V.Particle = function(parent, obj){
    this.root = parent;
    var r = obj.radius || 0.25;
    this.geometry = new THREE.Geometry();
    this.material = new THREE.PointCloudMaterial( { size:r*2, sizeAttenuation: true, map:this.makeSprite(), transparent: true} )
    this.particles = new THREE.PointCloud( this.geometry, this.material );
    this.particles.sortParticles = true;
    this.particles.dynamic = true;
    var n = obj.n || 0;
    var i = n;
    while(i--) this.addV();
    this.root.scene.add( this.particles );
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
        return this.particles.geometry.vertices.length;
    },
    addNum:function(n){
        
        var i = n;
        while(i--) this.addV();
        this.update()
        //console.log(n,this.particles.geometry.vertices.length )
    },
    addV : function (x,y,z) {
        var v = new THREE.Vector3(x||0,y||0,z||0);
        this.particles.geometry.vertices.push( v );
        this.particles.geometry.dispose();
    },
    move : function(n, x, y, z){
        if(this.geometry.vertices[n]){
            this.geometry.vertices[n].x = x || 0;
            this.geometry.vertices[n].y = y || 0;
            this.geometry.vertices[n].z = z || 0;
        }
    },
    update : function(){
        this.geometry.verticesNeedUpdate = true;
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