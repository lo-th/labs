/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

LTH.labsMenu = function(main){
	//this.t = [90,10,25,70,45, 13];
	this.t = [90,20,20,60,40, 13]
	this.inc = 0.07;//0.1;
	
	this.main = main;
	this.baseColor = 'd2cec8';
	this.topColor= '25292e';
	this.current = null;
	this.size = 800;
	this.decal = 1;
	this.rdecal = -30;
	this.center = this.size*0.5;
	this.radius = 10;
	this.endRadius = 90;//110;
	this.line = 1;
	this.content = document.createElement('div');
	//this.main.menu.content.appendChild( this.content );
	this.content.className = 'labsMenu';

	this.pins = [];
	this.angles = [];
	this.anglesEnd = [];
	this.anglesStart = [];
	this.colors = [];
	this.nDemos = [];
	this.demosNames = [];
	this.demosIcones = [];
	this.rubNames = [];
	this.points = [];

	this.nRubriques = 0;
	this.isComputed = false;

	this.arcs = LTH.ARCS;

}

LTH.labsMenu.prototype = {
	constructor: LTH.labsMenu,
	init:function (){

		this.title = document.createElement('div');
	    this.title.className = 'labsTitle';
	    this.content.appendChild( this.title );
	    this.title.style.color = '#'+this.topColor;

	    this.subTitle = document.createElement('div');
	    this.subTitle.className = 'labsSubTitle';
	    this.content.appendChild( this.subTitle );
	    this.subTitle.style.color = '#'+this.baseColor;

	    this.press = document.createElement('div');
	    this.press.className = 'press';
	    this.content.appendChild( this.press );
	    this.press.innerHTML = "I'm loth french free-lance. Developer webgl, graphic and modeler 3d.<br>Contact me for any work at <a HREF='mailto:3dflashlo@gmail.com'>3dflashlo@gmail.com</a>"

		this.canvas = document.createElement('canvas');
		this.canvas.className = 'labsCanvas';
		this.content.appendChild( this.canvas );

		this.pinsContent = document.createElement('div');
	    this.pinsContent.className = 'pinsContent';
	    this.content.appendChild( this.pinsContent );

	    this.puce = document.createElement('div');
	    this.puce.className = 'puce';
	    this.puce.innerHTML = LTH.IconPuce(this.topColor);
	    this.pinsContent.appendChild( this.puce );

		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.canvas.height = this.size;

		if(!this.isComputed) this.compute();

		this.time = 10;
		this.radius = 10;
		this.line = 1;
		this.update();
	},
	reset:function(){

	},
	update:function(){
		if(this.radius==this.endRadius){
			clearTimeout(this.anim);
			this.activeMouse();
			this.draw(true);
		}else {
			this.draw();
			this.time -=0.2;
			this.anim = setTimeout(function(e){this.update()}.bind(this), this.time);
		}
		this.radius++;
		this.line+=this.inc;//2;
	},
	activeMouse:function(){
		this.content.onmousemove = function(e){this.mouseMove(e)}.bind(this);
	},
	mouseMove:function(e){
		if(!this.main.menu.isHome) return;
		var x = e.clientX - (window.innerWidth*0.5);
		var y = e.clientY - (window.innerHeight*0.5);
		var angle = Math.atan2(x, -y );
		var angleDeg = Math.round( angle*(180/Math.PI));
		if(angleDeg<0) angleDeg += 360;
		angleDeg+=(this.rdecal);
		var distance = Math.round( Math.sqrt( x * x + y * y ));

		if(distance>this.radius-50){
			this.findRubrique(angleDeg);
			if(this.current!==null){
				this.title.style.background = this.arcs[this.current].color;
			    this.title.innerHTML = (this.current.replace("-", " ")).toUpperCase();

			    this.main.menu.changeBackLogoColor(this.arcs[this.current].color);
			}
		} else {
			this.current = null;
			this.title.style.background = '#'+this.topColor;
			this.subTitle.innerHTML = '';
		}

	},
	findRubrique:function(angle){
		var i=this.nRubriques;
		while(i--){
			if(angle<this.anglesEnd[i] && angle>this.anglesStart[i]) this.current = this.rubNames[i];
		}
	},
	compute:function(){
		var i = 0, c, ndemo=0;
		for(var key in this.arcs){
			c = this.arcs[key];
			this.colors[i] = c.color;
			this.demosNames[i] = c.demos;
			this.demosIcones[i] = c.icon;
			this.nDemos[i] = c.demos.length;
			ndemo += this.nDemos[i];
			i++;
		}

		var nangle = 360/ndemo;
		var prec = 0; 
		var prev = 0;
		i=0;
		for(var key in this.arcs){
			c = this.arcs[key];
			prec = this.nDemos[i]*nangle;

			this.rubNames[i] = key;
			this.anglesStart[i] = (prev)+this.decal+this.rdecal;
			this.anglesEnd[i] = (prev+prec)-this.decal+this.rdecal;

			var angle = (this.anglesStart[i]+(this.anglesEnd[i]-this.anglesStart[i])*0.5)-60;
			this.angles[i] = angle;
			this.points[i] = this.findPoint(angle);
			prev += prec;
			i++;
		}
		this.nRubriques = i;
		this.isComputed = true;
	},
	findPoint:function(angle){
		var a = angle*LTH.ToRad;
		var a2 = (angle+this.t[5])*LTH.ToRad;
		var a3 = (angle-this.t[5])*LTH.ToRad;
		var point, dist = this.t[0];
		var r = this.endRadius-this.t[1];
		var p = [];
		for(var i=0; i<13; i++){
			if(i==0) point = this.radialPos(a,r+this.t[2]);
			else if(i==1) point = this.radialPos(a,r+this.t[3]);
			else {
				if((i & 1)==1){ point = this.radialPos(a3,r+dist); dist += this.t[4]; } // impaire
				else point = this.radialPos(a2,r+dist);
			}
			p.push(point);
		}
		return p;
	},
	radialPos:function(angle, distance){
		return {x:(Math.cos(angle)*(distance))+ this.center, y:(Math.sin(angle)*(distance))+ this.center}
	},
	draw:function(isEnd){
		this.ctx.clearRect ( 0, 0, this.size, this.size );
		var i=this.nRubriques;
		while(i--){
			this.ctx.strokeStyle = this.colors[i];
			this.ctx.beginPath();
			this.ctx.arc(this.center, this.center, this.radius, (this.anglesStart[i]-60)*LTH.ToRad,(this.anglesEnd[i]-60)*LTH.ToRad, false);
			this.ctx.lineWidth = this.line;
			this.ctx.stroke();
		}
		if(isEnd)this.placesPins();
	},
	placesPins:function(){
		this.prevPins = [];
		this.startPins = 0;
		this.endPins = 13;
		this.time = 100;
		this.anim = setTimeout(function(e){this.updatePins()}.bind(this), this.time);
	},
	updatePins:function(){
		var i = this.nRubriques;
		
		var p, d, c, j;
		if(this.startPins==this.endPins){
			clearTimeout(this.anim);
		}else {
			// show icon
			j = this.prevPins.length;
			while(j--){
				this.prevPins[j].style.display = 'block';
			}
			// anime prev pins
			j = this.pins.length;
			while(j--){
				this.pins[j].className = 'pins pinson';
				this.prevPins[j] = this.pins[j].childNodes[0];
			}
			while(i--){
				p = this.points[i];
				d = this.nDemos[i];
				c =  this.colors[i];

				if(this.startPins<d){
					this.liner(p, c, this.startPins);
					this.addPins(p[this.startPins+1].x, p[this.startPins+1].y,c, this.startPins, i);
				}
			}
			this.startPins++;
			this.anim = setTimeout(function(e){this.updatePins()}.bind(this), this.time);
		}
	},
	liner:function(p, c, i){
		var p1, p2;
		switch(i){
			case 0: p1 = p[0]; p2 = p[1]; break;
			case 1: p1 = p[1]; p2 = p[2]; break;
			case 2: p1 = p[1]; p2 = p[3]; break;
			case 3: p1 = p[2]; p2 = p[4]; break;
			case 4: p1 = p[3]; p2 = p[5]; break;
			case 5: p1 = p[4]; p2 = p[6]; break;
			case 6: p1 = p[5]; p2 = p[7]; break;
			case 7: p1 = p[6]; p2 = p[8]; break;
			case 8: p1 = p[7]; p2 = p[9]; break;
			case 9: p1 = p[8]; p2 = p[10]; break;
			case 10: p1 = p[9]; p2 = p[12]; break;
			case 11: p1 = p[10]; p2 = p[13]; break;
		}
		this.ctx.strokeStyle = c;
		this.ctx.beginPath();
		this.ctx.moveTo(p1.x, p1.y);
		this.ctx.lineTo(p2.x, p2.y);
		this.ctx.lineWidth = 2;
		this.ctx.stroke();
	},
	addPins:function(x,y,color,n,r){
		var id = this.pins.length;
		var pn = document.createElement('div');
		pn.className = 'pins';
		pn.style.left = x +'px';
		pn.style.top = y +'px';
	    pn.style.background = color;
	    pn.name = r +'_' + n;

	    var iner = document.createElement('div');
	    iner.className = 'pinsin';

	    iner.innerHTML = LTH.IconMicro(this.topColor, this.demosIcones[r][n]);
	    pn.appendChild( iner );
	    
	    this.pins[id] = pn;
	    this.pins[id].onclick = function(e){ 
	    	this.puce.className = 'puce phide';
	    	var r = e.target.name.substring(0,1)*1;
	    	var n = e.target.name.substring(2,e.target.name.length)*1;
	    	this.main.menu.resetHome(r, n);
	    }.bind(this);
	    this.pins[id].onmouseover = function(e){ 
	    	this.puce.className = 'puce rotating';
	    	e.target.style.background = '#'+this.baseColor;
	    	this.puce.style.left = (e.target.offsetLeft+15)+'px';
	    	this.puce.style.top = (e.target.offsetTop+15)+'px';
	    	
	    	var r = e.target.name.substring(0,1)*1;
	    	var n = e.target.name.substring(2,e.target.name.length)*1;
	    	this.subTitle.innerHTML = (this.demosNames[r][n].replace("_", " ")).toUpperCase();
	    }.bind(this);
		this.pins[id].onmouseout = function(e){ 
			this.puce.className = 'puce phide';
			e.target.style.background = color;
			this.subTitle.innerHTML = ''
		}.bind(this);
		this.pinsContent.appendChild( this.pins[id] );
	}
}





LTH.IconMicro = function(color, type){
	var width = 30;
	var Kwidth = '0 0 30 30';
	var t = [];
	t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='"+Kwidth+"';'><g>";
	switch(type){
		case 0: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 1: t[1]="<path fill='#"+color+"' d='M 26 16 L 26 14 22 14 22 10 20 8 16 8 16 4 14 4 14 8 10 8 8 10 8 14 4 14 4 16 8 16 8 20 10 22 14 22 14 26 16 26 16 22 20 22 22 20 22 16 26 16 M 19 10 L 20 11 20 19 19 20 11 20 10 19 10 11 11 10 19 10 Z'/>";break;
		case 2: t[1]="<path fill='#"+color+"' d='M 23 20 L 22 20 22 12 19 12 19 10 18 10 18 12 16 12 16 19 18 19 18 14 20 14 20 22 23 22 23 20 M 7 22 L 10 22 10 10 12 10 12 19 14 19 14 8 8 8 8 20 7 20 7 22 Z'/>";break;
		case 3: t[1]="<path fill='#"+color+"' d='M 21 8 L 21 10 19 12 18 11 12 11 11 12 9 10 9 8 10 7 9 6 6 9 6 13 8 15 7 16 7 20 8 21 14 21 14 24 16 24 16 21 22 21 23 20 23 16 22 15 24 13 24 9 21 6 20 7 21 8 M 23 10 L 23 12 21 14 20 13 22 11 22 9 23 10 M 21 17 L 21 19 9 19 9 17 13 13 17 13 21 17 M 8 9 L 8 11 10 13 9 14 7 12 7 10 8 9 Z'/>";break;
		case 4: t[1]="<path fill='#"+color+"' d='M 26 16 L 26 14 16 4 14 4 4 14 4 16 14 26 16 26 26 16 M 6 15 L 15 6 24 15 15 24 6 15 M 16 10 L 14 10 14 16 16 16 16 10 M 16 18 L 14 18 14 20 16 20 16 18 Z'/>";break;
		case 5: t[1]="<path fill='#"+color+"' d='M 21.35 21.35 Q 24 18.75 24 15 24 11.25 21.35 8.6 18.75 6 15 6 11.25 6 8.6 8.6 6 11.25 6 15 6 18.75 8.6 21.35 11.25 24 15 24 18.75 24 21.35 21.35 M 14.95 7.95 Q 17.9 7.95 19.9 10 21.95 12.05 21.95 14.95 21.95 17.9 19.9 19.9 17.9 21.95 14.95 21.95 12.05 21.95 10 19.9 7.95 17.9 7.95 14.95 7.95 12.05 10 10 12.05 7.95 14.95 7.95 M 20 17 Q 20 15.75 19.1 14.85 18.25 14 17 14 15.75 14 14.85 14.85 14 15.75 14 17 14 18.25 14.85 19.1 15.75 20 17 20 18.25 20 19.1 19.1 20 18.25 20 17 M 17 16 Q 17.4 16 17.7 16.3 18 16.6 18 17 18 17.4 17.7 17.7 17.4 18 17 18 16.6 18 16.3 17.7 16 17.4 16 17 16 16.6 16.3 16.3 16.6 16 17 16 Z'/>";break;
		case 6: t[1]="<path fill='#"+color+"' d='M 25 8.5 L 20.7 4.05 6 9 4 10 4 18 6 22 10 26 25 20 25 8.5 M 8.4 10.35 L 19.8 6.45 22.6 9.05 10.6 12.7 8.4 10.35 M 6 11.7 L 7 11 10 14 10 23 7.75 20.8 6 17 6 11.7 M 23 10 L 23 18.4 11 23 11 13.65 23 10 M 21.6 17.8 L 21.6 11.75 12.5 14.65 12.5 21.2 21.6 17.8 M 20.75 13.05 L 20.75 16.95 13.6 19.65 13.6 15.3 20.75 13.05 Z'/>";break;
		case 7: t[1]="<path fill='#"+color+"' d='M 20.25 12.7 Q 21.05 13.45 21.35 13.85 21.75 14.4 22.05 15.25 22.35 16.1 21.95 16.3 21.7 16.45 20.8 16.25 L 21.4 18.1 20.85 18.75 Q 21.15 19.8 21 20.15 20.9 20.45 20.2 20.75 19.05 21.1 16.4 19.35 L 14.4 22.8 15.5 24.25 17.3 21.4 Q 19.95 22.65 21.2 22.2 22.85 21.55 22.2 19.35 L 22.75 18.85 22.5 17.5 Q 23.5 17.75 23.85 17.2 24.15 16.75 23.85 15.7 23.05 13.35 22 12.35 21.95 8.9 19.85 6.75 17.8 4.6 14.9 4.8 10 5.15 8.8 9.6 7.630078125 13.894921875 11.75 18.65 L 10 21.6 12.1 21.8 13.95 18.5 Q 11.85 16.15 11.05 14.35 10.15 12.4 10.45 10.6 10.7 9.2 11.5 8.2 12.35 7.05 13.55 6.8 15.55 6.4 16.6 6.7 17.15 6.8 18.3 7.6 20.25 8.9 20.25 12.7 Z'/>";break;
		case 8: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 9: t[1]="<path fill='#"+color+"' d='M 22.4 21.2 L 22.4 18.4 23.85 18.4 23.85 12.3 19.15 6.5 10.85 6.5 6.15 12.3 6.15 18.4 7.6 18.4 7.6 21.2 10.4 21.2 10.4 18.4 19.6 18.4 19.6 21.2 22.4 21.2 M 22.45 15 Q 22.45 15.65 22.1 16.05 21.65 16.5 21 16.5 20.35 16.5 19.95 16.05 19.5 15.65 19.5 15 19.5 14.35 19.95 13.9 20.35 13.5 21 13.5 21.65 13.5 22.1 13.9 22.45 14.35 22.45 15 M 11.3 7.6 L 18.7 7.6 21.95 11.85 8.05 11.85 11.3 7.6 M 9 16.5 Q 8.35 16.5 7.9 16.05 7.5 15.65 7.5 15 7.5 14.35 7.9 13.9 8.35 13.5 9 13.5 9.65 13.5 10.05 13.9 10.5 14.35 10.5 15 10.5 15.65 10.05 16.05 9.65 16.5 9 16.5 Z'/>";break;
		case 10: t[1]="<path fill='#"+color+"' d='M 15.7 5.7 Q 13.95 7.6 13.65 8 12.15 9.85 11.1 11.95 10.05 14.05 9.8 15.8 9.65 16.55 9.65 18.25 9.65 20.5 11.2 22.05 12.8 23.65 15 23.65 17.25 23.65 18.8 22.05 20.4 20.5 20.4 18.25 20.4 15.8 19.4 13.95 18.35 12.15 16.8 10.8 15.2 9.5 15.7 5.7 M 16.05 12.5 Q 17.25 13.6 18.05 14.95 18.8 16.3 18.8 18.05 18.8 19.65 17.75 20.8 16.65 21.9 15 21.9 13.4 21.9 12.3 20.8 11.15 19.65 11.15 18.05 11.15 15.95 12 13.8 12.95 11.5 14.7 8.65 14.8 11.35 16.05 12.5 Z'/>";break;
		case 11: t[1]="<path fill='#"+color+"' d='M 22.35 14.45 Q 22.95 15.3 23.7 15.4 L 15 21.25 6.35 15.35 Q 8.8 14.2 10.35 13.85 11.85 13.4 12.6 12.4 13.2 11.4 14.05 9.95 14.9 8.45 16.55 10.4 L 17.45 11.5 18.05 10.3 Q 17.45 9.25 16.85 7.95 14.2 1.75 12.4 7.65 11.65 10.25 10.1 12.05 L 3.15 15.1 15 24.95 26.8 15.1 22.7 13.3 Q 22.15 12.45 21.65 11.3 19.95 7.25 18.8 11.15 L 18.25 12.6 Q 16.85 15.3 13.85 16.15 17.5 16.2 18.8 14.2 19.55 12.8 20.35 12.8 21.05 12.75 22.35 14.45 Z'/>";break;
		case 12: t[1]="<path fill='#"+color+"' d='M 17.35 4.9 Q 16.55 4.7 15.8 5.05 15.1 5.5 14.95 6.35 14.8 7.1 15.2 7.85 15.35 8.05 15.65 8.3 L 15.6 8.95 12.05 10.25 Q 11.8 10.35 11.7 10.55 11.45 10.75 11.4 11.05 L 10.55 15 Q 10.5 15.35 10.8 15.65 10.95 15.95 11.35 16.05 11.65 16.1 12.05 15.9 12.3 15.7 12.3 15.45 L 13.05 11.85 14.7 11.3 14.2 14.7 12.8 18.95 8.65 20.6 Q 8.3 20.7 8.1 21.2 7.95 21.65 8.2 22 8.3 22.35 8.75 22.55 9.1 22.85 9.5 22.65 L 14.15 20.7 Q 14.55 20.5 14.75 20.1 L 15.55 17.85 16.4 19.5 14.65 23.7 Q 14.5 23.95 14.65 24.35 15 24.75 15.35 25 15.7 25.2 16.25 24.95 16.55 24.9 16.8 24.4 L 18.75 19.8 Q 18.9 19.45 18.75 19.1 L 16.5 14.6 17.05 9.95 16.9 9.25 16.95 8.8 Q 17.45 8.75 17.9 8.4 18.65 8.05 18.8 7.2 18.95 6.35 18.55 5.6 18.15 5.05 17.35 4.9 M 15.45 9.1 Q 15.4 9.15 15.35 9.15 L 15.45 9.05 15.45 9.1 Z'/>";break;
		case 13: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 14: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 15: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 16: t[1]="<path fill='#"+color+"' d='M 6 10 L 6 12 9 12 9 10 6 10 M 17 10 L 17 12 20 12 20 10 17 10 M 13 12 L 13 10 10 10 10 12 13 12 M 21 10 L 21 12 24 12 24 10 21 10 M 12 17 L 11 18 11 20 13 20 14 19 14 17 12 17 M 9 20 L 8 21 8 23 10 23 11 22 11 20 9 20 M 22 21 L 21 20 19 20 19 22 20 23 22 23 22 21 M 19 18 L 18 17 16 17 16 19 17 20 19 20 19 18 M 16 10 L 14 10 14 17 16 17 16 10 M 16 6 L 16 5 14 5 14 6 13 6 13 8 14 8 14 9 16 9 16 8 17 8 17 6 16 6 Z'/>";break;
		case 17: t[1]="<path fill='#"+color+"' d='M 14 8 L 16 8 16 5 14 5 14 8 M 8 20 L 8 21 7 21 7 23 9 23 9 22 10 22 10 20 8 20 M 25 16 L 25 14 22 14 22 16 25 16 M 22 21 L 22 20 20 20 20 22 21 22 21 23 23 23 23 21 22 21 M 23 9 L 23 7 21 7 21 8 20 8 20 10 22 10 22 9 23 9 M 9 8 L 9 7 7 7 7 9 8 9 8 10 10 10 10 8 9 8 M 8 14 L 5 14 5 16 8 16 8 14 M 16 22 L 14 22 14 25 16 25 16 22 M 13 10 L 13 11 11 11 11 13 10 13 10 17 11 17 11 19 13 19 13 20 17 20 17 19 19 19 19 17 20 17 20 13 19 13 19 11 17 11 17 10 13 10 M 13 12 L 17 12 17 13 18 13 18 17 17 17 17 18 13 18 13 17 12 17 12 13 13 13 13 12 Z'/>";break;
		case 18: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
	}
	t[2] = "</g></svg>";
	return t.join("\n");
}

LTH.IconPuce = function(color){
	var width = 50;
	var Kwidth = '0 0 50 50';
	var t = [];
	t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='"+Kwidth+"';'><g>";
	t[1] = "<path id='Layer1_0_1_STROKES' stroke='#FFFFFF' stroke-width='2' stroke-linejoin='round' stroke-linecap='round' fill='none' d='M 40.5 25 Q 40.5 31.4 36 35.95 31.45 40.5 25 40.5 18.6 40.5 14.05 35.95 9.5 31.4 9.5 25 9.5 18.6 14.05 14.05 18.6 9.5 25 9.5 31.45 9.5 36 14.05 40.5 18.6 40.5 25 Z M 43.525 17.325 Q 42.065234375 13.7900390625 39.15 10.85 L 36.3 13.7 M 32.675 6.45 Q 36.222265625 7.922265625 39.15 10.85 M 6.475 17.375 Q 7.9322265625 13.8265625 10.875 10.875 L 10.9 10.85 Q 13.8291015625 7.9208984375 17.35 6.45 M 13.7 13.7 L 10.875 10.875 M 17.325 43.525 Q 13.81171875 42.06171875 10.9 39.15 L 10.875 39.125 Q 7.9392578125 36.2052734375 6.475 32.675 M 13.675 36.325 L 10.875 39.125 M 43.525 32.725 Q 42.0603515625 36.2396484375 39.15 39.15 36.2396484375 42.0603515625 32.725 43.525 M 39.15 39.15 L 36.325 36.325'/>";
	t[2] = "</g></svg>";
	return t.join("\n");
}