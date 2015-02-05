V.Gauss_xy={
uniforms:{
'gauss' : { type: 't', value: null }
},
fs: [
'uniform sampler2D gauss;',
'varying vec2 vUv;',
'void main() {',
'    vec2 uvG = vUv;',
'    float gau = texture2D(gauss, vUv).x;',
'    uvG = vUv*2.0 - vec2(1.0,1.0);',
'    uvG *= 2.0;',
'    uvG = -uvG;',
'    uvG *= gau;',
'    gl_FragColor = vec4(uvG, gau, gau);',
'}'
].join('\n'),
vs: [
'varying vec2 vUv;',
'void main() {',
'   vUv = uv;',
'   gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);',
'}'
].join('\n')
}