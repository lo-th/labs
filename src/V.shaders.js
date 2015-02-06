/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.Shader = function(name, parameters, isEdit, callback){
    this.isEdit = isEdit || false;
    THREE.ShaderMaterial.call( this, parameters );
    this.isActive = false;
    this.visible = false;
    this.parameters = parameters;
    this.callback = callback || function(){};
    this.oldUniforms = null;

    //if(isEdit) this.editor(name);
    //else 

    this.loading(name, parameters);
}
V.Shader.prototype = Object.create( THREE.ShaderMaterial.prototype );
V.Shader.prototype.constructor = V.Shader;

V.Shader.prototype.editor = function(name){
    window.top.main.shader.open(name);
}

V.Shader.prototype.up = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value = n;
}

V.Shader.prototype.upColor = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value.setRGB( n[0]/255, n[1]/255, n[2]/255);
}

V.Shader.prototype.upBool = function(name, n){
    if(this.uniforms[name])this.uniforms[name].value = n ? 1:0;
}

V.Shader.prototype.init = function(parameters){
    this.setValues( parameters );
}
V.Shader.prototype.updateShader = function(txt){
    this.oldUniforms = this.uniforms;
    //console.log(this.parameters)
    this.dispose();
    this.isActive = false;
    var s = eval(txt);
    this.apply(s, true);
}
V.Shader.prototype.apply = function(s, isUpdate){
    if(isUpdate)this.uniforms = this.oldUniforms;
    else {
        this.uniforms = THREE.UniformsUtils.clone( s.uniforms );
        for ( var key in this.parameters ) {
            if(this.uniforms[key]) this.uniforms[key].value = this.parameters[key];
        }
    }
    this.vertexShader = s.vs;
    this.fragmentShader = s.fs;
    
    this.needsUpdate = true;
    this.isActive = true;
    this.visible = true;
    if(!isUpdate)this.callback();
}

V.Shader.prototype.loading = function(name) {
    //var s = V.LoadShader(name);
    //this.apply(s);
    var xhr;
    if (window.XMLHttpRequest) xhr = new XMLHttpRequest();
    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");
    xhr.onload = function(e) {
        var s = eval(xhr.responseText);
        this.apply(s);
        if(this.isEdit) window.top.main.shader.pushShader(name, s);
    }.bind(this);
    xhr.open('GET', 'shaders/'+name+'.js', true);
    xhr.send();
}

V.LoadShader = function(name){
    var xhr;
    if (window.XMLHttpRequest) xhr = new XMLHttpRequest();
    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");
    xhr.onload = function(e) {
        var s = eval(xhr.responseText);
        return s;
    }
    xhr.open('GET', 'shaders/'+name+'.js', true);
    xhr.send();
}