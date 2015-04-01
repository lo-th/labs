/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

LTH.FileSystem = function(main){
	this.main = main;
}

LTH.FileSystem.prototype = {
	constructor: LTH.FileSystem,
	loadXML:function(url){
		var xhr = new XMLHttpRequest();
		//if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    //if (window.ActiveXObject){ xhr = new ActiveXObject("Microsoft.XMLHTTP"); isIE = true;}// IE
	    //else xhr = new XMLHttpRequest();
	    xhr.onload = function(e) {
	    	var xmlDoc = xhr.responseXML;
	    	var r = xmlDoc.getElementsByTagName("rubrique");
	    	var a, b, g, h;
	    	var rubName, rubColor;
	    	var demoName, demoLib, demoIcon, demoBranch;
	    	for(var i=0;i<r.length;i++){
	    		a = r[i];
	    		h  = a.attributes.length;
	    		while(h--){
    				if( a.attributes[h].name==='n') rubName = a.attributes[h].value;
    				if( a.attributes[h].name==='color') rubColor = a.attributes[h].value;
    			}
	    		LTH.rubriques[i] = rubName;
	    		LTH.ARCS[LTH.rubriques[i]] = {color:'#'+rubColor, demos:[], icon:[], branch:[] }
	    		LTH.demoNames[i] = [];
	    		LTH.libsNames[i] = [];
	    		b = a.getElementsByTagName("demo");
	    		for(var j=0;j<b.length;j++){
	    			g  = b[j].attributes.length;
	    			while(g--){
	    				if( b[j].attributes[g].name==='n') demoName = b[j].attributes[g].value;
	    				if( b[j].attributes[g].name==='lib') demoLib = b[j].attributes[g].value;
	    				if( b[j].attributes[g].name==='ic') demoIcon = b[j].attributes[g].value;
	    				if( b[j].attributes[g].name==='b') demoBranch = b[j].attributes[g].value;
	    				else demoBranch = 0;
	    			}
	    			LTH.demoNames[i][j] = demoName;
	    			LTH.ARCS[LTH.rubriques[i]].demos[j] = demoName;
	    			LTH.ARCS[LTH.rubriques[i]].icon[j] = demoIcon*1;
	    			LTH.ARCS[LTH.rubriques[i]].branch[j] = demoBranch*1;
	    			LTH.libsNames[i][j] = demoLib.split("|").map(function(k){return k;});
	    		}
	    	}
	    	this.main.init();
	    }.bind(this);
	    xhr.open('GET', url, true);
		xhr.send();
	},
	load:function(url){
		var type = url.substring(url.lastIndexOf(".")+1, url.length);
		var name = url.substring(url.lastIndexOf("/")+1, url.lastIndexOf(".") );
		var xhr = new XMLHttpRequest();
		//if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    //else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");// IE
		xhr.onload = function(e) {
			this.process( name, xhr.responseText );
		}.bind(this);
		xhr.open('GET', url, true);
		xhr.send();
	},
	open:function(o){
		var name = o.name;
		var reader = new FileReader();
		var _this = this;
        reader.onload = function(e) {
        	_this.process( name, e.target.result );
        }
        reader.readAsText(o.file);
	},
	save:function() {
		var type = 'application/text/javascript;charset=utf-8';
		var ex = '.js';
		var blob = new Blob( [ this.main.editor.get() ], { type: type } );
		this.main.createLink(blob, this.main.editor.currentName+ex, type);
	},
	process:function(name, result){
	    this.main.editor.editor.setValue(result);
	    this.main.editor.currentName = name;
    	
	}
}