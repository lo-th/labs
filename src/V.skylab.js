/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.Skylab = function(parent){
	this.root = parent;
	this.env = null;
	this.isRender = false;

	this.settings = {
		distance:400000,
		turbidity: 10,
		reileigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		elevation: 0.49, // elevation / inclination
		azimuth: 0.27, // 0.25 Facing front,
	}

	//this.root.environment = new THREE.Texture();
    //this.root.environment.mapping = THREE.SphericalReflectionMapping;
    this.init();
}

V.Skylab.prototype = {
    constructor: V.Skylab,
    init:function(){

    	this.position = new THREE.Vector3(0,0,0.6);
		this.target = new THREE.Vector3();

		var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    	this.root.environment = new THREE.WebGLRenderTarget(256,256,pars);
    	this.root.environment.mapping = THREE.SphericalReflectionMapping;

    	//this.env = new THREE.WebGLRenderTarget(256,256,pars);
    	//this.env.mapping = THREE.SphericalReflectionMapping;

    	var skyShader = V.Sky;
		this.uniforms = THREE.UniformsUtils.clone( skyShader.uniforms );

		this.material = new THREE.ShaderMaterial( {
			fragmentShader: skyShader.fs,
			vertexShader: skyShader.vs,
			uniforms: this.uniforms,
			side: THREE.BackSide
		});
		
		/*var distance = 1000;
		var theta = Math.PI * (0.49 - 0.5);
		var phi = 2 * Math.PI * (0.25 - 0.5);
		var sunPosition = new THREE.Vector3()
		sunPosition.x = distance * Math.cos(phi);
		sunPosition.y = distance * Math.sin(phi) * Math.sin(theta);
		sunPosition.z = distance * Math.sin(phi) * Math.cos(theta);
		this.uniforms.sunPosition.value.copy(sunPosition);*/
		this.sunPosition();
    	//this.material = new THREE.MeshBasicMaterial({  });
    	this.geo = new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(1, 20, 12) );
    	this.sky = new THREE.Mesh(this.geo, this.material);

    	this.skytest = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry( new THREE.SphereGeometry(800, 20, 12) ), this.material);
    	this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 60, 1, 0.1, 5 );
		
		this.scene.add(this.camera);
		this.scene.add(this.sky);

		this.root.scene.add(this.skytest);

		this.update();
    },
    sunPosition:function(){
		var theta = Math.PI * (this.settings.elevation - 0.5);
		var phi = 2 * Math.PI * (this.settings.azimuth - 0.5);
		var sunPosition = new THREE.Vector3()
		sunPosition.x = this.settings.distance * Math.cos(phi);
		sunPosition.y = this.settings.distance * Math.sin(phi) * Math.sin(theta);
		sunPosition.z = this.settings.distance * Math.sin(phi) * Math.cos(theta);
		this.uniforms.sunPosition.value.copy(sunPosition);
    },
    orbit:function(){
        var p = this.position;
        var d = 0.9;
        var phi = this.root.nav.cam.phi+V.PI;
        var theta = this.root.nav.cam.theta+V.PI;
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        //p.add(this.target);
    },
    update:function(){
    	//var r = this.root.nav.camera.quaternion;
    	//this.sky.rotation.y =  -this.root.nav.cam.theta;
    	//this.skytest.rotation.y =  -this.root.nav.cam.theta//quaternion.copy(r);
    	this.settings.elevation -= 0.001;
    	if(this.settings.elevation >1) this.settings.elevation  = -1.0;
    	if(this.settings.elevation <-1) this.settings.elevation  = 1.0;
    	this.sunPosition();
    	this.orbit();
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);
    	this.render();
    },
    render:function(){
    	//this.root.renderer.render( this.scene, this.camera, this.env, true );
    	this.root.renderer.render( this.scene, this.camera, this.root.environment, true );
    	this.isRender = true;
    }
}


V.Sky = {
uniforms:{
luminance:	 { type: "f", value:1 },
turbidity:	 { type: "f", value:2 },
reileigh:	 { type: "f", value:1 },
mieCoefficient:	 { type: "f", value:0.005 },
mieDirectionalG: { type: "f", value:0.8 },
sunPosition: 	 { type: "v3", value: new THREE.Vector3() }
},
fs:[
'uniform sampler2D skySampler;',
'uniform vec3 sunPosition;',
'varying vec3 vWorldPosition;',

'vec3 cameraPos = vec3(0., 0., 0.);',

'uniform float luminance;',
'uniform float turbidity;',
'uniform float reileigh;',
'uniform float mieCoefficient;',
'uniform float mieDirectionalG;',

'vec3 sunDirection = normalize(sunPosition);',
'float reileighCoefficient = reileigh;',

// constants for atmospheric scattering
'const float e = 2.71828182845904523536028747135266249775724709369995957;',
'const float pi = 3.141592653589793238462643383279502884197169;',

'const float n = 1.0003;',// refractive index of air
'const float N = 2.545E25;',// number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)
'const float pn = 0.035;	',// depolatization factor for standard air

// wavelength of used primaries, according to preetham
'const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);',

// mie stuff
// K coefficient for the primaries
'const vec3 K = vec3(0.686, 0.678, 0.666);',
'const float v = 4.0;',

// optical length at zenith for molecules
'const float rayleighZenithLength = 8.4E3;',
'const float mieZenithLength = 1.25E3;',
'const vec3 up = vec3(0.0, 1.0, 0.0);',

'const float EE = 1000.0;',
'const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;',
// 66 arc seconds -> degrees, and the cosine of that

// earth shadow hack
'const float cutoffAngle = pi/1.95;',
'const float steepness = 1.5;',

'vec3 totalRayleigh(vec3 lambda){',
	'return (8.0 * pow(abs(pi), 3.0) * pow(abs(pow(abs(n), 2.0) - 1.0), 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(abs(lambda), vec3(4.0)) * (6.0 - 7.0 * pn));',
'}',

// see http://blenderartists.org/forum/showthread.php?321110-Shaders-and-Skybox-madness
// A simplied version of the total Reayleigh scattering to works on browsers that use ANGLE
'vec3 simplifiedRayleigh(){',
	'return 0.0005 / vec3(94, 40, 18);',
	// return 0.00054532832366 / (3.0 * 2.545E25 * pow(vec3(680E-9, 550E-9, 450E-9), vec3(4.0)) * 6.245);
'}',

'float rayleighPhase(float cosTheta){',
	'return (3.0 / (16.0*pi)) * (1.0 + pow(abs(cosTheta), 2.0));',
//'	return (1.0 / (3.0*pi)) * (1.0 + pow(cosTheta, 2.0));',
//'	return (3.0 / 4.0) * (1.0 + pow(cosTheta, 2.0));',
'}',

'vec3 totalMie(vec3 lambda, vec3 K, float T){',
	'float c = (0.2 * T ) * 10E-18;',
	'return 0.434 * c * pi * pow(abs((2.0 * pi) / lambda), vec3(v - 2.0)) * K;',
'}',

'float hgPhase(float cosTheta, float g){',
	'return (1.0 / (4.0*pi)) * ((1.0 - pow(abs(g), 2.0)) / pow(abs(1.0 - 2.0*g*cosTheta + pow(g, 2.0)), 1.5));',
'}',

'float sunIntensity(float zenithAngleCos){',
	'return EE * max(0.0, 1.0 - exp(-((cutoffAngle - acos(zenithAngleCos))/steepness)));',
'}',

//'float logLuminance(vec3 c){',
//'     return log(c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722);',
//'}',

// Filmic ToneMapping http://filmicgames.com/archives/75
'float A = 0.15;',
'float B = 0.50;',
'float C = 0.10;',
'float D = 0.20;',
'float E = 0.02;',
'float F = 0.30;',
'float W = 1000.0;',

'vec3 Uncharted2Tonemap(vec3 x){',
   'return ((x*(A*x+C*B)+D*E)/(x*(A*x+B)+D*F))-E/F;',
'}',


'void main(){',
	'float sunfade = 1.0-clamp(1.0-exp((sunPosition.y/450000.0)),0.0,1.0);',

	//'luminance =  1.0 ;// vWorldPosition.y / 450000. + 0.5; //sunPosition.y / 450000. * 1. + 0.5;',
	//'gl_FragColor = vec4(sunfade, sunfade, sunfade, 1.0);',

	'reileighCoefficient = reileighCoefficient - (1.0* (1.0-sunfade));',

	'float sunE = sunIntensity(dot(sunDirection, up));',

	//'extinction (absorbtion + out scattering) ',
	// rayleigh coefficients

	//'vec3 betaR = totalRayleigh(lambda) * reileighCoefficient;',
	'vec3 betaR = simplifiedRayleigh() * reileighCoefficient;',

	// mie coefficients
	'vec3 betaM = totalMie(lambda, K, turbidity) * mieCoefficient;',

	// optical length  cutoff angle at 90 to avoid singularity in next formula.
	'float zenithAngle = acos(max(0.0, dot(up, normalize(vWorldPosition - cameraPos))));',
	'float sR = rayleighZenithLength / (cos(zenithAngle) + 0.15 * pow(abs(93.885 - ((zenithAngle * 180.0) / pi)), -1.253));',
	'float sM = mieZenithLength / (cos(zenithAngle) + 0.15 * pow(abs(93.885 - ((zenithAngle * 180.0) / pi)), -1.253));',

	// combined extinction factor
	'vec3 Fex = exp(-(betaR * sR + betaM * sM));',

	// in scattering
	'float cosTheta = dot(normalize(vWorldPosition - cameraPos), sunDirection);',

	'float rPhase = rayleighPhase(cosTheta*0.5+0.5);',
	'vec3 betaRTheta = betaR * rPhase;',

	'float mPhase = hgPhase(cosTheta, mieDirectionalG);',
	'vec3 betaMTheta = betaM * mPhase;',


	'vec3 Lin = pow(abs(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * (1.0 - Fex)),vec3(1.5));',
	'Lin *= mix(vec3(1.0),pow(abs(sunE * ((betaRTheta + betaMTheta) / (betaR + betaM)) * Fex),vec3(1.0/2.0)),clamp(pow(abs(1.0-dot(up, sunDirection)),5.0),0.0,1.0));',

	//nightsky
	'vec3 direction = normalize(vWorldPosition - cameraPos);',
	'float theta = acos(direction.y);',// elevation --> y-axis, [-pi/2, pi/2]
	'float phi = atan(direction.z, direction.x);',// azimuth --> x-axis [-pi/2, pi/2]
	'vec2 uv = vec2(phi, theta) / vec2(2.0*pi, pi) + vec2(0.5, 0.0);',
	//'vec3 L0 = texture2D(skySampler, uv).rgb+0.1 * Fex;',
	'vec3 L0 = vec3(0.1) * Fex;',

	// composition + solar disc'
	//'if (cosTheta > sunAngularDiameterCos)',
	'float sundisk = smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);',
	//' if (normalize(vWorldPosition - cameraPos).y>0.0)',
	'L0 += (sunE * 19000.0 * Fex)*sundisk;',


	'vec3 whiteScale = 1.0/Uncharted2Tonemap(vec3(W));',

	'vec3 texColor = (Lin+L0);',
	'texColor *= 0.04 ;',
	'texColor += vec3(0.0,0.001,0.0025)*0.3;',

	'float g_fMaxLuminance = 1.0;',
	'float fLumScaled = 0.1 / luminance;',
	'float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (g_fMaxLuminance * g_fMaxLuminance)))) / (1.0 + fLumScaled); ',

	'float ExposureBias = fLumCompressed;',

	'vec3 curr = Uncharted2Tonemap((log2(2.0/pow(abs(luminance),4.0)))*texColor);',
	'vec3 color = curr*whiteScale;',

	'vec3 retColor = pow(abs(color),vec3(1.0/(1.2+(1.2*sunfade))));',


	'gl_FragColor.rgb = retColor;',

	'gl_FragColor.a = 1.0;',
'}'
].join('\n'),
vs:[
'varying vec3 vWorldPosition;',
'void main(){',
'    vWorldPosition = vec4(modelMatrix * vec4( position, 1.0 )).xyz;',
'    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
'}'
].join('\n')
}
/*

V.Hdri={
uniforms:{
'tDiffuse' : { type: 't', value: null },
'exposure' : { type: 'f', value: 0.125 },
'brightMax' : { type: "f", value: 0.5 }, 
},
fs:[
'uniform sampler2D tDiffuse;',
'uniform float brightMax;',
'uniform float exposure;',
'varying vec2 vUv;',
'vec3 decode_pnghdr( const in vec4 color ) {',
'   vec4 res = color * color;',// remove gamma correction
'	float ri = pow( 2.0, res.w * 32.0 - 16.0 );',// decoded RI
'	res.xyz = res.xyz * ri;',// decoded HDR pixel
'	return res.xyz;',
'}',
'void main(){',
'   vec4 color = texture2D( tDiffuse, vUv );',
'   color.xyz  = decode_pnghdr( color );',
    // apply gamma correction and exposure
	//gl_FragColor = vec4( pow( exposure * color.xyz, vec3( 0.474 ) ), 1.0 );
	// Perform tone-mapping
'   float Y = dot(vec4(0.30, 0.59, 0.11, 0.0), color);',
'   float YD = exposure * (exposure/brightMax + 1.0) / (exposure + 1.0);',
'   color *= YD;',
'   gl_FragColor = vec4( color.xyz, 1.0 );',
'}'
].join('\n'),
vs:[
'varying vec2 vUv;',
'void main(){',
'    vUv = uv;',
'    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
'}'
].join('\n')
}*/