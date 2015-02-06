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
		var xhr;
		if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");// IE
	    xhr.onload = function(e) {
	    	var xmlDoc = xhr.responseXML;
	    	var r = xmlDoc.getElementsByTagName("rubrique");
	    	var a, b;
	    	for(var i=0;i<r.length;i++){
	    		a = r[i];
	    		LTH.rubriques[i] = a.attributes[0].value;
	    		LTH.demoNames[i] = [];
	    		LTH.libsNames[i] = [];
	    		b = a.getElementsByTagName("demo");
	    		for(var j=0;j<b.length;j++){
	    			LTH.demoNames[i][j] = b[j].attributes[0].value;
	    			LTH.libsNames[i][j] = b[j].attributes[1].value.split("|").map(function(n){return n;});
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
		var xhr;
		if (window.XMLHttpRequest) xhr = new XMLHttpRequest();// Mozilla/Safari
	    else if (window.ActiveXObject) xhr = new ActiveXObject("Microsoft.XMLHTTP");// IE
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