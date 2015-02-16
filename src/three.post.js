
var THREE;
//--------------------------------
// EFFECT COMPOSER
//--------------------------------

THREE.EffectComposer = function ( renderer, renderTarget ) {
	this.renderer = renderer;
	if ( renderTarget === undefined ) {
		var width = window.innerWidth || 1;
		var height = window.innerHeight || 1;
		var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
		//var parameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: false };
		renderTarget = new THREE.WebGLRenderTarget( width, height, parameters );
	}
	this.renderTarget1 = renderTarget;
	this.renderTarget2 = renderTarget.clone();
	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;
	this.passes = [];
	if ( THREE.CopyShader === undefined )
		console.error( "THREE.EffectComposer relies on THREE.CopyShader" );
	this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
};

THREE.EffectComposer.prototype = {
	swapBuffers: function() {
		var tmp = this.readBuffer;
		this.readBuffer = this.writeBuffer;
		this.writeBuffer = tmp;
	},
	addPass: function ( pass ) {
		this.passes.push( pass );
	},
	insertPass: function ( pass, index ) {
		this.passes.splice( index, 0, pass );
	},
	render: function ( delta ) {
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
		var maskActive = false;
		var pass, i, il = this.passes.length;
		for ( i = 0; i < il; i ++ ) {
			pass = this.passes[ i ];
			if ( !pass.enabled ) continue;
			pass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );
			if ( pass.needsSwap ) {
				if ( maskActive ) {
					var context = this.renderer.context;
					context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
					this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );
					context.stencilFunc( context.EQUAL, 1, 0xffffffff );
				}
				this.swapBuffers();
			}
			if ( pass instanceof THREE.MaskPass ) {
				maskActive = true;
			} else if ( pass instanceof THREE.ClearMaskPass ) {
				maskActive = false;
			}
		}
	},
	reset: function ( renderTarget ) {
		if ( renderTarget === undefined ) {
			renderTarget = this.renderTarget1.clone();
			renderTarget.width = window.innerWidth;
			renderTarget.height = window.innerHeight;
		}
		this.renderTarget1 = renderTarget;
		this.renderTarget2 = renderTarget.clone();
		this.writeBuffer = this.renderTarget1;
		this.readBuffer = this.renderTarget2;
	},
	setSize: function ( width, height ) {
		var renderTarget = this.renderTarget1.clone();
		renderTarget.width = width;
		renderTarget.height = height;
		this.reset( renderTarget );
	}
};

//--------------------------------
// MASK PASS
//--------------------------------

THREE.MaskPass = function ( scene, camera ) {
	this.scene = scene;
	this.camera = camera;
	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
	this.inverse = false;
};

THREE.MaskPass.prototype = {
	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		var context = renderer.context;
		// don't update color or depth
		context.colorMask( false, false, false, false );
		context.depthMask( false );
		// set up stencil
		var writeValue, clearValue;
		if ( this.inverse ) {
			writeValue = 0;
			clearValue = 1;
		} else {
			writeValue = 1;
			clearValue = 0;
		}
		context.enable( context.STENCIL_TEST );
		context.stencilOp( context.REPLACE, context.REPLACE, context.REPLACE );
		context.stencilFunc( context.ALWAYS, writeValue, 0xffffffff );
		context.clearStencil( clearValue );
		// draw into the stencil buffer
		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		renderer.render( this.scene, this.camera, writeBuffer, this.clear );
		// re-enable update of color and depth
		context.colorMask( true, true, true, true );
		context.depthMask( true );
		// only render where stencil is set to 1
		context.stencilFunc( context.EQUAL, 1, 0xffffffff );  // draw if == 1
		context.stencilOp( context.KEEP, context.KEEP, context.KEEP );
	}
};

THREE.ClearMaskPass = function () {
	this.enabled = true;
};

THREE.ClearMaskPass.prototype = {
	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		var context = renderer.context;
		context.disable( context.STENCIL_TEST );
	}
};

//--------------------------------
// RENDER PASS
//--------------------------------

THREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {
	this.scene = scene;
	this.camera = camera;
	this.overrideMaterial = overrideMaterial;
	this.clearColor = clearColor;
	this.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 1;
	this.oldClearColor = new THREE.Color();
	this.oldClearAlpha = 1;
	this.enabled = true;
	this.clear = true;
	this.needsSwap = false;
};

THREE.RenderPass.prototype = {
	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		this.scene.overrideMaterial = this.overrideMaterial;
		if ( this.clearColor ) {
			this.oldClearColor.copy( renderer.getClearColor() );
			this.oldClearAlpha = renderer.getClearAlpha();
			renderer.setClearColor( this.clearColor, this.clearAlpha );
		}
		renderer.render( this.scene, this.camera, readBuffer, this.clear );
		if ( this.clearColor ) {
			renderer.setClearColor( this.oldClearColor, this.oldClearAlpha );
		}
		this.scene.overrideMaterial = null;
	}
};


//--------------------------------
// SHADER PASS
//--------------------------------

THREE.ShaderPass = function ( shader, textureID ) {
	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";
	this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
	this.material = new THREE.ShaderMaterial( {
        	defines: shader.defines || {},
		uniforms: this.uniforms,
		vertexShader: shader.vertexShader,
		fragmentShader: shader.fragmentShader
	} );
	this.renderToScreen = false;
	this.enabled = true;
	this.needsSwap = true;
	this.clear = false;
	this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
	this.scene  = new THREE.Scene();
	this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
	this.scene.add( this.quad );
};
THREE.ShaderPass.prototype = {
	render: function ( renderer, writeBuffer, readBuffer, delta ) {
		if ( this.uniforms[ this.textureID ] ) {
			this.uniforms[ this.textureID ].value = readBuffer;
		}
		this.quad.material = this.material;
		if ( this.renderToScreen ) {
			renderer.render( this.scene, this.camera );
		} else {
			renderer.render( this.scene, this.camera, writeBuffer, this.clear );
		}
	}
};

//--------------------------------
// COPY PASS
//--------------------------------

THREE.CopyShader = {
	uniforms: {
		tDiffuse: { type: 't', value: null },
		opacity:  { type: 'f', value: 1.0 }
	},
	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),
	fragmentShader: [
		'uniform float opacity;',
		'uniform sampler2D tDiffuse;',
		'varying vec2 vUv;',
		'void main() {',
			'vec4 texel = texture2D( tDiffuse, vUv );',
			'gl_FragColor = opacity * texel;',
		'}'
	].join('\n')
};


//--------------------------------
// SSAO SHADER
//--------------------------------

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Screen-space ambient occlusion shader
 * - ported from
 *   SSAO GLSL shader v1.2
 *   assembled by Martins Upitis (martinsh) (http://devlog-martinsh.blogspot.com)
 *   original technique is made by ArKano22 (http://www.gamedev.net/topic/550699-ssao-no-halo-artifacts/)
 * - modifications
 * - modified to use RGBA packed depth texture (use clear color 1,1,1,1 for depth pass)
 * - refactoring and optimizations
 */

THREE.SSAOShader = {
	uniforms: {
		tDiffuse:     { type: 't', value: null },
		tDepth:       { type: 't', value: null },
		size:         { type: 'v2', value: new THREE.Vector2( 512, 512 ) },
		cameraNear:   { type: 'f', value: 1.0 },
		cameraFar:    { type: 'f', value: 100.0 },
		onlyAO:       { type: 'i', value: 0 },
		aoClamp:      { type: 'f', value: 0.5 },
		lumInfluence: { type: 'f', value: 0.5 }
	},
	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),

	fragmentShader: [

		'uniform float cameraNear;',
		'uniform float cameraFar;',

		'uniform bool onlyAO;',      // use only ambient occlusion pass?

		'uniform vec2 size;',        // texture width, height
		'uniform float aoClamp;',    // depth clamp - reduces haloing at screen edges

		'uniform float lumInfluence;',  // how much luminance affects occlusion

		'uniform sampler2D tDiffuse;',
		'uniform sampler2D tDepth;',

		'varying vec2 vUv;',

		// '#define PI 3.14159265',
		'#define DL 2.399963229728653',  // PI * ( 3.0 - sqrt( 5.0 ) )
		'#define EULER 2.718281828459045',

		// helpers

		'float width = size.x;',   // texture width
		'float height = size.y;',  // texture height

		'float cameraFarPlusNear = cameraFar + cameraNear;',
		'float cameraFarMinusNear = cameraFar - cameraNear;',
		'float cameraCoef = 2.0 * cameraNear;',

		// user variables

		'const int samples = 8;',     // ao sample count
		'const float radius = 5.0;',  // ao radius

		'const bool useNoise = false;',      // use noise instead of pattern for sample dithering
		'const float noiseAmount = 0.0003;', // dithering amount

		'const float diffArea = 0.4;',   // self-shadowing reduction
		'const float gDisplace = 0.4;',  // gauss bell center


		// RGBA depth

		'float unpackDepth( const in vec4 rgba_depth ) {',

			'const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );',
			'float depth = dot( rgba_depth, bit_shift );',
			'return depth;',

		'}',

		// generating noise / pattern texture for dithering

		'vec2 rand( const vec2 coord ) {',

			'vec2 noise;',

			'if ( useNoise ) {',

				'float nx = dot ( coord, vec2( 12.9898, 78.233 ) );',
				'float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );',

				'noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );',

			'} else {',

				'float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );',
				'float gg = fract( coord.t * ( height / 2.0 ) );',

				'noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;',

			'}',

			'return ( noise * 2.0  - 1.0 ) * noiseAmount;',

		'}',

		'float readDepth( const in vec2 coord ) {',

			// 'return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );',
			'return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord ) ) * cameraFarMinusNear );',


		'}',

		'float compareDepths( const in float depth1, const in float depth2, inout int far ) {',

			'float garea = 2.0;',                         // gauss bell width
			'float diff = ( depth1 - depth2 ) * 100.0;',  // depth difference (0-100)

			// reduce left bell width to avoid self-shadowing

			'if ( diff < gDisplace ) {',

				'garea = diffArea;',

			'} else {',

				'far = 1;',

			'}',

			'float dd = diff - gDisplace;',
			'float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );',
			'return gauss;',

		'}',

		'float calcAO( float depth, float dw, float dh ) {',

			'float dd = radius - depth * radius;',
			'vec2 vv = vec2( dw, dh );',

			'vec2 coord1 = vUv + dd * vv;',
			'vec2 coord2 = vUv - dd * vv;',

			'float temp1 = 0.0;',
			'float temp2 = 0.0;',

			'int far = 0;',
			'temp1 = compareDepths( depth, readDepth( coord1 ), far );',

			// DEPTH EXTRAPOLATION

			'if ( far > 0 ) {',

				'temp2 = compareDepths( readDepth( coord2 ), depth, far );',
				'temp1 += ( 1.0 - temp1 ) * temp2;',

			'}',

			'return temp1;',

		'}',

		'void main() {',

			'vec2 noise = rand( vUv );',
			'float depth = readDepth( vUv );',

			'float tt = clamp( depth, aoClamp, 1.0 );',

			'float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );',
			'float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );',

			'float ao = 0.0;',

			'float dz = 1.0 / float( samples );',
			'float z = 1.0 - dz / 2.0;',
			'float l = 0.0;',

			'for ( int i = 0; i <= samples; i ++ ) {',

				'float r = sqrt( 1.0 - z );',

				'float pw = cos( l ) * r;',
				'float ph = sin( l ) * r;',
				'ao += calcAO( depth, pw * w, ph * h );',
				'z = z - dz;',
				'l = l + DL;',

			'}',

			'ao /= float( samples );',
			'ao = 1.0 - ao;',

			'vec3 color = texture2D( tDiffuse, vUv ).rgb;',

			'vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );',
			'float lum = dot( color.rgb, lumcoeff );',
			'vec3 luminance = vec3( lum );',

			'vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );',  // mix( color * ao, white, luminance )

			'if ( onlyAO ) {',
				'final = vec3( mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );',  // ambient occlusion only
			'}',
			'gl_FragColor = vec4( final, 1.0 );',

		'}'
	].join('\n')

};

//--------------------------------
// FXAA SHADER
//--------------------------------

THREE.FXAAShader = {

	uniforms: {

		tDiffuse:   { type: 't', value: null },
		resolution: { type: 'v2', value: new THREE.Vector2( 1 / 1024, 1 / 512 )  }

	},

	vertexShader: [
		'varying vec2 vUv;',
		'void main() {',
			'vUv = uv;',
			'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'}'
	].join('\n'),

	fragmentShader: [

		'uniform sampler2D tDiffuse;',
		'uniform vec2 resolution;',

		'varying vec2 vUv;',

		'#define FXAA_REDUCE_MIN   (1.0/128.0)',
		'#define FXAA_REDUCE_MUL   (1.0/8.0)',
		'#define FXAA_SPAN_MAX     8.0',

		'void main() {',

			'vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;',
			'vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;',
			'vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;',
			'vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;',
			'vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );',
			'vec3 rgbM  = rgbaM.xyz;',
			'float opacity  = rgbaM.w;',

			'vec3 luma = vec3( 0.299, 0.587, 0.114 );',

			'float lumaNW = dot( rgbNW, luma );',
			'float lumaNE = dot( rgbNE, luma );',
			'float lumaSW = dot( rgbSW, luma );',
			'float lumaSE = dot( rgbSE, luma );',
			'float lumaM  = dot( rgbM,  luma );',
			'float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );',
			'float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );',

			'vec2 dir;',
			'dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));',
			'dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));',

			'float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );',

			'float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );',
			'dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),',
				  'max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),',
						'dir * rcpDirMin)) * resolution;',

			'vec3 rgbA = 0.5 * (',
				'texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 1.0 / 3.0 - 0.5 ) ).xyz +',
				'texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * ( 2.0 / 3.0 - 0.5 ) ).xyz );',

			'vec3 rgbB = rgbA * 0.5 + 0.25 * (',
				'texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * -0.5 ).xyz +',
				'texture2D( tDiffuse, gl_FragCoord.xy  * resolution + dir * 0.5 ).xyz );',

			'float lumaB = dot( rgbB, luma );',

			'if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {',

				'gl_FragColor = vec4( rgbA, opacity );',

			'} else {',

				'gl_FragColor = vec4( rgbB, opacity );',

			'}',

		'}'

	].join('\n')

};

THREE.DepthDef = {
uniforms: {
    tdeep : { type: "t", value: null },
    offset : { type: "v2", value: new THREE.Vector2() },
    range : { type: "v2", value: new THREE.Vector2() },
    uDisplacementBias: { type: "f", value: -3.0 },
    uDisplacementScale: { type: "f", value: 6.0 }
},
vertexShader: [
"uniform sampler2D tdeep;",
"uniform float uDisplacementScale;",
"uniform float uDisplacementBias;",
"uniform vec2 offset;",
"uniform vec2 range;",
"varying vec2 vUv2;",
THREE.ShaderChunk[ 'morphtarget_pars_vertex' ],
THREE.ShaderChunk[ 'skinning_pars_vertex' ],
THREE.ShaderChunk[ 'logdepthbuf_pars_vertex' ],
'void main() {',
	THREE.ShaderChunk[ 'skinbase_vertex' ],
	THREE.ShaderChunk[ 'morphtarget_vertex' ],
	THREE.ShaderChunk[ 'skinning_vertex' ],
	THREE.ShaderChunk[ 'default_vertex' ],
	"#ifdef USE_SKINNING",
	'gl_Position = projectionMatrix * mvPosition;',
	"#else",
	"vUv2 = (vec2(position.x, position.z)+offset)/range;",
    "vUv2.y = 1.0-vUv2.y;",
    "vec3 dv = texture2D( tdeep, vUv2 ).xyz;",
    "float df = (uDisplacementScale * dv.x) + uDisplacementBias;",
    "vec3 displacedPosition = position;",
    "displacedPosition.y += df;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition,1.0);",
    "#endif",
	THREE.ShaderChunk[ 'logdepthbuf_vertex' ],
'}'
].join('\n'),
fragmentShader: [
THREE.ShaderChunk[ 'logdepthbuf_pars_fragment' ],
'vec4 pack_depth( const in float depth ) {',
'	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );',
'	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );',
'	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );', // '	vec4 res = fract( depth * bit_shift );',
'	res -= res.xxyz * bit_mask;',
'	return res;',
'}',
'void main() {',
	THREE.ShaderChunk[ 'logdepthbuf_fragment' ],
'	#ifdef USE_LOGDEPTHBUF_EXT',
'		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );',
'	#else',
'		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );',
'	#endif',
	//'gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z / gl_FragCoord.w );',
	//'float z = ( ( gl_FragCoord.z / gl_FragCoord.w ) - 3.0 ) / ( 4000.0 - 3.0 );',
	//'gl_FragData[ 0 ] = pack_depth( z );',
	//'gl_FragData[ 0 ] = vec4( z, z, z, 1.0 );',
'}'
].join('\n')
}


THREE.DepthDef2 = {
uniforms: {
},
vertexShader: [
THREE.ShaderChunk[ 'morphtarget_pars_vertex' ],
THREE.ShaderChunk[ 'skinning_pars_vertex' ],
THREE.ShaderChunk[ 'logdepthbuf_pars_vertex' ],
'void main() {',
	THREE.ShaderChunk[ 'skinbase_vertex' ],
	THREE.ShaderChunk[ 'morphtarget_vertex' ],
	THREE.ShaderChunk[ 'skinning_vertex' ],
	THREE.ShaderChunk[ 'default_vertex' ],
	THREE.ShaderChunk[ 'logdepthbuf_vertex' ],
'}'
].join('\n'),
fragmentShader: [
THREE.ShaderChunk[ 'logdepthbuf_pars_fragment' ],
'vec4 pack_depth( const in float depth ) {',
'	const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );',
'	const vec4 bit_mask = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );',
'	vec4 res = mod( depth * bit_shift * vec4( 255 ), vec4( 256 ) ) / vec4( 255 );', // '	vec4 res = fract( depth * bit_shift );',
'	res -= res.xxyz * bit_mask;',
'	return res;',
'}',
'void main() {',
	THREE.ShaderChunk[ 'logdepthbuf_fragment' ],
'	#ifdef USE_LOGDEPTHBUF_EXT',
'		gl_FragData[ 0 ] = pack_depth( gl_FragDepthEXT );',
'	#else',
'		gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );',
'	#endif',
	//'gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z / gl_FragCoord.w );',
	//'float z = ( ( gl_FragCoord.z / gl_FragCoord.w ) - 3.0 ) / ( 4000.0 - 3.0 );',
	//'gl_FragData[ 0 ] = pack_depth( z );',
	//'gl_FragData[ 0 ] = vec4( z, z, z, 1.0 );',
'}'
].join('\n')
}