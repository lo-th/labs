/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.SeaPool = function(parent){
    this.root = parent;
    this.meshes = {};
    this.callback = {};
}
V.SeaPool.prototype = {
    constructor: V.SeaPool,
    load:function(name, callback, displayList, noLoader){
        this.callback[name] = callback || function(){};
        this.noLoader = noLoader || false;
        var list = "";
        var loader = new THREE.SEA3D( true );
        if(!this.noLoader){
            loader.onProgress = function( e ) {
                this.root.loader.innerHTML = 'Loading '+ name +': '+(e.progress*100).toFixed(0)+'%';
            }.bind(this);
            loader.onDownloadProgress = function( e ) {
                this.root.loader.style.display = 'block';
            }.bind(this);
        }
        loader.onComplete = function( e ) {
            this.root.loader.style.display = 'none';
            this.meshes[name] = {};
            var i = loader.meshes.length, m;
            while(i--){
                m = loader.meshes[i];
                this.meshes[name][m.name] = m;
                list+=m.name+',';
            }
            if(displayList) console.log(list);
            this.callback[name]();
        }.bind(this);

        loader.parser = THREE.SEA3D.DEFAULT;
        loader.load( 'models/'+name+'.sea' );
        //loader.invertZ = true;
        //loader.flipZ = true;
    },
    getGeometry:function(obj, name, noRevers){
        noRevers = noRevers || false;
        var g = this.meshes[obj][name].geometry, mtx;
        if(!noRevers){
            mtx = new THREE.Matrix4().makeScale(1, 1, -1);
            g.applyMatrix(mtx);
            g.verticesNeedUpdate = true;
            g.normalsNeedUpdate = true;
        }
        g.computeFaceNormals();
    //g.normalizeNormals();
    g.computeVertexNormals(true);
    g.computeTangents() ;
        return g;
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

// TEXTURES

V.ImgPool = function(parent){
    this.root = parent;
    this.imgs = {};
}
V.ImgPool.prototype = {
    constructor: V.ImgPool,
    load:function(folder, url, callback){
        this.callback = callback || function(){};
        this.folder = folder || 'images/';
        if(typeof url == 'string' || url instanceof String){
            var singleurl = url;
            url = [singleurl];
        }
        this.total = url.length;
        this.root.loader.style.display = 'block';
        this.loadnext(url);
    },
    loadnext:function(url){
        var img = new Image();
        img.onload = function(){
            var name = url[0].substring(url[0].lastIndexOf("/")+1, url[0].lastIndexOf("."));
            this.imgs[name] = img;
            url.shift();
            if(url.length){
                this.root.loader.innerHTML = 'Loading images: '+ url.length;
                this.loadnext(url);
            }else{ 
                this.root.loader.style.display = 'none';
                this.callback();
            }
        }.bind(this);
        img.src = this.folder+url[0];
    },
    texture:function( name, flip, repeat, linear, format ){
        var tx = new THREE.Texture(this.imgs[name]);
        tx.flipY = flip || false;
        if(repeat)tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
        if(linear)tx.minFilter = tx.magFilter = THREE.LinearFilter;
        if(format)tx.format = THREE.RGBFormat;

        tx.needsUpdate = true;
        return tx;
    }
}


V.getVertex = function(geo, size) {
    var v = [], n;
    var pp, i;
    var isB = false;
    pp = geo.vertices;
    if(pp == undefined ){//is buffer
        pp = geo.attributes.position.array;
        isB = true;
        i = pp.length/3;
    } else {
        i = pp.length
    }
    while(i--){
        n = i*3;
        if(isB){// buffer geometry
            v[n+0]=pp[n+0]*size[0];
            v[n+1]=pp[n+1]*size[1];
            v[n+2]=pp[n+2]*size[2];
        }else{
            v[n+0]=pp[i].x*size[0];
            v[n+1]=pp[i].y*size[1];
            v[n+2]=pp[i].z*size[2];
        }
    }
    return v;
}

V.getFaces = function(geo, size) {
    var v = [], n, face, va, vb, vc;
    var pp = geo.faces;
    var pv = geo.vertices;
    var i = pp.length;
    while(i--){
        n = i*9; face = pp[i];
        va = pv[face.a]; vb = pv[face.b]; vc = pv[face.c];
        v[n+0]=va.x*size[0]; v[n+1]=va.y*size[1]; v[n+2]=va.z*size[2];
        v[n+3]=vb.x*size[0]; v[n+4]=vb.y*size[1]; v[n+5]=vb.z*size[2];
        v[n+6]=vc.x*size[0]; v[n+7]=vc.y*size[1]; v[n+8]=vc.z*size[2];
    }
    return v;
}