/**
 * @author loth / http://lo-th.github.io/labs/
 */

V.SeaPool = function(){
    this.meshes = {};
}
V.SeaPool.prototype = {
    constructor: V.SeaPool,
    load:function(name, callback, displayList){
        this.callback = callback || function(){};
        var list = "";
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {
            this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                this.meshes[name][m.name] = m;
                list+=m.name+',';
            }
            if(displayList) console.log(list);
            this.callback();
        }.bind(this);
        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/'+name+'.sea' );
    }
}

V.ProjectUV = function( g, mat ){
    if ( g.boundingBox === null ) g.computeBoundingBox();
    var max = g.boundingBox.max;
    var min = g.boundingBox.min;
    mat.uniforms.offset.value = new THREE.Vector2(0 - min.x, 0 - min.z);
    mat.uniforms.range.value = new THREE.Vector2(max.x - min.x, max.z - min.z);
}

V.TransGeo = function(g, noBuffer){
    g.mergeVertices();
    //g.computeVertexNormals( true );
    //g.computeTangents();
    //g.computeBoundingBox();
    //g.computeBoundingSphere();
    g.verticesNeedUpdate = true;
    g.normalsNeedUpdate = true;
    //g.colorsNeedUpdate = true;

    g.computeFaceNormals();
    //g.normalizeNormals();
    g.computeVertexNormals(true);
    g.computeTangents() ;


    //console.log(g.hasTangents) 

    //g.dynamic = false;

    if(!noBuffer){
        var bg = new THREE.BufferGeometry().fromGeometry(g);
        g.dispose();
        return bg;
    } else{
        return g;
    }
}