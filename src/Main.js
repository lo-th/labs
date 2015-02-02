var LTH = {};
var isMain;

LTH.rubriques = ['physics-2d', 'physics-3d', 'games', 'shaders', 'experiments', 'others'];
//LTH.numExemples = [         2,            2,       2,         1,             1,       1 ];
LTH.option = {
'physics-2d': [ [], [], []                                      ],
'physics-3d': [ [], []                                           ],
'games':      [ ['sea3d', 'dat.gui'], ['sea3d', 'dat.gui', 'rot', 'tween'] , ['sea3d', 'tween'] ],
'shaders':    [ ['sea3d','dat.gui'], ['sea3d','dat.gui'], ['sea3d','dat.gui'], ['sea3d','dat.gui'], ['sea3d','dat.gui']   ],
'experiments':[ ['serious']                                  ],
'others':     [ ['dat.gui' ]                                               ]
}

LTH.cRubrique = '';
LTH.cFile = 0;
var esprima = esprima || {};
var CodeMirror = CodeMirror || {};
var GRAD = GRAD || {};
var history;
var main;
window.onload = init;
function init(){ main = new LTH.Main(); }


//----------------------------------------
//
//    MAIN
//
//----------------------------------------

//window.onmousemove = showHideMenu;

function showHideMenu(e){
	var c =  main.menu.content.className;
	var x = e.clientX;
		
	if(x>170){
		if(c==='menu exemple In'){
			main.menu.content.className = 'menu exemple Out';
			main.menu.logo.className = 'logo lmin';
			main.menu.title.innerHTML = '';
	    }
	}
	if(x<60){
		if(c==='menu exemple' || c==='menu exemple Out'){ 
			main.menu.content.className = 'menu exemple In';
			main.menu.logo.className = 'logo lmax';
			main.menu.title.innerHTML = LTH.cRubrique.toUpperCase();
		}
	}
}

LTH.Main = function(){
	this.menuSize = 60; //184 220;

	this.doc = document;
	this.doc.body.className = 'night';
	this.mainClass = 'night';
	this.doc.body.ondragover = function(e){return false;};
	this.doc.body.onmousemove = showHideMenu;
	//this.doc.body.ondrop = function(e){return false;};
	this.day = false;
	this.mode = 'basic';

	this.startDemo = 0;
	this.numLesson = 4;

	this.items = [];

	this.showCode = false;
	this.viewType = 'vertical';

	this.scriptText = 14;
	this.currentLesson = -1;
	//this.codeLoaded = false;
	this.isFirst = false;

	this.menu = null;
	this.editor = null;
	this.editorVertex = null;
	this.editorFragment = null;
	this.preview = null;
	this.previewDoc = null;
	this.previewMain = null;

	this.happ = this.supports_history_api();
	this.init();
}

LTH.Main.prototype = {
	constructor: LTH.Main,
	init:function (){
		this.shader = new LTH.ShaderToy(this);
		this.fileSystem = new LTH.FileSystem(this);
		this.editor = new LTH.CodeEditor(this);
		this.menu = new LTH.Menu(this);

		var _this = this;
	    window.onresize = function(e) {_this.resize(e)};
	},
	switchMode:function(mode){
		if(mode!==this.mode){
			if(this.mode==='shader') this.clearShader();
			if(mode==='shader') this.initShader();
			this.mode = mode;

		}
	},
	clearShader:function(){
		this.shader.clear();
		this.editorVertex.deleteAll();
		this.editorFragment.deleteAll();
	},
	initShader:function(){
		this.editorVertex = new LTH.CodeEditor(this, 'vertex');
		this.editorFragment = new LTH.CodeEditor(this, 'fragment');
	},
	supports_history_api : function () {
		return !!(window.history && history.pushState);
	},
	autoTime:function(){
		var h = new Date().getHours();
		if(h>19 || h<6) this.day = false; else this.day = true;
	},
	resize:function(){
		var w = window.innerWidth;
		var h = window.innerHeight;
		var v0 = this.menuSize;//220;
		var topy = 0;
		var v1 = Math.floor((w-v0)*0.5);
		var v2 = Math.floor((h-topy)*0.5);
		var v3 = Math.floor((w-v0)/3);
		var v4 = Math.floor(h/3);
		if(this.showCode){
			this.editor.content.style.display = 'block';
			if(this.mode==='shader'){
				this.editorVertex.content.style.display = 'block';
				this.editorFragment.content.style.display = 'block';
			}
			switch(this.viewType){
				case 'vertical':
				    if(this.mode!=='shader')this.setStyle (this.editor.content, v0, 0, v1, h);
				    else {
				    	this.setStyle (this.editor.content, v0, 0, v1, v4);
				    	this.setStyle (this.editorVertex.content, v0, v4, v1, v4);
				    	this.setStyle (this.editorFragment.content, v0, v4+v4, v1, v4);
				    }
				    if(this.preview!==null)this.setStyle (this.preview, v0+v1, 0, v1, h);
				break;
				case 'horizon':
				    if(this.mode!=='shader')this.setStyle (this.editor.content, v0, 0, w-v0, v2);
				    else {
				    	this.setStyle (this.editor.content, v0, 0, v3, v2);
				    	this.setStyle (this.editorVertex.content, v0+v3, 0, v3, v2);
				    	this.setStyle (this.editorFragment.content, v0+v3+v3, 0, v3, v2);
				    }
				    if(this.preview!==null)this.setStyle (this.preview, v0, v2, w-v0, v2);
				break;
			}
			this.editor.refresh();
			if(this.mode==='shader'){
				this.editorVertex.refresh();
				this.editorFragment.refresh();
			}
		} else {
			this.editor.content.style.display = 'none';
			if(this.mode==='shader'){
				this.editorVertex.content.style.display = 'none';
				this.editorFragment.content.style.display = 'none';
			}
			if(this.preview!==null)this.setStyle (this.preview, v0, 0, w-v0, h);
		}
	},
	setTextSize:function(){
		this.editor.changeFontSize(this.scriptText);
		if(this.mode==='shader'){
			this.editorVertex.changeFontSize(this.scriptText);
			this.editorFragment.changeFontSize(this.scriptText);
		}
	},
	setStyle:function(n, l, t, w, h){
		n.style.left=l+'px';
		n.style.top=t+'px';
		n.style.width=w+'px';
		if(h==0) n.style.height='100%';
		else n.style.height=h+'px';
	},
	switchStyle:function(){
		if(this.day) {
			this.editor.changeTheme(0);
			if(this.mode==='shader'){
				this.editorVertex.changeTheme(0);
				this.editorFragment.changeTheme(0);
			}
		}else{
			this.editor.changeTheme(1);
			if(this.mode==='shader'){
				this.editorVertex.changeTheme(1);
				this.editorFragment.changeTheme(1);
			}
		}
		this.previewTheme();
	},
	previewTheme:function(){
		if(this.previewDoc.body)this.previewDoc.body.className = this.mainClass;

		if(this.previewMain && this.previewMain.v){
			if(this.day) this.previewMain.v.colorBack(0xd2cec8);
			else this.previewMain.v.colorBack(0x25292e);//202020);
		}
	},
	previewClearFocus:function(){
		var allTags=this.previewDoc.getElementsByTagName('*'), i=0, e;
		while(e=allTags[i++]){ if(e.id) e.blur(); }
	},
	clearPreview:function(){
		if(this.preview !== null){
			this.doc.body.removeChild(this.preview);
			this.preview = null;
			this.previewDoc = null;
			this.previewMain = null;
			
			console.clear();
		}
	},
	initPreview:function(){
		//this.clearPreview();

		this.preview = this.doc.createElement( 'iframe' );
		this.preview.className = 'preview';
		this.preview.src = 'about:blank';
	    this.doc.body.appendChild(this.preview);
	},
	update:function(value) {
		
		if(value!==''){
			//this.codeLoaded=false;

			//if(this.isFirst){
			
			this.clearPreview();
			this.initPreview();


			


			//this.tmpcode = value;

			var baseView = "<script src='src/Vue3d.js'></script>";
			var threeLib = "<script src='js/libs/three.js'></script>";
			if(isMain){
			    baseView = "<script src='build/v3d.min.js'></script>";
			    threeLib = "<script src='js/libs/three.min.js'></script>";
			}

			// extra libs
			var options = '';
			var ops = LTH.option[LTH.cRubrique][LTH.cFile];
			var i = ops.length;
			while(i--) options+="<script src='js/libs/"+ops[i]+".min.js'></script>";

	        var myContent = [
			    "<!DOCTYPE html>",
				"<html lang='en'>",
				"<head>",
				"<title>prev</title>",
				"<meta charset='utf-8'>",
				"<link rel='stylesheet' href='css/consolas.css'>",
				"<link rel='stylesheet' href='css/basic.css'>",
				threeLib,
				"<script src='js/libs/three.post.js'></script>",
				options,
				baseView,
				"<script id='shader'></script>",
				"</head><body class='"+this.mainClass+"'>",
				"<script>",
				"var canvas = document.createElement('canvas'); document.body.appendChild( canvas );",
				"var info = document.createElement('div'); document.body.appendChild( info ); info.className = 'info';",
				"var debug = document.createElement('div'); document.body.appendChild( debug ); debug.className = 'debug';",
				value,
				"</script>",
				"</body></html>"
			].join("\n");

			this.previewDoc = this.preview.contentDocument || this.preview.contentWindow.document;
			this.previewMain = this.preview.contentWindow;

			this.previewDoc.open('text/html', 'replace');
		    this.previewDoc.write(myContent);
		    this.previewDoc.close();
            this.preview.style.display = 'block';

		    this.resize();
		    var _this = this;

		    this.previewMain.onload = function(){
		    	
		        _this.previewTheme();
		    	//if(_this.mode=='shader'){
		    	    // _this.previewMain.main = _this;
		    	    //_this.previewMain.V.Main= _this;
		    	   // console.log(_this.mode, _this.previewMain.V.Main)
		    	// }
		    }
					//this.previewMain.onload = function(e){_this.frameLoaded()};
					//this.frameLoaded(value)
					//setTimeout(function(){_this.frameLoaded(value);},10);
					
				//}
			//} else {
			//    this.frameLoaded(value);
			//}

			/*var _this = this;
			setTimeout(function(){
				_this.preview.onload = function(e){console.log('loaded'); _this.frameLoaded()}
			    _this.preview.onerror = function(e){console.log('error')}
			}, 100);*/
			
			/*this.preview.onload = function(e){
				console.log('loaded')
				_this.previewMain = _this.preview.contentWindow;
				if(_this.mode==='shader') _this.previewMain.main = _this;
				var head = _this.previewDoc.getElementsByTagName('head')[0];
				
				var nscript = _this.previewDoc.createElement("script");
				//nscript.id = 'base';
				nscript.setAttribute("id", "base");
				nscript.type = "text/javascript";
				nscript.charset = "utf-8";
				nscript.text = value;
				head.appendChild(nscript);

				_this.preview.style.display = 'block';
				_this.codeLoaded = true;
				_this.previewTheme();
				_this.resize();
				
				if(_this.isFirst)_this.isFirst=false;
				else _this.showModif();
			}*/
			if(this.isFirst) this.isFirst=false;
			else this.menu.modified();
		
		}
	},
	/*frameLoaded:function(value){
		//

		//this.previewDoc = this.preview.contentDocument || this.preview.contentWindow.document;
		//this.previewMain = this.preview.contentWindow;

		console.log('loaded')
		//this.previewMain = this.preview.contentWindow;
		//if(this.mode==='shader') this.previewMain.main = this;

		var head = this.previewDoc.getElementsByTagName('head')[0];
		var nscript = this.previewDoc.createElement("script");
			//nscript.id = 'base';
		//nscript.setAttribute("id", "base");
		//window.onload = init;
		nscript.type = "text/javascript";
		nscript.name = "topScript";
		nscript.id = "topScript";
		nscript.charset = "utf-8";
		nscript.text = value;
		//head.appendChild(nscript);
		
		this.tmpcode = '';

		this.preview.style.display = 'block';
		this.codeLoaded = true;

		var _this = this;
		this.previewMain.onload = function(){
			_this.previewTheme();
			head.appendChild(nscript);
			if(_this.mode==='shader') _this.previewMain.main = _this;
		}
		
			
		if(this.isFirst){
			this.isFirst=false;
			//this.previewMain.onload = this.previewMain.init;
			//this.previewTheme();
			//this.resize();
		} else{ 
			//this.previewMain.clear();
			//this.previewMain.init();
			this.menu.modified();
		}
	},*/
	checkCurrent:function(){
		for(var i=0; i< this.numLesson; i++){
			if(this.items[i].name==this.currentLesson) this.items[i].style.background = '#881288';
			else this.items[i].style.background = '#121212';
		}
	},
	loadFile:function(name){
		this.isFirst = true;
		this.fileSystem.load(name);
	},
	openFile:function(o){
		this.fileSystem.open(o);
	},
	createLink:function(blob, name, type){
		this.menu.addIconLink(blob, name, type);
	},
	callSave:function(){
		this.fileSystem.save();
	}
}

//----------------------------------------
//
//    SHADER
//
//----------------------------------------

LTH.ShaderToy = function(main){
	this.main = main;
	this.retour = document.createElement('div');
	this.retour.innerHTML = ".join('&#92;n')";
	this.shaderName = '';
	this.shaderBase = null;
	this.uniformValues = {};
	this.uniformColors = {};
	this.isShaderReady = false;
}

LTH.ShaderToy.prototype = {
	constructor: LTH.ShaderToy,
	open:function(name){
		//console.log(name);
		this.main.fileSystem.load('shaders/'+name+'.js', true);
	},
	clear:function(){
		this.shaderName = '';
		this.shaderBase = null;
		this.uniformColors = {};
		this.uniformValues = {};
		this.isShaderReady = false;
	},
	deCompacte:function(name, result){
		if(this.main.mode!=='shader') return;
		this.uniformColors = {};
		this.uniformValues = {};
		var head = this.main.previewDoc.body;
		var nscript = this.main.previewDoc.createElement("script");
		nscript.setAttribute("id", "shader");
		nscript.type = "text/javascript";
		nscript.charset = "utf-8";
		nscript.text = result;
		head.appendChild(nscript);
		try {
			this.shaderBase = this.main.previewMain.V[name];
			this.shaderName = name;
			/*this.main.editorVertex.set(this.main.previewMain.V[name].vs, true);
			this.main.editorFragment.set(this.main.previewMain.V[name].fs, true);
			this.main.preview.contentWindow.shad.apply( this.main.previewMain.V[name] );*/

			
		}catch(err){

		}finally {
			this.getUniformValue(this.shaderBase.uniforms);
			this.main.editorVertex.set(this.shaderBase.vs, true);
			this.main.editorFragment.set(this.shaderBase.fs, true);
			this.main.preview.contentWindow.shader.apply( this.shaderBase );
			this.isShaderReady = true;
		}
	},
	getUniformValue:function(uniforms){
		this.uniformValues = {};
		for (var key in uniforms){
			var type = uniforms[key].type;
			var val = JSON.stringify(uniforms[key].value);

			//
			//console.log(key, val, type);
			if(type === 'c') this.uniformColors[key] = val;
			else this.uniformValues[key] = val;


			if(type === 'c'){ this.main.previewMain.v.gui.color(key, uniforms[key].value); }
			if(type === 'i'){ this.main.previewMain.v.gui.int(key, uniforms[key].value); }
			if(type === 'f'){ this.main.previewMain.v.gui.float(key, uniforms[key].value); }
			if(type === 't'){ this.main.previewMain.v.gui.textures(key); }
		}
	},
	compacte:function(){
		if(this.main.mode!=='shader' || !this.isShaderReady) return;

		this.uniform = '';
		var vs = this.getShader(this.main.editorVertex.editor);
		var fs = this.getShader(this.main.editorFragment.editor);

		//console.clear();
		var result = [
		    "V."+this.shaderName+"={",
		    "uniforms:{",
		    this.uniform,
		    "},",
		    "fs: ["+fs+"]"+this.retour.innerHTML+",",
		    "vs: ["+vs+"]"+this.retour.innerHTML,
		    "}"
		].join("\n");
		var head = this.main.previewDoc.body;
		var nscript = this.main.previewDoc.createElement("script");
		nscript.setAttribute("id", "shader");
		nscript.type = "text/javascript";
		nscript.charset = "utf-8";
		nscript.text = result;
		head.appendChild(nscript);
		this.main.preview.contentWindow.shader.dispose();
		this.main.preview.contentWindow.shader.apply( this.main.previewMain.V[this.shaderName] );
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

		this.uniform += name+" : { type: '"+t+"', value: "+value+" },\n";
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


//----------------------------------------
//
//    MENU
//
//----------------------------------------


LTH.Menu = function(main){
	this.main = main;
	this.doc = document;

	this.content = this.doc.createElement('div');
	//this.content.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:none; overflow:hidden;";
	this.content.className = 'menu';
	//this.content.id = 'menu';
	this.doc.body.appendChild( this.content );

	this.rubriques = [];
	this.icons = [];
	this.files = [];
	this.buttons = [];

	this.currentFile = -1;
	this.inModif =  -1;
	this.colorSelect = '#d2cec8';
	this.colorModif = '#FF0073';
	this.colorOver = 'rgba(255,255,255,0.3)';
	this.currentLink = null;
	this.zone = null;
	this.logo = null;

	this.isMenu = false;
	this.isHome = false;

	this.home = null;
	this.leftMenu = null;

	this.initLogo();
	this.initHome();


	var _this = this;
	if(this.main.happ){
		window.addEventListener("popstate", function(e) {
			if(!_this.isHome)_this.initHome(e);
			else history.back();  
		})
	}
	
}

LTH.Menu.prototype = {
	constructor: LTH.Menu,
	initLogo:function(){
		this.logo = this.doc.createElement('div');
		this.logo.className = 'logo';
		//this.logo.style.cssText = " position:absolute; left:50%; top:15px; margin-left:-60px; width:120px; height:120px; text-align:center; pointer-events:auto; cursor:pointer;";
		this.content.appendChild( this.logo );
		this.logo.innerHTML = LTH.Logos('d2cec8');
		this.title = this.doc.createElement('div');
		this.title.innerHTML = 'LOTH LABS';
		this.title.className = 'title';
		this.content.appendChild( this.title );
		var _this = this;
		this.logo.onmousedown = function(e){ _this.initHome(e); };
		this.logo.onmouseover = function(e){
			if(!_this.isHome) _this.title.innerHTML = 'BACK HOME';
		};
		this.logo.onmouseout = function(e){ 
			if(!_this.isHome) _this.title.innerHTML = LTH.cRubrique.toUpperCase();
		};
	},
	initHome:function(){
		this.content.className = 'menu home';
		this.main.shader.clear();
		if(this.isMenu) this.resetMenu();
		if(this.isHome) return;
		LTH.cRubrique = '';//-1;
		LTH.cFile = 0;
		this.title.innerHTML = 'LOTH LABS';
		//this.content.style.width = '100%';
		//this.content.style.boxShadow = 'none';
		this.home = this.doc.createElement('div');
		this.home.style.cssText = "position:absolute; left:10%; top:160px; width:80%; height:400px; text-align:center;";
		this.content.appendChild( this.home  );
		var _this = this;
		var rub;
		for(var i=0; i<LTH.rubriques.length ; i++){
			rub = this.doc.createElement('div');
			rub.className = 'rub';
			//if(this.main.day) rub.className = 'rub';
			//else rub.className = 'rub';
			rub.name = LTH.rubriques[i];//i;
			rub.innerHTML = LTH.rubriques[i].toUpperCase();
			rub.onclick = function(e){ _this.resetHome(e) };
			rub.onmouseover = function(e){
				e.target.className = 'rub rubover';
				//this.style.background=_this.colorModif;
			};
			rub.onmouseout = function(e){
				e.target.className = 'rub';
				//if(_this.main.day) this.style.background='#202020';
				//else this.style.background='#d2cec8';
			};
			this.home.appendChild( rub );
		}
		this.isHome = true;
	},
	resetHome:function(e){
		LTH.cRubrique = e.target.name;
		this.clearDiv(this.home);
		this.content.removeChild(this.home);
		this.isHome = false;
		this.initMenu();
		
		if(this.main.happ)history.pushState(null, null, 'index.html');
		e.preventDefault();
	},
	resetMenu:function(){
		this.main.editor.clear();
		if(this.main.mode==='shader'){
			this.main.editorVertex.clear();
			this.main.editorFragment.clear();
		}
		this.main.clearPreview();
		this.clearDiv(this.zone);
		this.clearDiv(this.leftMenu);
		this.content.removeChild(this.leftMenu);
		this.content.removeChild(this.zone);
		this.icons = [];
		this.files = [];
		this.buttons = [];
		this.isMenu = false;
	},
	initMenu:function(){
		this.content.className = 'menu exemple';
		this.logo.className = 'logo lmin';

		//var name = LTH.cRubrique;//LTH.rubriques[LTH.cRubrique];
		var mode = 'basic';
		if(LTH.cRubrique === "shaders") mode = 'shader';

		this.main.switchMode(mode);
		this.main.resize();

		this.title.innerHTML = '';//LTH.cRubrique.toUpperCase();
		//this.content.style.width = this.main.menuSize + 'px';
		//this.content.style.boxShadow = '-12px 0px 12px -12px rgba(0, 0, 0, 0.3) inset';

		this.initButton();
		this.initZone();
		var name;
		
		for(var i=0; i < LTH.option[LTH.cRubrique].length; i++){
		//for(var i=0; i < LTH.numExemples[LTH.cRubrique]; i++){
			name = "demo_"+i+'.js';
			this.pushFile(name);//, '#cccc00');
		}
	    this.currentFile = this.main.startDemo || 0;
		//this.main.loadFile('demos/'+LTH.rubriques[LTH.cRubrique]+'/'+this.files[this.currentFile]);
		this.main.loadFile('demos/'+LTH.cRubrique+'/'+this.files[this.currentFile]);
	    this.resetIcon();
	    
	    this.isMenu = true;
	},
	clearDiv:function(node){
		while(node.firstChild) { node.removeChild(node.firstChild); }
	},
	initZone:function(){
		this.zone = this.doc.createElement('div');
		this.zone.className = 'zone';
		//this.zone.style.cssText = "position:absolute; left:20px; top:200px; width:180px; height:calc(100% - 260px);"; 
		//this.zone.style.cssText += "border:1px dashed rgba(0,0,0,0.1); pointer-events:auto;";
		this.content.appendChild( this.zone );
		var _this = this;
		this.zone.ondragover = function(e){_this.zoneDragOver(e)};
	    this.zone.ondragend = function(e){_this.zoneDragEnd(e)};
	    this.zone.ondrop = function(e){_this.zoneDrop(e)};
	},
	initButton:function(){
		this.leftMenu = this.doc.createElement('div');
		this.leftMenu.className = 'bottomLeftMenu';
		//this.leftMenu.style.cssText = "position:absolute; bottom:20px; width:"+this.main.menuSize+"px; height:20px; text-align:center;";
		this.content.appendChild( this.leftMenu );

		var b;
		for(var i=0; i<5; i++){
			b = this.doc.createElement('div');
			b.className = 'b';
			/*if(this.main.day) b.className = 'b';
			else  b.className = 'bn';*/
			if(i>1)b.style.display = "none";
			this.leftMenu.appendChild(b);
			this.buttons[i] = b;
		}
		this.buttons[0].innerHTML = 'N';
		this.buttons[1].innerHTML = 'C';
		//this.buttons[1].style.cssText = "width:40px; text-decoration:none;"
		this.buttons[2].innerHTML = 'V';
		this.buttons[3].innerHTML = '+';
		this.buttons[4].innerHTML = '-';
		var _this = this;
		this.buttons[0].onclick = function(){_this.dayNight()};
		this.buttons[1].onclick = function(){_this.showCode()};
		this.buttons[2].onclick = function(){_this.verticlaHorizon()};
		this.buttons[3].onclick = function(){_this.textPlus()};
		this.buttons[4].onclick = function(){_this.textMoin()};
	},
	showCode:function(){
		if(this.main.showCode){
			this.main.showCode = false;
			this.buttons[1].style.textDecoration = "none";
			this.buttons[2].style.display = "none";
			this.buttons[3].style.display = "none";
			this.buttons[4].style.display = "none";
		}else{
			this.main.showCode = true;
			this.buttons[1].style.textDecoration = "line-through";
			this.buttons[2].style.display = "inline-block";
			this.buttons[3].style.display = "inline-block";
			this.buttons[4].style.display = "inline-block";
		}
		this.main.resize();
	},
	dayNight:function(){
		if(this.main.day){
		    this.isNight();
		    this.buttons[0].innerHTML = 'N';
		} else {
			this.isDay();
			this.buttons[0].innerHTML = 'D';
		}
		this.resetIcon(true);
		this.main.switchStyle();
	},
	verticlaHorizon:function(){
		if(this.main.viewType=='vertical'){
			this.main.viewType = 'horizon'; 
			this.buttons[2].innerHTML = 'H';
		}else{
			this.main.viewType = 'vertical'; 
			this.buttons[2].innerHTML = 'V';
		}
		this.main.resize();
	},
	textPlus:function(){
		this.main.scriptText ++;
		this.main.setTextSize();
	},
	textMoin:function(){
		this.main.scriptText --;
		this.main.setTextSize();
	},
	isDay:function(){
		//this.img2.src = './images/logo_w.gif';
		this.logo.innerHTML = LTH.Logos('25292e');
		this.main.day = true;
		this.main.mainClass = 'day';
		this.doc.body.className = 'day';
		this.colorSelect = '#25292e';
		this.colorOver = 'rgba(0,0,0,0.3)';
	},
	isNight:function (){
		//this.img2.src = './images/logo.gif';
		this.logo.innerHTML = LTH.Logos('d2cec8');
		this.main.day = false;
		this.main.mainClass = 'night';
		this.doc.body.className = 'night';
		this.colorSelect = '#d2cec8';
		this.colorOver = 'rgba(255,255,255,0.3)';
	},
	zoneDragOver:function(){
		this.zone.classList.add("hover");
		return false;
	},
	zoneDragEnd:function(){
		this.zone.classList.remove("hover");
		return false;
	},
	zoneDrop:function(e){
		this.zone.classList.remove("hover");
		e.preventDefault();
		var i;
	    if(e.dataTransfer.items){
	        i = e.dataTransfer.items.length;
	        while(i--){
	            var entry = e.dataTransfer.items[i].webkitGetAsEntry();
	            if (entry.isFile) {
	                this.addFile(e.dataTransfer.items[i].getAsFile());
	            } else if (entry.isDirectory) {
	                //console.log('dir', e.dataTransfer.items[i].getAsFile(), entry.fullPath);
	            }
	        }
	    } else{
	        i = e.dataTransfer.files.length;
	        while(i--){
	            this.addFile(e.dataTransfer.files[i]);
	        }
	    }
	},
	addFile:function(file){
		var _this = this
	    var reader = new FileReader();
	    reader.onload = function (e){
	        var o = {};
	        o.name = file.name;
	        switch(o.name.substr(o.name.lastIndexOf(".")+1, o.name.length)){
	            case 'sea': o.t = 'sea'; o.c='#cccccc'; break;
	            case 'css': o.t = 'css'; o.c='#cc6600'; break;
	        }
	        switch(file.type){
	            case 'application/javascript': o.t='js'; o.c='#cccc00'; break;
	            case 'text/html': o.t='html'; o.c='#00cccc'; break;

	            case 'image/svg+xml': o.t='svg'; o.c='#cc3300'; break;
	            case 'image/png': o.t='png'; o.c='#cc0066'; break;
	            case 'image/jpeg': o.t='jpg'; o.c='#cc0033'; break;
	        }

	        o.file = file;
	        o.result = e.target.result;
	        _this.pushFile(o.name);
	    };
	    reader.readAsDataURL(file);
	},
	pushFile:function(name){
		var _this = this
		// don't add if same file
		var i = this.files.length;
		while(i--){ if(name == this.files[i]) return; }

	    var id = this.icons.length;
	    var ic = document.createElement('div');
	    ic.className = 'ic';
	    //ic.style.cssText = 'display:block; width:180px; height:30px; background-color:rgba(0,0,0,0); cursor:pointer; pointer-events:auto;';
	    var iner = document.createElement('div');
	    iner.style.cssText = 'position:relative; left:10px; top:5px; width:18px; height:18px; pointer-events:none; background-color: none; border:2px solid rgba(0,0,0,0);  border-radius:20px;';
	    var title = document.createElement('div');
	    title.style.cssText = 'position:relative; left:30px; top:-12px; width:calc(100% - 40px); height:20px; pointer-events:none; text-align:right;';
	    var img = document.createElement('div');
	    img.style.cssText = 'position:relative; left:15px; top:-28px; width:8px; height:8px; pointer-events:none; background-color: '+this.colorSelect+';  border-radius:20px;';
	    title.innerHTML = name.substr(0, name.lastIndexOf("."));
	    ic.appendChild( iner );
	    ic.appendChild( title );
	    ic.appendChild( img );
	    this.zone.appendChild( ic );
	    ic.name = id;
	    ic.onclick =  function(e){_this.openFile(e)};
	    ic.ondblclick =  function(e){_this.openFile(e)};
	    ic.onmouseover =  function(e){_this.iconOver(e)};
	    ic.onmouseout =  function(e){_this.unselected(e)};
	    ic.onmouseup =  function(e){_this.unselected(e)};

	    ic.ondragstart =  function(e){_this.dragstart(e)};
	    ic.ondragend =  function(e){_this.dragend(e)};
	    
	    this.icons[id]=ic;
	    this.files[id]=name;
	},
	iconOver:function (e){
		e.target.className = 'ic icover';
	    e.preventDefault();
	    var id = e.target.name;
	    if(id!==this.currentFile){
		    var child = this.icons[id].childNodes;
		    child[0].style.border ='2px solid ' + this.colorOver;
		}
	},
	unselected:function (e){
		e.target.className = 'ic icout';
	    e.preventDefault();
	    var id = e.target.name;
	    if(id!==this.currentFile){
		    var child = this.icons[id].childNodes;
		    child[0].style.border ='2px solid rgba(0,0,0,0)';
		}
	},
	addIconLink:function (blob, name, type){
		window.URL = window.webkitURL || window.URL;
		if (this.currentLink){
		    window.URL.revokeObjectURL(this.currentLink.href);
		    this.currentLink=null;
		}
		this.currentLink = document.createElement('a');
		this.currentLink.style.cssText = "position:absolute; top:6px; right:65px; width:120px; height:20px; text-align:center;"
		this.currentLink.download = name;
		this.currentLink.href = window.URL.createObjectURL(blob);
		this.currentLink.dataset.downloadurl = [type, this.currentLink.download, this.currentLink.href].join(':');
	},
	dragstart:function (e){
		var id = e.target.name;
		if (e.target.classList.contains('dragout') && this.currentLink!==null) { e.dataTransfer.setData('DownloadURL', this.currentLink.dataset.downloadurl ); }
	},
	dragend:function (e){
		this.resetModified();
	},
	openFile:function (e){
	    e.preventDefault();
	    var id = e.target.name;
	    if(this.currentFile!==id){
	    	LTH.cFile = id || 0;
	    	this.resetModified();
	        this.currentFile = id;
	    	this.main.loadFile('demos/'+LTH.cRubrique+'/'+this.files[id]);
	    	this.resetIcon();
	    }
	},
	resetIcon:function (plus){
		var i = this.icons.length, child;
		while(i--){
			child = this.icons[i].childNodes;
		    if(i==this.currentFile){
		    	if(i==this.inModif)child[0].style.border ='2px solid '+this.colorModif;
		    	else child[0].style.border ='2px solid '+this.colorSelect;
		    }
		    else child[0].style.border ='2px solid rgba(0,0,0,0)';
		    if(plus){
		    	if(i==this.inModif){
		    		child[1].style.color = this.colorModif;
		    		child[2].style.backgroundColor = this.colorModif;
		    	}else{
		    		child[1].style.color = this.colorSelect;
		    		child[2].style.backgroundColor = this.colorSelect;
		    	}
		    }
		}
	},
	modified:function(){
		this.inModif = this.currentFile;
		var child = this.icons[this.currentFile].childNodes;
		this.icons[this.currentFile].draggable = true;
		this.icons[this.currentFile].classList.add('dragout');
		child[0].style.border ='2px solid '+this.colorModif;
		child[1].style.color = this.colorModif;
		child[2].style.backgroundColor = this.colorModif;
		this.main.callSave();
	},
	resetModified:function(){
		this.inModif = -1;
		var i = this.icons.length, child;
		while(i--){
			this.icons[i].draggable = false;
			this.icons[i].classList.remove('dragout');
			child = this.icons[i].childNodes;
			if(i==this.currentFile)child[0].style.border ='1px solid '+this.colorSelect;
		    child[1].style.color = this.colorSelect;
		    child[2].style.backgroundColor = this.colorSelect;
		}
		if (this.currentLink){
		    window.URL.revokeObjectURL(this.currentLink.href);
		    this.currentLink=null;
		}
	}
}



//----------------------------------------
//
//    CODE EDITOR
//
//----------------------------------------


LTH.CodeEditor = function(main, type){
	this.type = type || 'base';
	this.main = main;
	this.doc = document;
	this.editor = null;
	this.interval = null;
	this.mode = '';
	this.currentName = '';

	this.content = this.doc.createElement('div');
	this.content.className = 'editor';
	//this.content.style.cssText = "position:absolute; background-color:none; pointer-events:auto; display:none; border:none; box-shadow: -12px -12px 12px -12px rgba(0, 0, 0, 0.3) inset;";
	this.content.id = 'editor'+this.type;
	this.doc.body.appendChild( this.content );

	this.errorLines = [];
	this.widgets = [];

	this.isEnd = false;
	this.isStart = false;
	this.init();
}

LTH.CodeEditor.prototype = {
	constructor: LTH.CodeEditor,
	init:function(){
		this.editor = CodeMirror(this.content, {
	        lineNumbers: true,
	        matchBrackets: true,
	        indentWithTabs: true,
	        styleActiveLine: true,
	        theme:'monokai',
	        mode:'text/javascript',
			tabSize: 4,
			indentUnit: 4,
			highlightSelectionMatches: {showToken: /\w/}
	    });
	    var _this = this;
	    if(this.type==='base') this.editor.on('change', function() { _this.onChange() } );
	    else this.editor.on('change', function() { _this.main.shader.compacte(); } );
	},
	onChange:function(){
		var _this = this;
		this.mode = this.editor.getOption('mode');
		if(!this.end){
			clearTimeout( this.interval );
			var value = this.editor.getValue();
			if ( this.validate( value )) this.interval = setTimeout( function() {_this.main.update(value, true);}, 500);
		}
		//this.editor.autofocus = true;
		/*clearTimeout( this.interval );
		if(this.isEnd) return;
		if(this.mode == 'htmlmixed'){
			var value = this.editor.getValue();
			if ( this.validate( value )) this.interval = setTimeout( function() {_this.main.update(value);}, 500);
		} else {
			var value = this.editor.getValue();
			if ( this.validate( value )) this.interval = setTimeout( function() {_this.main.update(value, true);}, 500);
		}*/
	},
	get:function(){
		return this.editor.getValue();
	},
	set:function(text){
		this.editor.setValue(text);
	},
	changeTheme:function(n){
		if(n==0) this.editor.setOption("theme", "default");
		else this.editor.setOption("theme", "monokai");
	},
	deleteAll:function(){
		this.clear();
		this.doc.body.removeChild( this.content );
		this.content = null;
	},
	clear:function(){
		this.isEnd = true;
		this.main.showCode = false;
		this.content.style.display = 'none';
		this.editor.setValue('');
	    //this.editor.refresh();
	},
	refresh:function(){
	    this.editor.refresh();
	},
	changeFontSize:function(size){
	    this.editor.getWrapperElement().style["font-size"] = size+"px";
	    this.refresh();
	},
	close:function (){
		this.editor.getInputField().blur();
	},
	validate:function( value ){
		var editor = this.editor;
		var mode = this.mode;
		var _this = this;
		
		return editor.operation( function () {
			while ( _this.errorLines.length > 0 ) {
				editor.removeLineClass( _this.errorLines.shift(), 'background', 'errorLine' );
			}
			for ( var i = 0; i < _this.widgets.length; i ++ ) {
				editor.removeLineWidget( _this.widgets[ i ] );
			}
			_this.widgets.length = 0;
			var string = value;
			/*if(mode == 'htmlmixed'){
			    // remove html
			    string = '';
				string = '\n';
				var lines = value.split( '\n' );
				var lineCurrent = 0, lineTotal = lines.length;
				while ( lineCurrent < lineTotal && lines[ lineCurrent ].indexOf( '<script>' ) === -1 ) {
					string += '\n';
					lineCurrent ++;
				}
				var lineStart = lineCurrent ++;
				while ( lineCurrent < lineTotal && lines[ lineCurrent ].indexOf( '<\/script>' ) === -1 ) {
					string += lines[ lineCurrent ] + '\n';
					lineCurrent ++;
				}
			}*/

			try {
				var result = esprima.parse( string, { tolerant: true } ).errors;
				for ( var i = 0; i < result.length; i ++ ) {
					var error = result[ i ];
					var message = document.createElement( 'div' );
					message.className = 'esprima-error';
					message.textContent = error.message.replace(/Line [0-9]+: /, '');
					var lineNumber = error.lineNumber - 1;
					_this.errorLines.push( lineNumber );
					editor.addLineClass( lineNumber, 'background', 'errorLine' );
					var widget = editor.addLineWidget( lineNumber, message );
					_this.widgets.push( widget );
				}
			} catch ( error ) {
				var message = document.createElement( 'div' );
				message.className = 'esprima-error';
				message.textContent = error.message.replace(/Line [0-9]+: /, '');
				var lineNumber = error.lineNumber - 1;
				_this.errorLines.push( lineNumber );
				editor.addLineClass( lineNumber, 'background', 'errorLine' );
				var widget = editor.addLineWidget( lineNumber, message );
				_this.widgets.push( widget );
			}
			return _this.errorLines.length === 0;
		});
	}
}



//----------------------------------------
//
//    FILE SYSTEM
//
//----------------------------------------


LTH.FileSystem = function(main){
	this.main = main;
}

LTH.FileSystem.prototype = {
	constructor: LTH.FileSystem,
	/*test:function (name){
		var xhr;
	    if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");// IE
		xhr.onerror = function () { xhr.abort(); return false;};
		xhr.onreadystatechange = function() {
			if(this.readyState == 2) return true;
			if(this.readyState == 4) xhr.abort();
		}
		xhr.open('GET', "../demos/"+name, true);
		xhr.send(null);
	},*/
	load:function(url, isShader){
		var type = url.substring(url.lastIndexOf(".")+1, url.length);
		var name = url.substring(url.lastIndexOf("/")+1, url.lastIndexOf(".") );
		var xhr;
		if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");// IE
		xhr.open('GET', "./"+url, true);
		xhr.responseType = 'blob';
		var _this = this;
		xhr.onload = function(e) {
		    var reader = new FileReader();
		    reader.onload = function(e) {
		    	_this.process( name, e.target.result, isShader );
		    }
		    reader.readAsText(this.response);
		}
		xhr.send();
	},
	open:function(o, isShader){
		var name = o.name;
		var reader = new FileReader();
		var _this = this;
        reader.onload = function(e) {
        	_this.process( name, e.target.result, isShader );;
        }
        reader.readAsText(o.file);
	},
	save:function() {
		var type = 'application/text/javascript;charset=utf-8';
		var ex = '.js';
		var blob = new Blob( [ this.main.editor.get() ], { type: type } );
		this.main.createLink(blob, this.main.editor.currentName+ex, type);
	},
	process:function(name, result, isShader){
		if(isShader){
    	    this.main.shader.deCompacte(name, result);
    	}else{
    	    this.main.editor.editor.setValue(result);
    	    this.main.editor.currentName = name;
    	}
	}
}



LTH.Logos = function(color){
	var txt = [
	"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='128px' height='128px' viewBox='0 0 128 128'><defs><g id='copie_Symbole_1_0_Layer0_0_FILL'>",
	"<path fill='#"+color+"' fill-opacity='0.3' stroke='none' d='M 23 37 L 19 37 Q 19 44.9 13.4 50.4 9.6001953125 54.26875 4.65 55.45 L 6.3 62.05 Q 10.253515625 60.838671875 13.55 57.95 12.75 56.9921875 12.75 55.7 12.75 54.25 13.8 53.2 14.85 52.15 16.3 52.15 17.3998046875 52.15 18.25 52.75 23 46.0076171875 23 37 M 7.05 44.05 Q 10 41.15 10 37 10 32.85 7.05 29.9 4.15 27 0 27 L 0 47 Q 1.2853515625 47 2.45 46.7 5.0482421875 46.086328125 7.05 44.05 M 0 0 L 0 10 Q 11.2 10 19.05 17.85 25.74296875 24.54296875 26.8 33.55 27 35.2291015625 27 37 27 43.170703125 24.55 48.3 27.7384765625 51.3177734375 27.2 54.05 26.15 58.85 23.6 60.65 18.55 64.05 16.25 70.75 13.5755859375 77.8880859375 16.05 83.6 18.7349609375 79.5951171875 20.85 73.95 23.15 67.25 28.2 63.85 30.75 62.05 31.8 57.25 34.75 42.3 31.85 27 31.8 26.85 31.8 26.75 30.75 16 22.25 7.9 13.65 -0.35 0 0 Z'/></g>",
	"<path id='Symbole_1_0_Layer0_0_1_STROKES' stroke='#"+color+"' stroke-width='3' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 0 93.75 Q 13.6 93.3 20.85 73.95 23.15 67.25 28.2 63.85 30.75 62.05 31.8 57.25 34.75 42.3 31.85 27 31.8 26.85 31.8 26.75 30.75 16 22.25 7.9 13.65 -0.35 0 0 M 38.65 29.45 Q 40.7 42.6 38.65 55.65 M 43.8 52.25 Q 44.95 42.55 43.8 32.85 46.95 42.55 43.8 52.25 Z M 33.45 27 Q 36.4 42.2 33.45 57.35'/>",
	"<path id='Symbole_1_0_Layer0_1_1_STROKES' stroke='#"+color+"' stroke-width='3' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 19.85 53.5 Q 19.85 54.95 18.8 56 17.75 57.05 16.3 57.05 14.85 57.05 13.8 56 12.75 54.95 12.75 53.5 12.75 52.05 13.8 51 14.85 49.95 16.3 49.95 17.75 49.95 18.8 51 19.85 52.05 19.85 53.5 Z'/></defs>",
	"<g transform='matrix( 1, 0, 0, 1, 64,63.1) '><g transform='matrix( -1, 0, 0, 1, 0,-46.85) '><g transform='matrix( 1, 0, 0, 1, 0,0) '><use xlink:href='#copie_Symbole_1_0_Layer0_0_FILL'/></g></g>",
	"<g transform='matrix( 1, 0, 0, 1, 0,-46.85) '><g transform='matrix( 1, 0, 0, 1, 0,0) '><use xlink:href='#copie_Symbole_1_0_Layer0_0_FILL'/></g></g>",
	"<g transform='matrix( 1, 0, 0, 1, 0,-46.85) '><g transform='matrix( 1, 0, 0, 1, 0,0) '><use xlink:href='#Symbole_1_0_Layer0_0_1_STROKES'/></g>",
	"<g transform='matrix( 1, 0, 0, 1, 0,2.2) '><use xlink:href='#Symbole_1_0_Layer0_1_1_STROKES'/></g></g>",
	"<g transform='matrix( -1, 0, 0, 1, 0,-46.85) '><g transform='matrix( 1, 0, 0, 1, 0,0) '><use xlink:href='#Symbole_1_0_Layer0_0_1_STROKES'/></g>",
	"<g transform='matrix( 1, 0, 0, 1, 0,2.2) '><use xlink:href='#Symbole_1_0_Layer0_1_1_STROKES'/></g></g>",
	"</g></svg>"
	].join("\n");

	return txt;
}