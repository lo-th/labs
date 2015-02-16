/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.Worker = function(parent, name){
    this.root = parent;
    this.name = name;
    this.msg = '';

    this.update = null;
    this.postMess = null;

    var url, max, max2, max3, max4, nValue, nValue2, sourceURL;
    switch(this.name){
        case 'crowd':
            url = 'js/worker/crowd_worker.js';
            sourceURL = '../../js/libs/crowd.js';
            max = 1000;
            max2 = 100;
            max3 = 10;
            max4 = 1000;
            nValue = 3;
            nValue2 = 2;
            this.update = this.upCrowd;
            this.postMess = this.postCrowd;
        break;
        case 'liquid':
            url = 'js/worker/liquid_worker.js';
            sourceURL = '../../js/libs/liquidfun.js';
            max = 1000;
            max2 = 100;
            max3 = 10;
            max4 = 8000;
            nValue = 4;
            nValue2 = 2;
            this.update = this.upLiquid;
            this.postMess = this.postLiquid;
        break;
        case 'oimo':
            url = 'js/worker/oimo_worker.js';
            sourceURL = '../../js/libs/oimo.min.js';
            max = 1000;
            max2 = 10;
            max3 = 10;
            max4 = 0;
            nValue = 8;
            nValue2 = 3;
            this.update = this.upOimo;
            this.postMess = this.postOimo;
        break;
    }

    if(window.top.main.transcode.useTrans){
        sourceURL = window.top.main.transcode.codes[this.name];
       // console.log('with transcode', sourceURL);
    }

    this.w = new Worker(url);
    this.w.postMessage = this.w.webkitPostMessage || this.w.postMessage;
    this.w.onmessage = function(e){this.update(e)}.bind( this );

    this.ar = new V.AR32(max*nValue);
    this.dr = new V.AR32(max2*nValue2);
    this.pr = new V.AR32(max4*nValue2);
    this.drn = new V.AR32(max3);
    this.drc = new V.AR32(max3);
    this.prn = new V.AR32(max3);

    this.d = [16.667, 0, 0];
    this.isReady = false;
    this.fps = 0;

    //this.loop();
    this.w.postMessage({ m:'init', url:sourceURL });
    //this.w.onmessage = function(e){this.onMessage(e)}.bind( this );
}
V.Worker.prototype = {
    constructor: V.Worker,
    clear:function(){
        this.w.terminate();
    },
    computeTime:function(){

        this.root.deb = ' | '+this.name.toUpperCase()+' '+ this.fps;// + ' FPS ';

        var d = this.d;
        d[1] = d[0]-(Date.now()-d[2]);
        d[1] = d[1]<0 ? 0 : d[1];

        setTimeout(function(){
            this.d[2] = Date.now();
            this.postMess();
            this.msg = '';
        }.bind(this), d[1]);
    },
    loop:function(){
        this.d[2] = Date.now();
        this.postMess();
        this.msg = '';
    },


    // CROWD ---------------------------------------------

    upCrowd:function(e){
        if(e.data.init){
            this.postMess();
            return;
        }
        if(e.data.w && !this.isReady) this.isReady = true;
        this.fps = e.data.fps;
        this.ar = e.data.ar;

        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*3;
            m[i].position.x = this.ar[id];
            m[i].position.z = this.ar[id+1];
            m[i].rotation.y = this.ar[id+2];//-V.PI90;
        }

        this.computeTime();
    },
    postCrowd:function(){
        this.w.postMessage({m:'run', ar:this.ar},[this.ar.buffer]);
    },


    // LIQUID ---------------------------------------------

    upLiquid:function(e){
        if(e.data.init){
            this.postMess();
            return;
        }
        if(e.data.w && !this.isReady) this.isReady = true;
        this.fps = e.data.fps;
        this.ar = e.data.ar;
        this.pr = e.data.pr;
        this.prn = e.data.prn;
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
        this.computeTime();
    },
    postLiquid:function(){
        //this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, dr:this.dr, ar:this.ar, pr:this.pr, prn:this.prn},[this.ar.buffer, this.pr.buffer]);
        this.w.postMessage({m:'run', prn:this.prn, ar:this.ar, pr:this.pr },[this.ar.buffer, this.pr.buffer]);
    },


    // OIMO ---------------------------------------------

    upOimo:function(e){
        if(e.data.init){
            this.postMess();
            return;
        }
        if(e.data.w && !this.isReady) this.isReady = true;
        this.fps = e.data.fps;
        this.ar = e.data.ar;
        var m = this.root.meshs;
        var i = m.length, id;
        while(i--){
            id = i*8;
            if(this.ar[id]){
                m[i].position.set( this.ar[id+1], this.ar[id+2], this.ar[id+3] );
                if(m.type!=='BLOB') m[i].quaternion.set( this.ar[id+4], this.ar[id+5], this.ar[id+6], this.ar[id+7] );
            }
        }

        this.computeTime();

    },
    postOimo:function(){
        this.w.postMessage({m:'run', m2:this.msg, drn:this.drn, drc:this.drc, ar:this.ar, dr:this.dr},[this.ar.buffer]);
    },

    room:function (o){
        var wpos = (o.h*0.5)-o.m;
        var s = [
            o.w-o.m,o.m,o.d-o.m,
            o.w+o.m,o.h,o.m,  
            o.w+o.m,o.h,o.m,  
            o.m,o.h,o.d-o.m,  
            o.m,o.h,o.d-o.m
        ];
        var p = [ 
            0,-o.m*0.5,0,
            0, wpos,-o.d*0.5,
            0, wpos, o.d*0.5,
            -o.w*0.5, wpos,0,
            o.w*0.5, wpos,0
        ];
        this.w.postMessage({m:'room', obj:{n:5, size:s, pos:p} });
                
        v.addSolid({ type:'box', size:[o.w-o.m,o.h-o.m,o.d-o.m], pos:[ 0,wpos+o.m*0.5,0] });
        v.addSolid({ type:'box', size:[o.w+o.m,o.h,o.d+o.m], pos:[ 0,wpos,0]});

        //console.log('room')
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
        var i = l;
        while(i--){
            n = i*2;
            this.dr[n] = obj.points[n];
            this.dr[n+1] = obj.points[n+1];
        }
        this.updateDecal();
    },
    updateDecal:function(){
        this.post({m:'updecal', dr:this.dr, drn:this.drn, drc:this.drc });
    }
}

