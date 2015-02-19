/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

LTH.labsMenu = function(main){
	this.main = main;
	this.baseColor = 'd2cec8';
	this.topColor= '25292e';
	this.current = null;
	this.size = 800;
	this.decal = 1;
	this.rdecal = -30;
	this.center = this.size*0.5;
	this.radius = 10;
	this.endRadius = 110;
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

		this.canvas = document.createElement('canvas');
		this.canvas.className = 'labsCanvas';
		this.content.appendChild( this.canvas );

		this.pinsContent = document.createElement('div');
	    this.pinsContent.className = 'pinsContent';
	    this.content.appendChild( this.pinsContent );

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
		this.line+=0.2;
	},
	activeMouse:function(){
		this.content.onmousemove = function(e){this.mouseMove(e)}.bind(this);
	},
	mouseMove:function(e){
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
			}
		} else {
			this.current = null;
			this.title.style.background = '#'+this.topColor;
			this.title.innerHTML = '';
			this.subTitle.innerHTML = '';
		}

	},
	findRubrique:function(angle){
		var i=this.nRubriques;
		while(i--){
			if(angle<this.anglesEnd[i] && angle>this.anglesStart[i]) this.current =this.rubNames[i];
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
		var prev=0;
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
		var a2 = (angle+13)*LTH.ToRad;
		var a3 = (angle-13)*LTH.ToRad;
		var point, dist = 90;
		var r = this.endRadius;
		var p = [];
		for(var i=0; i<13; i++){
			if(i==0) point = this.radialPos(a,r+25);
			else if(i==1) point = this.radialPos(a,r+70);
			else {
				if((i & 1)==1){ point = this.radialPos(a3,r+dist); dist +=45; } // impaire
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
			//if(isEnd) this.liner(i, this.nDemos[i]);
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
			j = this.prevPins.length;
			while(j--){
				this.prevPins[j].style.display = 'block';
			}
			// anime prev pins
			j = this.pins.length;
			while(j--){
				this.pins[j].className = 'pins pinson';
				this.prevPins[j] = this.pins[j].childNodes[0];
				//this.pins[j].childNodes[0].className = 'pinsin pinsinon';
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
		this.ctx.strokeStyle = c;
		this.ctx.beginPath();
		this.ctx.moveTo(p[0].x, p[0].y);
		if(i==0) this.ctx.lineTo(p[1].x, p[1].y);
		if(i==1){
			this.ctx.moveTo(p[1].x, p[1].y);
		    this.ctx.lineTo(p[2].x, p[2].y);
		}
		if(i==2){
			this.ctx.moveTo(p[1].x, p[1].y);
		    this.ctx.lineTo(p[3].x, p[3].y);
		}
		if(i==3){
			this.ctx.moveTo(p[2].x, p[2].y);
			this.ctx.lineTo(p[4].x, p[4].y);
		}
		if(i==4){
			this.ctx.moveTo(p[3].x, p[3].y);
		    this.ctx.lineTo(p[5].x, p[5].y);
		}
		if(i==5){
			this.ctx.moveTo(p[4].x, p[4].y);
			this.ctx.lineTo(p[6].x, p[6].y);
		}
		if(i==6){
			this.ctx.moveTo(p[5].x, p[5].y);
			this.ctx.lineTo(p[7].x, p[7].y);
		}

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
	    	var r = e.target.name.substring(0,1)*1;
	    	var n = e.target.name.substring(2,e.target.name.length)*1;
	    	this.main.menu.resetHome(r, n);
	    }.bind(this);
	    this.pins[id].onmouseover = function(e){ 
	    	e.target.style.background = '#'+this.baseColor;
	    	var r = e.target.name.substring(0,1)*1;
	    	var n = e.target.name.substring(2,e.target.name.length)*1;
	    	this.subTitle.innerHTML = (this.demosNames[r][n].replace("_", " ")).toUpperCase();
	    }.bind(this);
		this.pins[id].onmouseout = function(e){ 
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
	t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='"+Kwidth+"';'><g id='Layer'>";
	switch(type){
		case 0: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 1: t[1]="<path fill='#"+color+"' d='M 26 16 L 26 14 22 14 22 10 20 8 16 8 16 4 14 4 14 8 10 8 8 10 8 14 4 14 4 16 8 16 8 20 10 22 14 22 14 26 16 26 16 22 20 22 22 20 22 16 26 16 M 19 10 L 20 11 20 19 19 20 11 20 10 19 10 11 11 10 19 10 Z'/>";break;
		case 2: t[1]="<path fill='#"+color+"' d='M 23 20 L 22 20 22 12 19 12 19 10 18 10 18 12 16 12 16 19 18 19 18 14 20 14 20 22 23 22 23 20 M 7 22 L 10 22 10 10 12 10 12 19 14 19 14 8 8 8 8 20 7 20 7 22 Z'/>";break;
		case 3: t[1]="<path fill='#"+color+"' d='M 21 8 L 21 10 19 12 18 11 12 11 11 12 9 10 9 8 10 7 9 6 6 9 6 13 8 15 7 16 7 20 8 21 14 21 14 24 16 24 16 21 22 21 23 20 23 16 22 15 24 13 24 9 21 6 20 7 21 8 M 23 10 L 23 12 21 14 20 13 22 11 22 9 23 10 M 21 17 L 21 19 9 19 9 17 13 13 17 13 21 17 M 8 9 L 8 11 10 13 9 14 7 12 7 10 8 9 Z'/>";break;
		case 4: t[1]="<path fill='#"+color+"' d='M 26 16 L 26 14 16 4 14 4 4 14 4 16 14 26 16 26 26 16 M 6 15 L 15 6 24 15 15 24 6 15 M 16 10 L 14 10 14 16 16 16 16 10 M 16 18 L 14 18 14 20 16 20 16 18 Z'/>";break;
		case 5: t[1]="<path fill='#"+color+"' d='M 21.35 21.35 Q 24 18.75 24 15 24 11.25 21.35 8.6 18.75 6 15 6 11.25 6 8.6 8.6 6 11.25 6 15 6 18.75 8.6 21.35 11.25 24 15 24 18.75 24 21.35 21.35 M 14.95 7.95 Q 17.9 7.95 19.9 10 21.95 12.05 21.95 14.95 21.95 17.9 19.9 19.9 17.9 21.95 14.95 21.95 12.05 21.95 10 19.9 7.95 17.9 7.95 14.95 7.95 12.05 10 10 12.05 7.95 14.95 7.95 M 20 17 Q 20 15.75 19.1 14.85 18.25 14 17 14 15.75 14 14.85 14.85 14 15.75 14 17 14 18.25 14.85 19.1 15.75 20 17 20 18.25 20 19.1 19.1 20 18.25 20 17 M 17 16 Q 17.4 16 17.7 16.3 18 16.6 18 17 18 17.4 17.7 17.7 17.4 18 17 18 16.6 18 16.3 17.7 16 17.4 16 17 16 16.6 16.3 16.3 16.6 16 17 16 Z'/>";break;
		case 6: t[1]="<path fill='#"+color+"' d='M 25 8.5 L 20.7 4.05 6 9 4 10 4 18 6 22 10 26 25 20 25 8.5 M 8.4 10.35 L 19.8 6.45 22.6 9.05 10.6 12.7 8.4 10.35 M 6 11.7 L 7 11 10 14 10 23 7.75 20.8 6 17 6 11.7 M 23 10 L 23 18.4 11 23 11 13.65 23 10 M 21.6 17.8 L 21.6 11.75 12.5 14.65 12.5 21.2 21.6 17.8 M 20.75 13.05 L 20.75 16.95 13.6 19.65 13.6 15.3 20.75 13.05 Z'/>";break;
		case 7: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
		case 8: t[1]="<path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/>";break;
	}
	t[2] = "<use xlink:href='#Layer'/></g></svg>";
	return t.join("\n");
}