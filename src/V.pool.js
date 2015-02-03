V.SeaPool = function(){
    this.meshes = {};
}
V.SeaPool.prototype = {
    constructor: V.SeaPool,
    load:function(name, end, displayList){
        var list = "";
        var _this = this;
        var loader = new THREE.SEA3D( true );
        loader.onComplete = function( e ) {

            _this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                _this.meshes[name][m.name] = m;
                list+=m.name+',';
            }
            if(displayList) console.log(list);
            if(end)end();
        }
        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/'+name+'.sea' );
    }
}

V.BufferGeo = function(g, rev){
    if(rev){
        var mtx = new THREE.Matrix4().makeScale(1, 1, -1);
        g.applyMatrix(mtx);
        //g.computeBoundingBox();
        //g.computeBoundingSphere();
    }
    g.mergeVertices();
    g.computeVertexNormals( true );
    //g.computeFaceNormals();
    //g.computeMorphNormals()
    g.computeTangents();
    g.verticesNeedUpdate = true;

    g.dynamic = false;
    var Bufferg = new THREE.BufferGeometry().fromGeometry(g);
    g.dispose();
    return Bufferg;
}

V.ProjectUV = function( g, mat ){
    if ( g.boundingBox === null ) g.computeBoundingBox();
    var max = g.boundingBox.max;
    var min = g.boundingBox.min;
    mat.up('offset', new THREE.Vector2(0 - min.x, 0 - min.z));
    mat.up('range', new THREE.Vector2(max.x - min.x, max.z - min.z));
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