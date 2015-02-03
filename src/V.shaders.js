V.Shader = function(name, parameters, isEdit, callback){
    THREE.ShaderMaterial.call( this, parameters );
    this.parameters = parameters;
    this.callback = callback || function(){};

    if(isEdit) this.editor(name);
    else this.loading(name, parameters);
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

V.Shader.prototype.apply = function(shad){
    this.uniforms = THREE.UniformsUtils.clone( shad.uniforms );
    this.vertexShader = shad.vs;
    this.fragmentShader  = shad.fs;
    this.needsUpdate = true;
    for ( var key in this.parameters ) {
        if(this.uniforms[key]) this.uniforms[key].value = this.parameters[key];
    }
}

V.Shader.prototype.loading = function(name) {
    var xhr;
    if (window.XMLHttpRequest) xhr = new XMLHttpRequest();
    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");
    xhr.onload = function(e) {
        var s = eval(xhr.responseText);
        this.uniforms = s.uniforms;
        this.vertexShader = s.vs;
        this.fragmentShader  = s.fs;
        this.needsUpdate = true;
        for ( var key in this.parameters ) {
            if(this.uniforms[key]){ this.uniforms[key].value = this.parameters[key]; console.log(key)}
        }
        this.callback();
    }.bind(this);
    xhr.open('GET', 'shaders/'+name+'.js', true);
    xhr.send();
}