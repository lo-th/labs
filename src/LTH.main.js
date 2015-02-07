/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var LTH = {};

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

function init(){ main = new LTH.Main(); }

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
			this.doc.body.removeChild(this.preview);
			this.preview = null;
			this.previewDoc = null;
			this.previewMain = null;
			
			console.clear();
		}
	},
	initPreview:function(){
		this.preview = this.doc.createElement( 'iframe' );
		this.preview.className = 'preview';
		this.preview.src = 'about:blank';
	    this.doc.body.appendChild(this.preview);
	},
	update:function(value) {
		
		if(value!==''){
			
			this.clearPreview();
			this.initPreview();

			// extra libs
			var options = '';
			var ops = LTH.libsNames[LTH.cRubr][LTH.cFile];
			var i = ops.length;
			while(i--) {if(ops[i]!=='')options+="<script src='js/libs/"+ops[i]+".min.js'></script>";}

	        var myContent = [
			    "<!DOCTYPE html>",
				"<html lang='en'>",
				"<head>",
				"<title>prev</title>",
				"<meta charset='utf-8'>",
				"<link rel='stylesheet' href='css/consolas.css'>",
				"<link rel='stylesheet' href='css/basic.css'>",
				"<script src='js/libs/three.min.js'></script>",
				//"<script src='js/libs/three.js'></script>";
				"<script src='js/libs/three.post.js'></script>",
				options,
				"<script src='build/v3d.min.js'></script>",
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
            //this.preview.style.display = 'block';

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