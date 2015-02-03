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