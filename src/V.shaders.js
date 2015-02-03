V.Shader = function(name, parameters, isEdit){
    THREE.ShaderMaterial.call( this, parameters );
    this.parameters = parameters;
    
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
    }.bind(this);
    xhr.open('GET', 'shaders/'+name+'.js', true);
    xhr.send();
}





V.Ground = {
    uniforms:{
    tmap : { type: "t", value: null },
    tdeep : { type: "t", value: null },
    tover : { type: "t", value: null },
    tluma : { type: "t", value: null },
    alpha : {type: "f", value: 1.0 },
    overlay : {type: "i", value: 0 },
    luma : {type: "i", value: 0 },
    lllpos : { type: "v3", value: new THREE.Vector3() },
    offset : { type: "v2", value: new THREE.Vector2() },
    range : { type: "v2", value: new THREE.Vector2() },
    tDisplacement: { type: "t", value: null },
    uDisplacementBias: { type: "f", value: -3.0 },
    uDisplacementScale: { type: "f", value: 6.0 }/*,

    "size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },
    "cameraNear":   { type: "f", value: 0.1 },
    "cameraFar":    { type: "f", value: 3 },
    "onlyAO":       { type: "i", value: 0 },
    "aoClamp":      { type: "f", value: 0.5 },
    "lumInfluence": { type: "f", value: 0.5 },
    "attenuation": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
    "texelSize": { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
    "occluderBias":      { type: "f", value: 0.5 },
    "samplingRadius": { type: "f", value: 0.5 }*/
    },
    fs: [
    "uniform sampler2D tdeep;",
    "uniform sampler2D tmap;",
    "uniform sampler2D tover;",
    "uniform sampler2D tluma;",
    "uniform vec3 lllpos;",
    
    "uniform int overlay;",
    "uniform int luma;",
    "uniform float alpha;",
    "varying vec2 vUv2;",
    "varying vec2 vUv;",
    "varying vec3 vNormal;",
    "varying vec3 pos;",

    "void main() {",
        "vec4 color = vec4(1.0, 1.0, 1.0, 1.0);",
        "float factor = 1.0;",
        "if(luma == 1){",
            //"if(pos.y<0.1)color *= texture2D(tluma, vUv2).xyz;",
            "vec4 addedLights = vec4(0.0,0.0,0.0,1.0);",
            //"vec3 posl = vec3(30.0,30.0,30.0);",
            "vec3 colorl = vec3(1.0,1.0,1.0);",
            
            //"for(int l = 0; l < 1; l++) {",
            "vec3 lightDirection = normalize(pos - vec3(lllpos.x, lllpos.y+10.0, lllpos.z));",
              //  "vec3 lightDirection = normalize(pos - vec3(lllpos.x, pos.y+lllpos.y, lllpos.z));",
                "addedLights.rgb += clamp(dot(-lightDirection, vNormal), 0.0, 1.0) * colorl;",
            //"}",
            "color*=addedLights;",
        "}",
        "if(overlay == 1) color *= texture2D(tover, vUv2);",
        //"gl_FragColor *= texture2D(tmap, vUv);",
        "vec3 map = texture2D(tmap, vUv).xyz;",
        //"vec3 map = texture2D(tdeep, vUv2).xyz;",
        //"gl_FragColor = vec4(mix(map,color,factor), alpha);",
       //"gl_FragColor = vec4(map*color*vNormal, alpha);",
        "gl_FragColor = vec4(map, alpha)*color;",
    "}"
    ].join("\n"),
    vs: [
    "uniform sampler2D tdeep;",
    "uniform float uDisplacementScale;",
    "uniform float uDisplacementBias;",
    "uniform vec2 offset;",
    "uniform vec2 range;",
    "varying vec2 vUv;",
    "varying vec2 vUv2;",
    "varying vec3 vNormal;",
    "varying vec3 pos;",
    "void main() {",
        "vNormal = normalize( normalMatrix * normal );",

        "vUv = uv;",
        //"pos = position;",
        "vUv2 = (vec2(position.x, position.z)+offset)/range;",
        "vUv2.y = 1.0-vUv2.y;",// reverse Y
        "vec3 dv = texture2D( tdeep, vUv2 ).xyz;",
        "float df = (uDisplacementScale * dv.x) + uDisplacementBias;",
        "vec3 displacedPosition = position;",
        "displacedPosition.y += df;",
        "pos = displacedPosition;",
        "pos = (modelMatrix * vec4(displacedPosition, 1.0 )).xyz;",

        "gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition,1.0);",
    "}"
    ].join("\n")
}
