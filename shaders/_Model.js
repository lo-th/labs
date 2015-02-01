V.Basic={
uniforms:{
tmap : { type: 't', value: null }
},
fs: [
'uniform sampler2D tmap;',
'varying vec2 vUv;',
'void main() {',
'gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
'}'
].join('\n'),
vs: [
'varying vec2 vUv;',
'void main() {',
'vUv = uv;',
'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
'}'
].join('\n')
}