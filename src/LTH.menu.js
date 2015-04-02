/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

LTH.logoTimer = null;

LTH.Menu = function(main){
	this.baseColor = "d2cec8";
	this.baseColorOver = "FF0073";
	this.main = main;
	this.doc = document;



	//this.logoTimer = null;

	this.content = this.doc.createElement('div');
	this.content.className = 'menu';
	this.doc.body.appendChild( this.content );

	this.rubriques = [];
	this.icons = [];
	this.files = [];
	this.buttons = [];

	//this.currentFile = -1;
	this.inModif =  -1;
	this.colorSelect = '#d2cec8';
	this.colorModif = '#FF0073';
	this.colorOver = 'rgba(255,255,255,0.3)';
	this.currentLink = null;
	this.zone = null;
	this.logo = null;
	this.logoBack = null;

	this.isMenu = false;
	this.isHome = false;

	this.home = null;
	this.leftMenu = null;
	this.topColor = null;

	this.initLogo();

	/*if(this.main.transcode.isWebGl){
		this.initLogo(true);
		this.initHome();
	}else{
		this.initLogo(false);
	}*/


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
		this.content.appendChild( this.main.labmenu.content );

		this.logoBack = this.doc.createElement('div');
		this.logoBack.className = 'logo';
		this.logoBack.style.pointerEvents = 'none';
		this.logoBack.innerHTML = LTH.LogosBack();

		this.logo = this.doc.createElement('div');
		this.logo.className = 'logo';
		this.logo.innerHTML = LTH.Logos(this.baseColor);
		this.title = this.doc.createElement('div');

		this.content.appendChild( this.logoBack );
		this.content.appendChild( this.logo );
		
		this.title.className = 'title';
		this.content.appendChild( this.title );
		this.title.innerHTML = 'WELCOME<br>LOADING CODES';
		this.miniLogos();
	},
	changeBackLogoColor:function(color){
		this.logoBack.innerHTML = LTH.LogosBack(color);
	},
	initHomeland:function(isOK){
		if(isOK){
			this.initHome();
			this.title.innerHTML = 'LOTH LABS';
			this.title.style.height = '20px';
			this.title.style.marginTop = '-66px';
			this.logo.onmousedown = function(e){ this.initHome(e); }.bind(this);
			this.logo.onmouseover = function(e){ if(!this.isHome) this.title.innerHTML = 'BACK HOME'; }.bind(this);
			this.logo.onmouseout = function(e){ if(!this.isHome) this.title.innerHTML = LTH.rubriques[LTH.cRubr].toUpperCase(); }.bind(this);
		} else {
			this.title.innerHTML = 'SORRY, YOU NEED<br>WEBGL BROWSER';
		}
	},
	miniLogos:function(){
		this.micrologo = this.doc.createElement('div');
		this.micrologo.className = 'minilogoOut';
		this.content.appendChild( this.micrologo );
		this.iconsOut = [];
		var i = 4;
		while(i--){
			this.iconsOut[i] = this.doc.createElement('div');
			this.iconsOut[i].className = 'mmmlogo';
			this.iconsOut[i].name = i;
			var iner = document.createElement('div');
			iner.style.cssText = 'position:relative; left:0px; top:0px; width:36px; height:36px; pointer-events:none;';
			this.iconsOut[i].appendChild( iner );
			iner.innerHTML = LTH.IconMini(this.baseColor, i);
			//this.iconsOut[i].type="button";
			this.iconsOut[i].onclick = function(e){ this.openLink(e.target.name) }.bind(this);
			this.iconsOut[i].onmouseover = function(e){ 
				var child = this.iconsOut[e.target.name].childNodes;
				child[0].innerHTML = LTH.IconMini(this.baseColorOver, e.target.name); 
			}.bind(this);
			this.iconsOut[i].onmouseout = function(e){ 
				var child = this.iconsOut[e.target.name].childNodes;
				child[0].innerHTML = LTH.IconMini(this.baseColor, e.target.name);
			}.bind(this);
			this.micrologo.appendChild( this.iconsOut[i] );
		}
		//this.micrologo.style.display = 'none';
	},
	redrawMini:function(){
		var i = 4;
		while(i--){
			this.iconsOut[i].childNodes[0].innerHTML = LTH.IconMini(this.baseColor, i);
		}
	},
	openLink:function(n){
		var url;
		switch(n){
			case 0: url = 'https://twitter.com/3dflashlo'; break;
			case 1: url = 'https://github.com/lo-th'; break;
			case 2: url = 'https://plus.google.com/u/0/114170447432405103307'; break;
			case 3: url = 'https://www.linkedin.com/pub/lo-th/27/202/b3/en'; break;
			case 4: url = 'https://www.facebook.com/laurent.thillet'; break;
		}
		var win = window.open(url, '_blank');
		win.focus();
	},
	stopBlink:function(){
		clearTimeout(LTH.logoTimer);
		this.logo.innerHTML = LTH.Logos(this.baseColor);
	},
	blinkOpen:function(t){
	    t.logo.innerHTML = LTH.Logos(t.baseColor, false);
	    LTH.logoTimer = setTimeout(t.blinkClose, 3000, t);
	},
	blinkClose:function(t){
		t.logo.innerHTML = LTH.Logos(t.baseColor, true); 
		LTH.logoTimer = setTimeout( t.blinkOpen, 150, t);
	},
	initHome:function(){
		this.doc.body.onmousemove = function(e){return false;};
		this.logo.className = 'logo';
		this.logoBack.className = 'logo';

		this.content.className = 'menu home';
		this.title.style.top = '50%';

		this.blinkOpen(this);

		this.micrologo.style.display = 'block';

		this.main.shader.clear();

		if(this.isMenu) this.resetMenu();
		if(this.isHome) return;
		LTH.cRubr = -1;
		LTH.cFile = -1;
		this.title.innerHTML = 'LOTH LABS';

		this.main.labmenu.init();
		this.isHome = true;
	},
	resetHome:function(r, n){
		this.stopBlink();
		this.micrologo.style.display = 'none';

		LTH.cRubr = r;
		LTH.cFile = n;

		this.clearDiv(this.main.labmenu.content);
		this.isHome = false;
		this.initMenu();
		
		if(this.main.happ){
		    if(this.main.useDirect) history.pushState(null, null, 'indexdev.html');
		    else history.pushState(null, null, 'index.html');
		}
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
		//this.content.removeChild(this.topColor);
		this.icons = [];
		this.files = [];
		this.buttons = [];
		this.isMenu = false;
	},
	initMenu:function(){
		this.doc.body.onmousemove = function(e){this.showHideMenu(e)}.bind(this);
		this.content.className = 'menu exemple';
		this.logo.className = 'logo lmin';
		this.logoBack.className = 'logo lmin';

		var mode = 'basic';
		if(LTH.rubriques[LTH.cRubr] === "shaders") mode = 'shader';

		this.main.switchMode(mode);
		this.main.resize();

		this.title.innerHTML = '';
		this.title.style.top = '200px';

		this.initButton();
		this.initZone();
		var name;
		var curr = LTH.demoNames[LTH.cRubr];
		var lng = curr.length;
		for(var i=0; i<lng; i++){
			name = curr[i]+'.js';
			this.pushFile(name);
		}

		this.main.loadFile('demos/'+LTH.rubriques[LTH.cRubr]+'/'+this.files[LTH.cFile]);
	    this.resetIcon();
	    
	    this.isMenu = true;
	},
	clearDiv:function(node){
		while(node.firstChild) { node.removeChild(node.firstChild); }
	},
	initZone:function(){
		this.zone = this.doc.createElement('div');
		this.zone.className = 'zone';
		this.content.appendChild( this.zone );
		var _this = this;
		this.zone.ondragover = function(e){_this.zoneDragOver(e)};
	    this.zone.ondragend = function(e){_this.zoneDragEnd(e)};
	    this.zone.ondrop = function(e){_this.zoneDrop(e)};
	},
	initButton:function(){
		/*this.topColor = this.doc.createElement('div');
		this.topColor.className = 'topColor';
		this.topColor.style.background = this.main.labmenu.colors[LTH.cRubr];
		this.content.appendChild( this.topColor );*/
		

		this.leftMenu = this.doc.createElement('div');
		this.leftMenu.className = 'bottomLeftMenu';
		this.content.appendChild( this.leftMenu );

		var b;
		for(var i=0; i<5; i++){
			b = this.doc.createElement('div');
			b.className = 'b';
			if(i>1)b.style.display = "none";
			this.leftMenu.appendChild(b);
			this.buttons[i] = b;
		}
		this.buttons[0].innerHTML = 'N';
		this.buttons[1].innerHTML = 'C';
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
		this.redrawMini();
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
		this.baseColor = "25292e";
		this.main.labmenu.baseColor = "25292e";
		this.main.labmenu.topColor = "d2cec8";
		this.logo.innerHTML = LTH.Logos(this.baseColor);
		this.main.day = true;
		this.main.mainClass = 'day';
		this.doc.body.className = 'day';
		
		this.colorSelect = '#25292e';
		this.colorOver = 'rgba(0,0,0,0.3)';
	},
	isNight:function (){
		//this.img2.src = './images/logo.gif';
		this.baseColor = "d2cec8";
		this.main.labmenu.baseColor = "d2cec8";
		this.main.labmenu.topColor = "25292e";
		this.logo.innerHTML = LTH.Logos(this.baseColor);
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
	                console.log('dir', e.dataTransfer.items[i].getAsFile(), entry.fullPath);
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
		// don't add if same file
		var i = this.files.length;
		while(i--){ if(name == this.files[i]) return; }

	    var id = this.icons.length;
	    var ic = document.createElement('div');
	    ic.className = 'ic';
	    //ic.style.cssText = 'display:block; width:180px; height:30px; background-color:rgba(0,0,0,0); cursor:pointer; pointer-events:auto;';
	    var iner = document.createElement('div');
	    iner.style.cssText = 'position:relative; left:10px; top:5px; width:18px; height:18px; pointer-events:none; background-color: none; border:2px solid rgba(0,0,0,0);  border-radius:20px; pointer-events:none;';
	    var title = document.createElement('div');
	    //title.style.cssText = 'position:relative; left:30px; top:-12px; width:calc(100% - 40px); height:20px; pointer-events:none; text-align:right;';
	    title.style.cssText = 'position:relative; left:5px; top:-12px; width:148px; height:20px; pointer-events:none; text-align:right; pointer-events:none;';
	    var img = document.createElement('div');
	    img.style.cssText = 'position:relative; left:15px; top:-28px; width:8px; height:8px; pointer-events:none; background-color: '+this.colorSelect+';  border-radius:20px;';
	    title.innerHTML = name.substr(0, name.lastIndexOf("."));
	    ic.appendChild( iner );
	    ic.appendChild( title );
	    ic.appendChild( img );
	    this.zone.appendChild( ic );
	    ic.name = id;
	    ic.onclick =  function(e){this.openFile(e)}.bind(this);;
	    ic.ondblclick =  function(e){this.openFile(e)}.bind(this);
	    ic.onmouseover =  function(e){this.iconOver(e)}.bind(this);
	    ic.onmouseout =  function(e){this.unselected(e)}.bind(this);
	    ic.onmouseup =  function(e){this.unselected(e)}.bind(this);
	    ic.ondragstart = function(e){this.dragstart(e)}.bind(this);
	    ic.ondragend = function(e){this.dragend(e)}.bind(this);
	    
	    this.icons[id]=ic;
	    this.files[id]=name;
	},
	iconOver:function (e){
		e.target.className = 'ic icover';
	    var id = e.target.name;
	    if(id!==LTH.cFile){
		    var child = this.icons[id].childNodes;
		    child[0].style.border ='2px solid ' + this.colorOver;
		}
		e.preventDefault();
	},
	unselected:function (e){
		e.target.className = 'ic icout';
	    var id = e.target.name;
	    if(id!==LTH.cFile){
		    var child = this.icons[id].childNodes;
		    child[0].style.border ='2px solid rgba(0,0,0,0)';
		}
		e.preventDefault();
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
		if (this.currentLink!==null) {  e.dataTransfer.setData('DownloadURL', this.currentLink.dataset.downloadurl ); }
	},
	dragend:function (e){
		this.resetModified();
	},
	openFile:function (e){
	    e.preventDefault();
	    var id = e.target.name;
	    if(LTH.cFile!==id){
	    	LTH.cFile = id;
	    	this.resetModified();
	        //this.currentFile = id;
	    	this.main.loadFile('demos/'+LTH.rubriques[LTH.cRubr]+'/'+this.files[id]);
	    	this.resetIcon();
	    }
	},
	resetIcon:function (plus){
		var i = this.icons.length, child;
		while(i--){
			child = this.icons[i].childNodes;
		    if(i==LTH.cFile){
		    	if(i==this.inModif) child[0].style.border ='2px solid '+ this.colorModif;
		    	else child[0].style.border ='2px solid '+ this.colorSelect;
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
		this.inModif = LTH.cFile;
		var child = this.icons[LTH.cFile].childNodes;
		this.icons[LTH.cFile].draggable = true;
		this.icons[LTH.cFile].classList.add('dragout');
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
			if(i==LTH.cFile) child[0].style.border ='1px solid '+this.colorSelect;
		    child[1].style.color = this.colorSelect;
		    child[2].style.backgroundColor = this.colorSelect;
		}
		if (this.currentLink){
		    window.URL.revokeObjectURL(this.currentLink.href);
		    this.currentLink=null;
		}
	},
	showHideMenu:function(e){
		var c = this.content.className;
		var x = e.clientX;
		if(x>170){
			if(c==='menu exemple In'){
				this.content.className = 'menu exemple Out';
				this.logo.className = 'logo lmin';
				this.logoBack.className = 'logo lmin';
				this.title.innerHTML = '';
		    }
		}
		if(x<60){
			if(c==='menu exemple' || c==='menu exemple Out'){ 
				this.content.className = 'menu exemple In';
				this.logo.className = 'logo lmax';
				this.logoBack.className = 'logo lmax';
				this.title.innerHTML = LTH.rubriques[LTH.cRubr].toUpperCase();
			}
		}
	}
}