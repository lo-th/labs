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
}