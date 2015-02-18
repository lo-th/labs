/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

//var LTH = {};


LTH.labsMenu = function(){
	this.baseColor = '25292e';
	this.current = null;
	this.size = 800;
	this.decal = 1;
	this.rdecal = -30;
	this.center = this.size*0.5;
	this.radius = 30;//110;
	this.endRadius = 110;//110;
	this.line = 0;
	this.content = document.createElement('div');
	document.body.appendChild( this.content );
	this.content.className = 'labsMenu';

	this.pins = [];
	this.angles = [];
	this.anglesEnd = [];
	this.anglesStart = [];
	this.colors = [];
	this.nDemos = [];
	this.rubNames = [];
	this.points = [];


	this.nRubriques = 0;

	this.arcs = LTH.ARCS;
	this.init();
}

LTH.labsMenu.prototype = {
	constructor: LTH.labsMenu,
	init:function (){
		this.title = document.createElement('div');
	    this.title.className = 'labsTitle';
	    this.content.appendChild( this.title );

	    this.subTitle = document.createElement('div');
	    this.subTitle.className = 'labsSubTitle';
	    this.content.appendChild( this.subTitle );

		this.canvas = document.createElement('canvas');
		this.canvas.className = 'labsCanvas';
		this.content.appendChild( this.canvas );

		this.pinsContent = document.createElement('div');
	    this.pinsContent.className = 'pinsContent';
	    this.content.appendChild( this.pinsContent );

		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.canvas.height = this.size;

		

		var i = 0;
		for(var key in this.arcs){
			this.rubNames[i] = key;
			i++;
		}
		this.nRubriques = i;
		this.compute();

		this.content.onmousemove = function(e){this.mouseMove(e)}.bind(this);

		this.time = 10;
		this.anim = setTimeout(function(e){this.update()}.bind(this), this.time);

		this.draw();
	},
	update:function(){
		this.radius++;
		this.line+=0.2;
		if(this.radius==this.endRadius){
			clearTimeout(this.anim);
			this.draw(true);
		}else {
			this.draw();
			this.time -=0.2;
			this.anim = setTimeout(function(e){this.update()}.bind(this), this.time);
		}
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
			this.title.style.background = 'none';
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
		var n = 0, c, i=0, ndemo=0;
		for(var key in this.arcs){
			c = this.arcs[key];
			this.colors[n] = c.color;
			this.nDemos[n] = c.demos.length;
			ndemo += this.nDemos[n];
			n++;
		}

		var nangle = 360/ndemo;
		var prec = 0; 
		var prev=0

		for(var key in this.arcs){
			c = this.arcs[key];
			prec = this.nDemos[i]*nangle;

			this.anglesStart[i] = (prev)+this.decal+this.rdecal;
			this.anglesEnd[i] = (prev+prec)-this.decal+this.rdecal;

			var angle = (this.anglesStart[i]+(this.anglesEnd[i]-this.anglesStart[i])*0.5)-60;
			this.angles[i] = angle;
			this.points[i] = this.findPoint(angle);
			prev += prec;
			i++;
		}
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
	addPins:function(x,y,color,n,rubid){
		var id = this.pins.length;
		var pn = document.createElement('div');
		pn.className = 'pins';
		pn.style.left = x +'px';
		pn.style.top = y +'px';
	    pn.style.background = color;
	    pn.name = rubid +'_' + n;

	    var iner = document.createElement('div');
	    iner.className = 'pinsin';
	    var ic = this.arcs[this.rubNames[rubid]].icon[n];
	    //var ic = this.arcs[rubid].ic[n];
	    iner.innerHTML = LTH.IconMicro(this.baseColor, ic);
	    pn.appendChild( iner );

	    
	    this.pins[id] = pn;
	    this.pins[id].onmouseover = function(e){ 
	    	e.target.style.background = '#d2cec8';
	    	var r = this.rubNames[e.target.name.substring(0,1)];
	    	var n = e.target.name.substring(2,e.target.name.length);
	    	this.subTitle.innerHTML = (this.arcs[r].demos[n].replace("_", " ")).toUpperCase();
	    }.bind(this);
		this.pins[id].onmouseout = function(e){ 
			e.target.style.background = color;
		};
		this.pinsContent.appendChild( this.pins[id] );
	}
}





LTH.IconMicro = function(color, type){
	var width = 30;
	var Kwidth = '0 0 30 30';
	var t = [];
	t[0] = "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' preserveAspectRatio='none' x='0px' y='0px' width='"+width+"px' height='"+width+"px' viewBox='"+Kwidth+"';'>";
	switch(type){
		case 0:
		t[1]="<g id='Layer'><path fill='#"+color+"' d='M 26 16 L 26 14 22 14 22 10 20 8 16 8 16 4 14 4 14 8 10 8 8 10 8 14 4 14 4 16 8 16 8 20 10 22 14 22 14 26 16 26 16 22 20 22 22 20 22 16 26 16 M 19 10 L 20 11 20 19 19 20 11 20 10 19 10 11 11 10 19 10 Z'/><use xlink:href='#Layer'/></g></svg>";
		break;
		case 1:
		t[1]="<g id='Layer'><path fill='#"+color+"' d='M 16 11 L 14 11 14 14 11 14 11 16 14 16 14 19 16 19 16 16 19 16 19 14 16 14 16 11 Z'/><use xlink:href='#Layer'/></g></svg>";
		break;
	}
	return t.join("\n");
}