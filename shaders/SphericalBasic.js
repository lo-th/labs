V.SphericalBasic = {
uniforms:{ 
	env: {type: 't', value: null},
	map: {type: 't', value: null},
    color: {type: 'c', value: new THREE.Color(0xffffff)},
    useMap: {type: 'i', value: 0},
    opacity: {type: 'f', value: 1.0},
    useRim: {type: 'f', value: 0.5},
    rimPower: {type: 'f', value: 2},
    useExtraRim: {type: 'i', value: 0},
},
fs:[
'uniform sampler2D env;',
'uniform sampler2D map;',
'uniform vec3 color;',
'uniform float opacity;',
'uniform int useMap;',
'uniform float useRim;',
'uniform float rimPower;',
'uniform int useExtraRim;',
'varying vec2 vN;',
'varying vec2 vU;',
'varying vec3 vNormal;',
'varying vec3 vPos;',

'void main() {',
    'vec3 base = color;',
    'float alpha = opacity;',

    'if(useMap == 1){',
        'vec3 mapping = texture2D( map, vU ).rgb;',
        "alpha *= texture2D( map, vU ).a;",
        'base *= mapping;',
    '}',
    'if( useRim > 0. ) {',
        'float f = rimPower * abs( dot( vNormal, vPos ) );',
        'f = useRim * ( 1. - smoothstep( 0.0, 1., f ) );',
        'base += vec3( f );',
    '}',
    'if( useExtraRim == 1 ) {',
        'float rim = max( 0., abs( dot( vNormal, -vPos ) ) );',
        'float r = smoothstep( .25, .75, 1. - rim );',
        'r -= smoothstep( .5, 1., 1. - rim );',
        'vec3 c = vec3( 168. / 255., 205. / 255., 225. / 255. );',
        'base *= c;',
    '}',

    // environment
    'vec3 ev = texture2D( env, vN ).rgb;',
    'base *= ev;',
    
    'gl_FragColor = vec4( base, alpha );',
'}'
].join("\n"),
vs:[
'varying vec2 vN;',
'varying vec2 vU;',
'varying vec3 vNormal;',
'varying vec3 vPos;',

'void main() {',
    'vPos = normalize( vec3( mvPosition ) );',
    'vNormal = normalize( normalMatrix * normal );',
    'vec3 r = reflect( vPos, vNormal );',
    'float m = 2. * sqrt( pow( r.x, 2. ) + pow( r.y, 2. ) + pow( r.z + 1., 2. ) );',
    'vN = r.xy / m + .5;',
    'vU = uv;',
    'gl_Position = projectionMatrix * mvPosition;',
'}'
].join("\n")
};