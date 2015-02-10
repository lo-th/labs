V.Spherical = {
uniforms:{ 
	env: {type: 't', value: null},
	map: {type: 't', value: null},
    mapLight: {type: 't', value: null},
    normalMap: {type: 't', value: null},
    specularMap: {type: 't', value: null},

    useNormal: {type: 'i', value: 0},
    normalScale: {type: 'f', value: 2},
    useSpecular: {type: 'i', value: 0},

    color: {type: 'c', value: new THREE.Color(0xffffff)},
    useMap: {type: 'i', value: 0},
    opacity: {type: 'f', value: 1.0},
    useRim: {type: 'f', value: 0.5},
    rimPower: {type: 'f', value: 2},
    useExtraRim: {type: 'i', value: 0},
    repeat:{type:'v2', value:new THREE.Vector2(1.0,1.0) },
    reflection: {type: 'f', value: 1.0},
},
fs:[
'precision highp float;',
'uniform sampler2D env;',
'uniform sampler2D map;',
'uniform sampler2D normalMap;',
'uniform sampler2D specularMap;',
'uniform vec3 color;',
'uniform float opacity;',
'uniform int useMap;',
'uniform float useRim;',
'uniform float rimPower;',
'uniform int useExtraRim;',
'uniform vec2 repeat;',
'uniform float reflection;',
'uniform float normalScale;',

'uniform int useNormal;',
'uniform int useSpecular;',


//'uniform vec3 color;',
'varying vec2 vN;',
'varying vec2 vU;',
'varying vec3 vUU;',
//'varying vec3 vEye;',
'varying vec3 vNormal;',
'varying vec3 vPos;',

'varying vec3 vTangent;',
'varying vec3 vBinormal;',

//THREE.ShaderChunk[ "color_pars_fragment" ],
//THREE.ShaderChunk[ "map_pars_fragment" ],
//THREE.ShaderChunk[ "alphamap_pars_fragment" ],
//THREE.ShaderChunk[ "lightmap_pars_fragment" ],
//THREE.ShaderChunk[ "envmap_pars_fragment" ],
THREE.ShaderChunk[ "fog_pars_fragment" ],
//THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
//THREE.ShaderChunk[ "specularmap_pars_fragment" ],
THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],


'void main() {',
    'vec3 finalNormal = vNormal;',
    'vec2 calculatedNormal = vN;',
    'vec3 base = color;',
    'float alpha = opacity;',

    'if(useMap == 1){',
        'vec3 mapping = texture2D( map, vU * repeat ).rgb;',
        //"alpha *= texture2D( map, vU * repeat ).a;",
        'base *= mapping;',
    '}',

    'if( useNormal == 1 ) {',
        'vec3 normalTex = texture2D( normalMap, vU * repeat ).xyz * 2.0 - 1.0;',
        //'vec3 normalTex = texture2D( tNormal, vU ).xyz * 2.0 - 1.0;',
        'normalTex.xy *= normalScale;',
        'normalTex.y *= -1.;',
        'normalTex = normalize( normalTex );',
        'mat3 tsb = mat3( normalize( vTangent ), normalize( vBinormal ), normalize( vNormal ) );',
        'finalNormal = tsb * normalTex;',

        'vec3 r = reflect( vUU, normalize( finalNormal ) );',
        'float m = 2.0 * sqrt( r.x * r.x + r.y * r.y + ( r.z + 1.0 ) * ( r.z + 1.0 ) );',
        'calculatedNormal = vec2( r.x / m + 0.5,  r.y / m + 0.5 );',
        
    '}',

    'if( useRim > 0. ) {',
        'float f = rimPower * abs( dot( finalNormal, vPos ) );',
        'f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
        'base += vec3( f );',
    '}',
    'if( useExtraRim == 1 ) {',
        'float rim = max( 0., abs( dot( finalNormal, -vPos ) ) );',
        'float r = smoothstep( .25, .75, 1. - rim );',
        'r -= smoothstep( .5, 1., 1. - rim );',
        'vec3 c = vec3( 168. / 255., 205. / 255., 225. / 255. );',
        'base *= c;',
    '}',

    // environment
    //'vec3 ev = texture2D( env, vN ).rgb;',
    'vec3 ev = texture2D( env, calculatedNormal ).rgb;',
    'ev *= base;',
    //'base *= ev;',


    'gl_FragColor.xyz = mix( base.xyz, ev.xyz, reflection );',
    'gl_FragColor.a = alpha;',

    'if(useSpecular == 1){',
        'gl_FragColor.xyz =  mix( gl_FragColor.xyz, texture2D( specularMap, vU * repeat ).xyz, 0.1 );',//gl_FragColor.xyz + texture2D( specularMap, vU * repeat ).xyz;',
    '}',
    
    //'gl_FragColor = vec4( base, alpha );',

    THREE.ShaderChunk[ "logdepthbuf_fragment" ],
    //THREE.ShaderChunk[ "map_fragment" ],
    //THREE.ShaderChunk[ "alphamap_fragment" ],
	//THREE.ShaderChunk[ "alphatest_fragment" ],
	//THREE.ShaderChunk[ "specularmap_fragment" ],
	//THREE.ShaderChunk[ "lightmap_fragment" ],
	//THREE.ShaderChunk[ "color_fragment" ],
	//THREE.ShaderChunk[ "envmap_fragment" ],
	//THREE.ShaderChunk[ "shadowmap_fragment" ],

	//THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

	THREE.ShaderChunk[ "fog_fragment" ],
'}'
].join("\n"),
vs:[
'precision highp float;',
'attribute vec4 tangent;',
'uniform int useNormal;',
//THREE.ShaderChunk[ "map_pars_vertex" ],
//THREE.ShaderChunk[ "lightmap_pars_vertex" ],
//THREE.ShaderChunk[ "envmap_pars_vertex" ],
//THREE.ShaderChunk[ "color_pars_vertex" ],
THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
THREE.ShaderChunk[ "skinning_pars_vertex" ],
//THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

'varying vec2 vN;',
'varying vec2 vU;',
'varying vec3 vUU;',
//'varying vec3 vEye;',
'varying vec3 vNormal;',
'varying vec3 vPos;',
'varying vec3 vTangent;',
'varying vec3 vBinormal;',


'void main() {',
    //THREE.ShaderChunk[ "map_vertex" ],
   // THREE.ShaderChunk[ "lightmap_vertex" ],
	//THREE.ShaderChunk[ "color_vertex" ],
	THREE.ShaderChunk[ "skinbase_vertex" ],

	//"#ifdef USE_ENVMAP",

	//THREE.ShaderChunk[ "morphnormal_vertex" ],
	//THREE.ShaderChunk[ "skinnormal_vertex" ],
	//THREE.ShaderChunk[ "defaultnormal_vertex" ],

	//"#endif",

    THREE.ShaderChunk[ "morphtarget_vertex" ],
    THREE.ShaderChunk[ "skinning_vertex" ],
    THREE.ShaderChunk[ "default_vertex" ],
    THREE.ShaderChunk[ "logdepthbuf_vertex" ],
   
	THREE.ShaderChunk[ "worldpos_vertex" ],
	//THREE.ShaderChunk[ "envmap_vertex" ],
	//THREE.ShaderChunk[ "shadowmap_vertex" ],
    'vec3 pos = vec3( 0. );',

    '#ifdef USE_MORPHTARGETS',
        'pos = morphed.xyz;',
    '#else',
        'pos = position;',
    '#endif',

    '#ifdef USE_SKINNING',
        'pos = skinned.xyz;',
    '#else',
        'pos = position;',
    '#endif',

    //'vec3 e = normalize( vec3( modelViewMatrix * vec4( position, 1.0 ) ) );',
    'vPos = normalize( vec3( mvPosition ) );',
    'vNormal = normalize( normalMatrix * normal );',
    'vec3 r = reflect( vPos, vNormal );',
    'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
    'vN = r.xy / m + .5;',
    'vU = uv;',

    'vec4 mvpos = modelViewMatrix * vec4( pos, 1.0 );',
    'vUU = normalize( vec3( mvpos ) );',

    'if( useNormal == 1 ) {',
        'vTangent = normalize( normalMatrix * tangent.xyz );',
        'vBinormal = normalize( cross( vNormal, vTangent ) * tangent.w );',
    '} else {',
        'vTangent = vec3( 0. );',
        'vBinormal = vec3( 0. );',
    '}',
    //'vEye = ( modelViewMatrix * vec4( position, 1.0 ) ).xyz;',
    //'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
    'gl_Position = projectionMatrix * mvPosition;',
'}'
].join("\n")
};