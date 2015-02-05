/**
 * @author loth / http://lo-th.github.io/labs/
 */

LTH.ShaderToy = function(main){
	this.main = main;
	this.retour = document.createElement('div');
	this.retour.innerHTML = ".join('&#92;n')";
	this.shaderName = '';
	this.shaderBase = null;
	this.uniformValues = {};
	this.uniformColors = {};
	this.uniformNames = {};
	this.isShaderReady = false;
	this.interval = null;
}

LTH.ShaderToy.prototype = {
	constructor: LTH.ShaderToy,
	clear:function(){
		this.shaderName = '';
		this.shaderBase = null;
		this.uniformColors = {};
		this.uniformValues = {};
		this.uniformNames = {};
		this.isShaderReady = false;
	},
	pushShader:function(name, s){
		if(this.shaderName !== '') this.clear();
		this.shaderName = name;
		this.getUniformValue(s.uniforms);
		this.main.editorVertex.set(s.vs, true);
		this.main.editorFragment.set(s.fs, true);
		this.activeUpdate();
		this.isShaderReady = true;
	},
	getUniformValue:function(uniforms){
		this.uniformValues = {};
		for (var key in uniforms){
			var type = uniforms[key].type;
			var val = JSON.stringify(uniforms[key].value);

			//console.log(key, val, type);
			if(type === 'c') this.uniformColors[key] = val;
			else this.uniformValues[key] = val;


			if(type === 'c'){ this.main.previewMain.v.gui.color(key, uniforms[key].value); }
			if(type === 'i'){ this.main.previewMain.v.gui.int(key, uniforms[key].value); }
			if(type === 'f'){ this.main.previewMain.v.gui.float(key, uniforms[key].value); }
			if(type === 't'){ this.main.previewMain.v.gui.textures(key); }
		}
	},
	disableUpdate:function(){
		var _this = this;
		this.main.editorVertex.editor.on('change', function() { return false; });
		this.main.editorFragment.editor.on('change', function() { return false; });
	},
	activeUpdate:function(){
		var _this = this;
		this.main.editorVertex.editor.on('change', function() { _this.onChange(); });
		this.main.editorFragment.editor.on('change', function() { _this.onChange(); });
	},
	onChange:function(){
		//this.compacte()
		var _this = this;
		clearTimeout( this.interval );
		this.interval = setTimeout( function() { _this.compacte(); }, 500);
	},
	compacte:function(){
		if(this.main.mode !=='shader' || !this.isShaderReady) return;

		this.uniform = '';
		var vs = this.getShader(this.main.editorVertex.editor);
		var fs = this.getShader(this.main.editorFragment.editor);
		
		var result = [
		    "V."+this.shaderName+"={",
		    "uniforms:{",
		    this.uniform,
		    "},",
		    "fs: ["+fs+"]"+this.retour.innerHTML+",",
		    "vs: ["+vs+"]"+this.retour.innerHTML,
		    "}"
		].join("\n");

		this.main.preview.contentWindow.shader.updateShader(result);
	},
	pushUniform:function(v){
		var str = v.split(String.fromCharCode(32));
		var type = str[1];
		var name = str[2].replace(";", "");
		var isNotArray = this.isAlphanumeric(name);
		var isColor = false;

		var value = null;
		var oldValue = null;
		for (var key in this.uniformValues){
			if(key===name) oldValue = JSON.parse(this.uniformValues[key]);
		}
		for (var key in this.uniformColors){
			if(key===name){ oldValue = JSON.parse(this.uniformColors[key]); isColor=true; }
		}

		var t = '';
		switch(type){
			case 'sampler2D':case 'samplerCube': t = 't'; break;
			case 'vec2':  t = 'v2'; if(oldValue!==null) value = "new THREE.Vector2("+oldValue.x+","+ oldValue.y+")";break;
			case 'vec3':
			    if(isColor){ t = 'c'; if(oldValue!==null) value = "new THREE.Color("+oldValue.r+","+ oldValue.g+","+ oldValue.b+")"; }
			    else { t = 'v3'; if(oldValue!==null) value = "new THREE.Vector3("+oldValue.x+","+ oldValue.y+","+ oldValue.z+")"; }
			break;
			case 'vec4':  t = 'v4'; if(oldValue!==null) value = "new THREE.Vector3("+oldValue.x+","+ oldValue.y+","+ oldValue.z+","+ oldValue.w+")";break;
			case 'int':   t = 'i'; if(oldValue!==null) value = oldValue; break;
			case 'float': t = 'f'; if(oldValue!==null) value = oldValue; break;
			case 'mat4':  t = 'm4'; break;
		}
		if(!isNotArray) t+= 'v';

		for (var key in this.uniformNames){ if(key===name) return; }

		this.uniform += name+" : { type: '"+t+"', value: "+value+" },\n";
		this.uniformNames[name] = 1;
	},
	isAlphanumeric:function (str){
		return /^[0-9a-zA-Z]+$/.test(str);
	},
	getShader:function(editor){
		var t = "";
		var count = editor.lineCount(), v;
		for (var i = 0; i < count; i++) {
			v = editor.getLine(i);
			if(v!==undefined){
				// find uniform
				if(v.substring(0,7)==='uniform') this.pushUniform(v);
				// push line
				if(i==0) t += "\n'"+v+"',\n";
				else if(i==count-1) t += "'"+v+"'\n";
				else t += "'"+v+"',\n";
			}
		}
		return t;
	}
}