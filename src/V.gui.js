/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var dat;

V.Gui = function(isWithModel){
    this.gui = new dat.GUI();
    this.tmp = {};
    if(isWithModel) this.model3d();
}
V.Gui.prototype = {
    constructor: V.Gui,
    model3d:function(){
        this.gui.add(v, 'model', V.MeshList ).onChange(function(){v.addModel(shader)});
    },
    color:function(name, c){
        var _this = this;
        this.tmp[name] = [c["r"]*255, c.g*255, c.b*255];
        this.gui.addColor(this.tmp, name).onChange(function(){ shader.upColor(name, _this.tmp[name]) });
    },
    int:function(name, c){
        var _this = this;
        this.tmp[name] = c ? true : false;
        this.gui.add(this.tmp, name).onChange(function(){ shader.upBool(name, _this.tmp[name]) });
    },
    float:function(name, c){
        var _this = this;
        this.tmp[name] = c;
        this.gui.add(this.tmp, name).step(0.1).onChange(function(){ shader.up(name, _this.tmp[name]) });
        //this.gui.add(this.tmp, name, 0, 2).step(0.1).onChange(function(){ shader.up(name, _this.tmp[name]) });
    },
    textures:function(name){

    }
}


// -----------------------------------

V.Environment = function(){
    this.shaders = [];
    this.envLists = ['e_chrome.jpg','e_black.jpg','e_brush.jpg', 'e_metal.jpg','e_plastic.jpg','e_plastic_r.jpg','e_smooth.jpg','env.jpg','env0.jpg','env1.jpg'];
    this.nEnv = 0;
    this.init();
}

V.Environment.prototype = {
    constructor: V.Environment,
    init:function(){
        var env = document.createElement('div');
        env.className = 'environment';
        var canvas = document.createElement( 'canvas' );
        canvas.width = canvas.height = 64;
        env.appendChild( canvas );
        this.envcontext = canvas.getContext('2d');
        env.onclick = function(){this.load()}.bind(this);
        document.body.appendChild( env );
        this.load();
    },
    load: function(){
        var img = new Image();
        img.onload = function(){
            this.nEnv++;
            if(this.nEnv==this.envLists.length) this.nEnv = 0;
            this.envcontext.drawImage(img, 0, 0, 64,64);
            
            this.environment = new THREE.Texture(img);
            this.environment.needsUpdate = true;

            var i = this.shaders.length;
            while(i--){if(this.shaders[i].isActive) this.shaders[i].uniforms.env.value = this.environment;}
        }.bind(this);
        img.src = 'images/spherical/'+this.envLists[this.nEnv];
    },
    add:function(mat){
        this.shaders.push(mat);
    }
}