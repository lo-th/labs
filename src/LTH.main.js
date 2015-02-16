/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var LTH = {};

LTH.CODES = ['full','serious','rot','liquidfun','ammo','oimo','crowd' ]

LTH.rubriques = [];
LTH.demoNames = [];
LTH.libsNames = [];
LTH.cRubr = -1;
LTH.cFile = 0;

var esprima = esprima || {};
esprima.parse = esprima.parse || {};
var CodeMirror = CodeMirror || {};
var GRAD = GRAD || {};
var history;
var main;

window.onload = init;

function init(){
	main = new LTH.Main();
}

function endTranscode(){
    main.menu.initHomeland(main.transcode.isWebGl);
}

//----------------------------------------
//
//    MAIN
//
//----------------------------------------

LTH.Main = function(){
	this.menuSize = 60;

	this.doc = document;
	this.doc.body.className = 'night';
	this.mainClass = 'night';
	this.doc.body.ondragover = function(e){return false;};
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

	this.transcode =null;
	this.menu = null;
	this.editor = null;
	this.editorVertex = null;
	this.editorFragment = null;
	this.preview = null;
	this.previewDoc = null;
	this.previewMain = null;

	this.happ = this.supports_history_api();

	this.fileSystem = new LTH.FileSystem(this);
	this.fileSystem.loadXML('menu.xml');
}

LTH.Main.prototype = {
	constructor: LTH.Main,
	init:function (){
		this.shader = new LTH.ShaderToy(this);
		this.editor = new LTH.CodeEditor(this);
		this.menu = new LTH.Menu(this);

		this.transcode = new LTH.Transcode(this, LTH.CODES, endTranscode, true);

	    window.onresize = function(e) {this.resize(e)}.bind(this);
	},
	initHome:function(){
		console.log('end');
		this.menu.initHomeland(this.transcode.isWebGl);
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
			else this.previewMain.v.colorBack(0x25292e);
		}
		this.preview.style.display = 'block';
	},
	previewClearFocus:function(){
		var allTags=this.previewDoc.getElementsByTagName('*'), i=0, e;
		while(e=allTags[i++]){ if(e.id) e.blur(); }
	},
	clearPreview:function(){
		if(this.preview !== null){
			this.previewDoc.open('text/html', 'replace');
		    this.previewDoc.write('');
		    this.previewDoc.close();
		    //console.log(this.previewDoc);
		    //this.preview.src = 'about:blank';
		    //this.previewDoc.innerHTML = '';
		    this.doc.getElementById( 'preview' ).setAttribute( 'src', '' );
			this.doc.body.removeChild(this.preview);
			
			this.previewDoc = null;
			this.previewMain = null;
			this.preview = null;

			console.clear();
		}
	},
	initPreview:function(){
		this.preview = this.doc.createElement( 'iframe' );
		this.preview.className = 'preview';
		this.preview.src = 'about:blank';
		this.preview.id = 'preview';
	    this.doc.body.appendChild(this.preview);
	},
	update:function(value) {
		
		if(value!==''){
			
			this.clearPreview();
			this.initPreview();

			var options, ops, i, myContent;

			if(this.transcode.useTrans){
				// extra libs
				options = '';
				ops = LTH.libsNames[LTH.cRubr][LTH.cFile];
				i = ops.length;
				while(i--) {if(ops[i]!=='')options+="<script src='js/libs/"+ops[i]+".min.js'></script>";}

		        myContent = [
				    "<!DOCTYPE html>",
					"<html lang='en'><head>",
					"<title>prev</title>",
					"<meta charset='utf-8'>",
					"<link rel='stylesheet' href='css/consolas.css'>",
					"<link rel='stylesheet' href='css/basic.css'>",
					"<script src='" + this.transcode.codes.full + "'></script>",
					options,
					"<script src='build/v3d.min.js'></script>",
					"</head><body class='"+this.mainClass+"'>",
					"<script>",
					"var canvas = document.createElement('canvas'); document.body.appendChild( canvas );",
					"var info = document.createElement('div'); document.body.appendChild( info ); info.className = 'info';",
					"var debug = document.createElement('div'); document.body.appendChild( debug ); debug.className = 'debug';",
					"var loader = document.createElement('div'); document.body.appendChild( loader ); loader.className = 'loader';",
					value,
					"</script>",
					"</body></html>"
				].join("\n");
			}else{
				// extra libs
				options = '';
				ops = LTH.libsNames[LTH.cRubr][LTH.cFile];
				i = ops.length;
				while(i--) {if(ops[i]!=='')options+="<script src='js/libs/"+ops[i]+".min.js'></script>";}

		        myContent = [
				    "<!DOCTYPE html>",
					"<html lang='en'>",
					"<head>",
					"<title>prev</title>",
					"<meta charset='utf-8'>",
					"<link rel='stylesheet' href='css/consolas.css'>",
					"<link rel='stylesheet' href='css/basic.css'>",
					"<script src='js/libs/three.min.js'></script>",
					"<script src='js/libs/three.post.js'></script>",
					"<script src='js/libs/sea3d.min.js'></script>",
					"<script src='js/libs/tween.min.js'></script>",
					"<script src='js/libs/gui.min.js'></script>",
					options,
					"<script src='build/v3d.min.js'></script>",
					"</head><body class='"+this.mainClass+"'>",
					"<script>",
					"var canvas = document.createElement('canvas'); document.body.appendChild( canvas );",
					"var info = document.createElement('div'); document.body.appendChild( info ); info.className = 'info';",
					"var debug = document.createElement('div'); document.body.appendChild( debug ); debug.className = 'debug';",
					"var loader = document.createElement('div'); document.body.appendChild( loader ); loader.className = 'loader';",
					value,
					"</script>",
					"</body></html>"
				].join("\n");
			}

			// extra libs
			/*options = '';
			ops = LTH.libsNames[LTH.cRubr][LTH.cFile];
			i = ops.length;
			while(i--) {if(ops[i]!=='')options+="<script src='js/libs/"+ops[i]+".min.js'></script>";}

	        var myContent = [
			    "<!DOCTYPE html>",
				"<html lang='en'>",
				"<head>",
				"<title>prev</title>",
				"<meta charset='utf-8'>",
				"<link rel='stylesheet' href='css/consolas.css'>",
				"<link rel='stylesheet' href='css/basic.css'>",
				"<script src='" + transcode.codes.full + "' type='text/javascript' charset='UTF-8'></script>",
				//"<script src='js/libs/three.min.js'></script>",
				//"<script src='js/libs/three.post.js'></script>",
				//"<script src='js/libs/sea3d.min.js'></script>",
				//"<script src='js/libs/tween.min.js'></script>",
				//"<script src='js/libs/gui.min.js'></script>",
				options,
				"<script src='build/v3d.min.js'></script>",
				"</head><body class='"+this.mainClass+"'>",
				"<script>",
				"var canvas = document.createElement('canvas'); document.body.appendChild( canvas );",
				"var info = document.createElement('div'); document.body.appendChild( info ); info.className = 'info';",
				"var debug = document.createElement('div'); document.body.appendChild( debug ); debug.className = 'debug';",
				"var loader = document.createElement('div'); document.body.appendChild( loader ); loader.className = 'loader';",
				value,
				"</script>",
				"</body></html>"
			].join("\n");*/

			//console.log(myContent)

			this.previewDoc = this.preview.contentDocument || this.preview.contentWindow.document;
			this.previewMain = this.preview.contentWindow;

			this.previewDoc.open('text/html', 'replace');
		    this.previewDoc.write(myContent);
		    this.previewDoc.close();
            //this.preview.style.display = 'block';

            //var myIFrame = document.getElementById('preview');
            

		    this.resize();
		    //this.previewMain.onload = function(){ this.previewTheme(); }.bind(this);
			if(this.isFirst) this.isFirst=false;
			else this.menu.modified();
		}
	},
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

// --------

LTH.Logos = function(color, blink){
	
	var eye = "<path id='Symbole_1_0_Layer0_1_1_STROKES' stroke='#"+color+"' stroke-width='3' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 19.85 53.5 Q 19.85 54.95 18.8 56 17.75 57.05 16.3 57.05 14.85 57.05 13.8 56 12.75 54.95 12.75 53.5 12.75 52.05 13.8 51 14.85 49.95 16.3 49.95 17.75 49.95 18.8 51 19.85 52.05 19.85 53.5 Z'/></defs>";
	if(blink) eye = "<path id='Symbole_1_0_Layer0_1_1_STROKES' stroke='#"+color+"' stroke-width='3' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 11.5 55.8L 21.55 55.8'/></defs>";
	var txt = [
	"<svg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='128px' height='128px' viewBox='0 0 128 128'><defs><g id='copie_Symbole_1_0_Layer0_0_FILL'>",
	"<path fill='#"+color+"' fill-opacity='0.3' stroke='none' d='M 23 37 L 19 37 Q 19 44.9 13.4 50.4 9.6001953125 54.26875 4.65 55.45 L 6.3 62.05 Q 10.253515625 60.838671875 13.55 57.95 12.75 56.9921875 12.75 55.7 12.75 54.25 13.8 53.2 14.85 52.15 16.3 52.15 17.3998046875 52.15 18.25 52.75 23 46.0076171875 23 37 M 7.05 44.05 Q 10 41.15 10 37 10 32.85 7.05 29.9 4.15 27 0 27 L 0 47 Q 1.2853515625 47 2.45 46.7 5.0482421875 46.086328125 7.05 44.05 M 0 0 L 0 10 Q 11.2 10 19.05 17.85 25.74296875 24.54296875 26.8 33.55 27 35.2291015625 27 37 27 43.170703125 24.55 48.3 27.7384765625 51.3177734375 27.2 54.05 26.15 58.85 23.6 60.65 18.55 64.05 16.25 70.75 13.5755859375 77.8880859375 16.05 83.6 18.7349609375 79.5951171875 20.85 73.95 23.15 67.25 28.2 63.85 30.75 62.05 31.8 57.25 34.75 42.3 31.85 27 31.8 26.85 31.8 26.75 30.75 16 22.25 7.9 13.65 -0.35 0 0 Z'/></g>",
	"<path id='Symbole_1_0_Layer0_0_1_STROKES' stroke='#"+color+"' stroke-width='3' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 0 93.75 Q 13.6 93.3 20.85 73.95 23.15 67.25 28.2 63.85 30.75 62.05 31.8 57.25 34.75 42.3 31.85 27 31.8 26.85 31.8 26.75 30.75 16 22.25 7.9 13.65 -0.35 0 0 M 38.65 29.45 Q 40.7 42.6 38.65 55.65 M 43.8 52.25 Q 44.95 42.55 43.8 32.85 46.95 42.55 43.8 52.25 Z M 33.45 27 Q 36.4 42.2 33.45 57.35'/>",
	eye,
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

LTH.IconMini = function(color, type){
	var width = 36;
	var Kwidth = '0 0 36 36';
	var t = [];
	t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='0 0 512 512' style='enable-background:new "+Kwidth+";'>";
	switch(type){
		case 0:
		t[1]="<path fill='#"+color+"' id='twitter' d='M256,50C142.229,50,50,142.229,50,256s92.229,206,206,206s206-92.229,206-206S369.771,50,256,50z M359.599,220.506c3.021,67.199-47.096,142.124-135.802,142.124c-26.981,0-52.096-7.911-73.238-21.466 c25.347,2.987,50.646-4.044,70.734-19.786c-20.907-0.386-38.554-14.198-44.632-33.181c7.486,1.432,14.851,1.013,21.575-0.816 c-22.976-4.617-38.839-25.317-38.321-47.453c6.44,3.58,13.81,5.729,21.642,5.977c-21.278-14.221-27.303-42.318-14.785-63.789 c23.563,28.906,58.77,47.928,98.478,49.92c-6.969-29.886,15.702-58.667,46.542-58.667c13.742,0,26.16,5.802,34.874,15.088 c10.884-2.143,21.108-6.119,30.341-11.594c-3.567,11.157-11.144,20.521-21.008,26.433c9.665-1.153,18.874-3.722,27.441-7.523 C377.035,205.355,368.935,213.771,359.599,220.506z'/></svg>";
		break;
		case 1:
		t[1]="<path fill='#"+color+"' id='github' d='M256,55.083c-113.764,0-206,92.237-206,206 c0,91.013,59.025,168.246,140.887,195.472c10.293,1.911,13.613-4.459,13.613-9.908v-38.356C147.199,420.764,135.262,384,135.262,384 c-9.354-23.822-22.865-30.159-22.865-30.159c-18.693-12.774,1.408-12.523,1.408-12.523c20.688,1.459,31.584,21.24,31.584,21.24 c18.373,31.483,48.18,22.381,59.949,17.117c1.844-13.312,7.174-22.397,13.076-27.544c-45.768-5.197-93.848-22.867-93.848-101.81 c0-22.498,8.047-40.872,21.225-55.289c-2.146-5.197-9.188-26.152,1.979-54.518c0,0,17.301-5.532,56.662,21.123 c16.445-4.56,34.066-6.856,51.568-6.94c17.502,0.084,35.154,2.381,51.6,6.94c39.33-26.655,56.596-21.123,56.596-21.123 c11.217,28.365,4.158,49.32,2.029,54.518c13.211,14.417,21.207,32.791,21.207,55.289c0,79.127-48.197,96.545-94.064,101.642 c7.375,6.388,14.133,18.943,14.133,38.155c0,27.561,0,49.757,0,56.529c0,5.482,3.301,11.903,13.746,9.892 C403.057,429.264,462,352.08,462,261.084C462,147.321,369.762,55.083,256,55.083z'/></svg>";
		break;
		case 4:
		t[1]="<path fill='#"+color+"' id='facebook' d='M256.417,50c-113.771,0-206,92.229-206,206s92.229,206,206,206s206-92.229,206-206 S370.188,50,256.417,50z M317.385,171.192c0,0-20.604,0-28.789,0c-10.162,0-12.28,4.163-12.28,14.678c0,8.75,0,25.404,0,25.404 h41.069l-3.951,44.596h-37.118v133.227h-53.2V256.435h-27.666v-45.16h27.666c0,0,0-6.493,0-35.565 c0-33.379,17.849-50.807,57.437-50.807c6.484,0,36.833,0,36.833,0V171.192z'/></svg>";
		break;
		case 2:
		t[1]="<path fill='#"+color+"' id='googleplus' d='M273.369,331.659c0,20.247-16.443,36.065-50.481,36.065c-26.625,0-45.852-16.854-45.852-37.1 c0-19.84,22.562-36.957,49.186-36.664C255.762,293.961,273.369,312.358,273.369,331.659z M462.417,257c0,113.771-92.229,206-206,206 s-206-92.229-206-206s92.229-206,206-206S462.417,143.229,462.417,257z M296.303,329.305c0-18.691-6.979-30.903-28.096-46.725 c-21.417-15.619-26.65-24.443-6.208-40.248c11.519-8.906,19.591-20.778,19.591-35.436c0-15.969-6.53-30.457-18.809-37.492h17.404 l14.816-15.551c0,0-55.854,0-66.303,0c-41.39,0-61.685,24.809-61.685,52.098c0,27.889,19.132,49.854,56.492,49.854 c-5.792,11.693-3.466,22.494,6.011,30.217c-63.807,0-77.461,27.998-77.461,49.566c0,27.945,32.123,44.559,70.643,44.559 C275.367,380.146,296.303,352.234,296.303,329.305z M382.776,187.5h-30.589v-30.588h-15.293V187.5h-30.589v15.294h30.589v30.588 h15.293v-30.588h30.589V187.5z M254.949,207.894c-3.083-23.466-18.371-42.719-36.234-43.256 c-17.869-0.532-29.854,17.427-26.767,40.899c3.085,23.467,20.067,39.859,37.939,40.398 C247.75,246.467,258.031,231.363,254.949,207.894z'/></svg>";
		break;
		case 3:
		t[1]="<path fill='#"+color+"' id='linkedin' d='M256.417,50c-113.771,0-206,92.229-206,206s92.229,206,206,206s206-92.229,206-206 S370.188,50,256.417,50z M201.456,355.592h-45.229V209.469h45.229V355.592z M178.626,190.333c-14.771,0-26.746-12.072-26.746-26.963 s11.975-26.963,26.746-26.963c14.77,0,26.745,12.072,26.745,26.963S193.396,190.333,178.626,190.333z M370.953,355.592h-45.01 c0,0,0-55.666,0-76.703s-7.991-32.781-24.626-32.781c-18.103,0-27.562,12.231-27.562,32.781c0,22.504,0,76.703,0,76.703h-43.38 V209.469h43.38v19.679c0,0,13.047-24.137,44.032-24.137c30.986,0,53.165,18.918,53.165,58.058 C370.953,302.209,370.953,355.592,370.953,355.592z'/></svg>";
		break;
	}
	return t.join("\n");
}