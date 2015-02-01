V.Radiosity={
attribute:{
tangent : { type: 'v4', value: null },
binormal : { type: 'v3', value: null }
},
uniforms:{
rdRED : { type: 't', value: null },
rdGREEN : { type: 't', value: null },
rdBLUE : { type: 't', value: null },
normal : { type: 't', value: null },
scaleLight : { type: 'f', value: 1.0 },
UVscales : { type: 'v2', value: null }
},
fs: [
'uniform sampler2D rdRED;',
'uniform sampler2D rdGREEN;',
'uniform sampler2D rdBLUE;',
'uniform sampler2D normal;',
'uniform float scaleLight;',
'uniform vec2 UVscales;',

'varying vec2 vUv;',
'varying vec2 vUv2;',
'varying highp vec3 vTangent;',
'varying highp vec3 vBitang;',
'varying highp vec3 vNormal;',
'varying vec3 vViewPosition;',

'void main(){',
	'vec3 normRED =		texture2D(rdRED, vUv2).xyz;',
	'vec3 normGREEN = 	texture2D(rdGREEN, vUv2).xyz;',
	'vec3 normBLUE =	 	texture2D(rdBLUE, vUv2).xyz;',
	'vec2 t = vUv * UVscales ;',
	'vec4 normalMap = 		texture2D( normal, t);',
	'vec3 bitangent, tangent, normal, finalNormal;',
	'vec3 bumpBasis[3];',
	'bumpBasis[0] = vec3( 0.796875, 0, 0.570313 );',
	'bumpBasis[1] = vec3( -0.24, 0.710938, 0.570313 );',
	'bumpBasis[2] = vec3( -0.40625, -0.710938, 0.570313 );',

	'vec3 dp;',
	'finalNormal = normalMap.xyz * 2.0 - 1.0;',
	'dp.x = clamp( dot( finalNormal , bumpBasis[0] ) , 0.0, 1.0 );',
	'dp.y = clamp( dot( finalNormal , bumpBasis[1] ) , 0.0, 1.0 );',
	'dp.z = clamp( dot( finalNormal , bumpBasis[2] ) , 0.0, 1.0 );',
	'dp *= dp;',
	'float sum = dp.x + dp.y + dp.z;',
	'vec3 l = dp.x * normRED + dp.y * normGREEN + dp.z * normBLUE;',
	'l /= sum;',
	'glFragColor = vec4(  vec3( l * scaleLight) , 1.0);',
'}'
].join('\n'),
vs: [
'attribute vec4 tangent;',
'attribute vec3 binormal;',

'varying highp vec3 vTangent;',
'varying highp vec3 vBitang;',
'varying highp vec3 vNormal;',

'varying vec2 vUv;',
'varying vec2 vUv2;',
'varying vec3 vViewPosition;',

'void main(){',
	'vUv = uv;',
	'vUv2 = uv2;',

	'vec3 normal3p = normal;',
	'vec3 tangent3p = tangent.xyz;',
	'vec3 binormal3p = -binormal;',

	'vNormal = normalize( normal3p );',
	'vTangent = normalize( binormal3p );',
	'vBitang = normalize( tangent3p );',

	'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );',
	'vViewPosition = -mvPosition.xyz;',
	'glPosition = projectionMatrix * mvPosition;',
'}'
].join('\n')
}