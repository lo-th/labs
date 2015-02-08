V.MapShad={
uniforms:{
'tmap' : { type: 't', value: null },
},
fs:[
'uniform sampler2D tmap;',
'varying vec2 vUv;',
'void main(){',
'    vec3 color = vec3(0.0, 0.0, 0.0);',
'    vec3 tx = texture2D(tmap, vUv).xyz;',
'    gl_FragColor = vec4(color.x, color.y, color.z, tx.x);',
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