V.Basic={
uniforms:{
'tmap' : { type: 't', value: null },
'vv' : { type: "v3", value: new THREE.Vector3( 0.001953125, 0.9, 0.0 ) },
'gg' : { type: 'f', value: 0.44 },
'll' : { type:'c', value: new THREE.Color(0x323436) },
},
fs:[
// yoooo
'uniform sampler2D tmap;',
'uniform vec3 vv;',
'uniform vec3 ll;',
'uniform float gg;',
'varying vec2 vUv;',
'void main(){',
'    gl_FragColor = vec4(1.0, 1.0, 1.0 / 3.0, 1.0);',
'    gl_FragColor *= texture2D(tmap, vUv);',
'    gl_FragColor = vec4(ll.x, ll.y, ll.z, 1.0);',
'}'
].join('\n'),
vs:[
'varying vec2 vUv;',
'void main(){',
'    vUv = uv;',
'    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
'}'
].join('\n')
}