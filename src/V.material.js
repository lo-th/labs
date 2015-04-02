/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/
 
V.Material = function(parent){
    this.root = parent;
    this.shaders = [];
}

V.Material.prototype = {
    constructor: V.Material,
    basic:function(obj){
        var id = this.shaders.length;
        this.shaders[id] = new THREE.MeshBasicMaterial(obj);
        return this.shaders[id];
    }
}