V.Worker = function(parent, name){
    this.name = name;
    this.root = parent;
    this.msg = '';

    var url, max, max2, max3, max4, nValue, nValue2;
    switch(this.name){
        case 'liquid':
            url = './js/worker/liquid_worker.js';
            max = 1000;
            max2 = 100;
            max3 = 10;
            max4 = 1000;
            nValue = 4;
            nValue2 = 2;
        break;
        case 'oimo':
            url = './js/worker/oimo_worker.js';
            max = 1000;
            max2 = 10;
            max3 = 10;
            max4 = 0;
            nValue = 8;
            nValue2 = 3;
        break;
    }

    this.ar = new V.AR32(max*nValue);
    this.dr = new V.AR32(max2*nValue2);
    this.pr = new V.AR32(max4*nValue2);
    this.drn = new V.AR8(max3);
    this.drc = new V.AR8(max3);
    this.prn = new V.AR8(max3);

    this.w = new Worker(url);
    this.w.postMessage = this.w.webkitPostMessage || this.w.postMessage;
    
    this.d = [16.667, 0, 0];
    this.isReady = false;

    this.loop();
    this.w.onmessage = function(e){this.onMessage(e)}.bind( this );
}
V.Worker.prototype = {
    constructor: V.Worker,
    clear:function(){
        this.w.terminate();
    },
    onMessage:function(e){
        var d = this.d;
        var _this = this;
        if(e.data.w && !this.isReady) this.isReady = true;

        this.ar = e.data.ar;
        //this.dr = e.data.dr;

        
        if(this.name === 'liquid'){
            this.pr = e.data.pr;
            this.prn = e.data.prn;
            this.upLiquid();
        }
        else this.upOimo();

        d[1] = d[0]-(Date.now()-d[2]);
        d[1] = d[1]<0 ? 0 : d[1];

        this.root.deb = ' | '+this.name +' '+ e.data.fps + ' fps ';
        setTimeout(function(e) {_this.loop()}, d[1]);
    },
    upLiquid:function(){
        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*4;
            m[i].position.x = this.ar[id];
            m[i].position.z = this.ar[id+1];
            m[i].rotation.y = this.ar[id+2];
        }

        i = this.root.ps.length;
        var p, j, k;
        while(i--){
            p = this.root.ps[i];
            j = this.prn[i]
            if(p.getLength() !== j) p.addNum(j);
            k = j;
            while(k--){
                id = k*2;
                p.move(k, this.pr[id], 0, this.pr[id+1]);
            }
            p.update();
        }

    },
    upOimo:function(){
        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*8;
            if(this.ar[id]){
                m[i].position.set( this.ar[id+1], this.ar[id+2], this.ar[id+3] );
                m[i].quaternion.set( this.ar[id+4], this.ar[id+5], this.ar[id+6], this.ar[id+7] );
            } 
        }
    },
    loop:function(){
        this.d[2] = Date.now();
        if(this.name === 'liquid') this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, dr:this.dr, ar:this.ar, pr:this.pr, prn:this.prn},[this.ar.buffer, this.pr.buffer]);
        else this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, ar:this.ar, dr:this.dr},[this.ar.buffer]);
        this.msg = '';
        //this.w.postMessage({m:'run', drn:this.drn, ar:this.ar, dr:this.dr},[this.ar.buffer, this.dr.buffer]);
    },
    add:function(obj){
        this.w.postMessage({m:'add', obj:obj});
    },
    addParticle:function(obj){
        this.w.postMessage({m:'addParticle', obj:obj});
    },
    post:function(obj){
        this.w.postMessage(obj);
    },
    chaine:function(obj){
        if(obj.close) this.drc[0] = 1;

        var l = obj.points.length * 0.5;
        this.drn[0] = l;
        var n;
        for(var i=0; i<l; i++){
            n = i*2;
            this.dr[n] = obj.points[n];
            this.dr[n+1] = obj.points[n+1];
        }
       // this.post({m:'updecal'})
        this.msg = 'updecal';
    }
}

