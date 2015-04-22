/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author l.th / http://lo-th.github.io/labs/
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