V.Depth={
uniforms:{
},
fs: [
'precision highp float;',

'void main(void) {',
'    gl_FragColor = vec4( vec3( gl_FragCoord.z ), 1. );',
'}'
].join('\n'),
vs: [
'precision highp float;',

'void main(void) {',
'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1. );',
'}'
].join('\n')
}