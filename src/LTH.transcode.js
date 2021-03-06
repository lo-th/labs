/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author l.th / http://lo-th.github.io/labs/
*/

LTH.Transcode = function(main){
	this.main = main;
	this.callback = null;
	this.canvas = document.createElement("canvas");
	this.gl = null;
	this.ctx = null;
	this.size = {w:0, h:0};
	this.name = '';
	this.time = 0;
	this.codes = {};
	this.useTrans = false;
}

LTH.Transcode.prototype = {
	constructor: LTH.Transcode,
	initRootCode:function(){
		this.list = LTH.CODES;
		this.callback = function(string){
			this.main.menu.title.innerHTML = 'WELCOME<br>LOADING CODES<br>'+this.name.toUpperCase() + ' ' + (Date.now()-this.time)+' MS';
		    //test first code if transcript give good code result
		    if(this.name==='full'){
		    	if(string.substring(1, 11)==='use strict') this.useTrans = true;
			    else this.useTrans = false;
		    }
		    // convert string code to blob
		    if(this.useTrans){
		    	try{
				    var sblob = new Blob([ string ], { type: 'application/javascript' });
				    this.codes[this.name] = URL.createObjectURL(sblob);
				    //console.log(this.name)
			    }
			    catch(e){ this.useTrans = false; this.list.length = 0; }
		    }else{
		    	this.list.length = 0;
		    }
		}.bind(this);

		this.loadList();
	},
	loadList:function(){
		this.name = this.list[0];
		var img = new Image();
		img.onload = function() {
			this.time = Date.now();
			this.canvas.width = this.size.w = img.width;
			this.canvas.height = this.size.h = img.height;
			
			this.transcanvas(img);

			this.list.shift();
            if(this.list.length) this.loadList();
            else this.main.menu.initHomeland(this.main.detector.webgl);

		}.bind(this);
		img.src = 'images/code/'+this.name+'.png';
	},
	load:function(name, callback){

		this.callback = callback || function(){};
		var img = new Image();
		img.onload = function() { 
			this.canvas.width = this.size.w = img.width;
			this.canvas.height = this.size.h = img.height;
			this.transcanvas(img); 
		}.bind(this);
	    img.src = name;
	},
	create3dContext:function(){
		var n = ["webgl", "experimental-webgl"];
	    for (var i = 0; i < n.length; ++i) {
	    	try { this.gl = this.canvas.getContext(n[i]); } 
	    	catch(e) {}
	        if (this.gl) break;
	    }
	    if (this.gl){
	    	this.program = this.createProgram(this.gl,LTH.BitmapShader);
	    	this.gl.useProgram(this.program);
	    } else {
	    	this.gl = null;
	    }
	},
	transcanvas:function(image){
		var w = this.size.w;
	    var h = this.size.h;
	    var data;
	    
	    if (!this.main.detector.webgl) { 
	    	
	        // canvas 2d
	    	this.ctx = this.canvas.getContext('2d');
	    	this.ctx.drawImage(image, 0, 0);
	    	data = this.ctx.getImageData(0, 0, this.size.w, this.size.h).data;
	    	this.ctx.clearRect ( 0 , 0 , this.size.w, this.size.h );
	    } else {
	    	
	        // canvas 3d
	    	if(this.gl==null) this.create3dContext();
	    	var gl = this.gl;
		    var positionLocation = gl.getAttribLocation(this.program, "a_position");
		    var texCoordLocation = gl.getAttribLocation(this.program, "a_texCoord");
		    var texCoordBuffer = gl.createBuffer();
		    gl.viewport(0, 0, w, h);
		    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0.0,0.0,1.0,0.0,0.0,1.0,0.0,1.0,1.0,0.0,1.0,1.0]), gl.STATIC_DRAW);
		    gl.enableVertexAttribArray(texCoordLocation);
		    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
		    var texture = gl.createTexture();
		    gl.bindTexture(gl.TEXTURE_2D, texture);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		    var resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");
		    gl.uniform2f(resolutionLocation, w, h);
		    var buffer = gl.createBuffer();
		    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		    gl.enableVertexAttribArray(positionLocation);
		    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
		    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,h,w,h,0,0,0,0,w,h,w,0]), gl.STATIC_DRAW);
		    gl.drawArrays(gl.TRIANGLES, 0, 6);

		    data = new Uint8Array(w*h*4);
		    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data);
		    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
		    //gl = null;
		}

		// DECODE DATA

		var color = 0;
		if(data[1]!==0)color=1;
		if(data[2]!==0)color=2;
		var pix, string = "", id, l = data.length/4;
		for ( var i = 0; i<l; i++){
			id = (i*4)+color;
			pix = data[id]+32;
			pix = pix == 127 ? 10 : pix;
			if( pix<127 ) string += String.fromCharCode(pix);
		}

		// END FUNCTION
		this.callback(string);

	},
	createProgram:function (gl,shader){
	    var fs = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fs, shader.fs);
	    gl.compileShader(fs);
	    var vs = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vs, shader.vs);
	    gl.compileShader(vs);
	    var p = gl.createProgram();
	    gl.attachShader(p, vs);
	    gl.attachShader(p, fs);
	    gl.linkProgram(p);

	    var linked = gl.getProgramParameter(p, gl.LINK_STATUS);
	    if (!linked)console.error( 'Error linking the shader: ' + gl.getProgramInfoLog(p));
	    return p;
	}
}


LTH.BitmapShader = {
    fs:[
        'precision mediump float;',
        'uniform sampler2D u_image;',
        'varying vec2 v_texCoord;',
        'void main() { gl_FragColor = texture2D(u_image, v_texCoord); }'
    ].join("\n"),
    vs:[
        'attribute vec2 a_position;',
        'attribute vec2 a_texCoord;',
        'uniform vec2 u_resolution;',
        'varying vec2 v_texCoord;',
        'void main() {',
            'vec2 zeroToOne = a_position / u_resolution;',
            'vec2 zeroToTwo = zeroToOne * 2.0;',
            'vec2 clipSpace = zeroToTwo - 1.0;',
            'gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);',
            'v_texCoord = a_texCoord;',
        '}'
    ].join("\n")
};