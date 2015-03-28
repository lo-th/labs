/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

V.PostEffect = function(parent, name, adv, callback){
    this.shaderLoaded = 0;
    this.root = parent;
    this.name = name;
    this.isActive = false;
    this.init(adv);
    this.callback = callback || function(){};
}

V.PostEffect.prototype = {
    constructor: V.PostEffect,
    init:function(adv){
        var R = this.root;
        var w = R.dimentions.w;
        var h = R.dimentions.h;

        var cc = new THREE.Color(0x25292e);


        this.composer = new THREE.EffectComposer( R.renderer );
        this.renderModel = new THREE.RenderPass( R.scene, R.nav.camera, null, cc, 0);
        this.composer.addPass(this.renderModel);

        if(this.name == 'ssao'){
            this.isAdvancedSSAO = adv || false;

            if(this.isAdvancedSSAO){
                this.oldMap = [];
                this.oldSkinMap = [];

                this.depthShader2 = THREE.DepthDef;
                this.depthUniforms2 = THREE.UniformsUtils.clone( this.depthShader2.uniforms );
                this.depthMaterial2 = new THREE.ShaderMaterial( { fragmentShader: this.depthShader2.fragmentShader, vertexShader: this.depthShader2.vertexShader, uniforms: this.depthUniforms2, skinning:true } );
                this.depthMaterial2.blending = THREE.NoBlending;
            }

            // depth
            this.depthShader = THREE.DepthDef;
            this.depthUniforms = THREE.UniformsUtils.clone( this.depthShader.uniforms );
            this.depthMaterial = new THREE.ShaderMaterial( { fragmentShader: this.depthShader.fragmentShader, vertexShader: this.depthShader.vertexShader, uniforms: this.depthUniforms } );
            this.depthMaterial.blending = THREE.NoBlending;

            this.depthParam  = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat, stencilBuffer: false };
            this.depthTarget = new THREE.WebGLRenderTarget( w, h, this.depthParam );
       
            this.fxaa = new THREE.ShaderPass( THREE.FXAAShader );
            //var dpr = 1;
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
            this.composer.addPass( this.fxaa );

            this.ao = new THREE.ShaderPass( THREE.SSAOShader );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.ao.uniforms.cameraNear.value = R.nav.camera.near;
            this.ao.uniforms.cameraFar.value = R.nav.camera.far;
            this.ao.needsSwap = true;
            this.composer.addPass( this.ao );
            this.ao.renderToScreen = true;
            
            R.renderer.autoClear = true;
            this.isActive = true;
        }
        if(this.name == 'metaball'){
            this.shaderLoaded = 0;
            var fun = function(){this.testShader()}.bind(this);
            this.gauss = new V.GaussTexture(64,1,0.067);
            this.blobxy = new V.Shader('Gauss_xy', {gauss:this.gauss, transparent:true, blending:THREE.NormalBlending, depthTest:false, depthWrite:true }, false, fun )
            this.blobmin = new V.Shader('Gauss_min', {gauss:this.gauss, transparent:true, blending:THREE.NormalBlending, depthTest:false, depthWrite:true }, false, fun )
            this.metaball = new V.Shader('Metaball', { }, false, fun );
        }
        if(this.name == 'distortion'){
            this.fxaa = new THREE.ShaderPass( THREE.FXAAShader );
            //var dpr = 1;
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
            var fun = function(){this.testShader()}.bind(this);
            this.effect = new V.Shader('Distortion', { }, false, fun );
        }
    },
    testShader:function(){
        var R = this.root;
        this.shaderLoaded++;
        if(this.name == 'distortion'){
            this.updateDistortionEffect();
            var passs = new THREE.ShaderPass( this.effect );
            
            this.composer.addPass( passs );
            this.composer.addPass( this.fxaa );
            //passs.renderToScreen = true;
            this.fxaa.renderToScreen = true;
            
            R.renderer.autoClear = true;
            this.isActive = true;
             
        }
        if(this.name == 'metaball'){
            if(this.shaderLoaded==3){
                var w = R.dimentions.w;
                var h = R.dimentions.h;
                this.glowParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBufer: false };
                
                this.rootTarget = new THREE.WebGLRenderTarget(  w, h, this.glowParameters );
                this.renderModelRoot = new THREE.RenderPass( R.scene, R.nav.camera );
                this.rootcomposer = new THREE.EffectComposer( R.renderer, this.rootTarget );
                this.rootcomposer.addPass( this.renderModelRoot );

                this.glowTargetxy = new THREE.WebGLRenderTarget(  w, h, this.glowParameters );
                this.renderModelGlowxy = new THREE.RenderPass( R.sceneBlob, R.nav.camera, this.blobxy );
                this.glowcomposerxy = new THREE.EffectComposer( R.renderer, this.glowTargetxy );
                this.glowcomposerxy.addPass( this.renderModelGlowxy );

                this.glowTarget = new THREE.WebGLRenderTarget(  w, h, this.glowParameters );
                this.renderModelGlow = new THREE.RenderPass( R.sceneBlob, R.nav.camera, this.blobmin );
                this.glowcomposer = new THREE.EffectComposer( R.renderer, this.glowTarget );
                this.glowcomposer.addPass( this.renderModelGlow );

                this.renderTarget = new THREE.WebGLRenderTarget(w, h, this.glowParameters );

                this.meta = new THREE.ShaderPass( this.metaball );
                this.meta.uniforms.mapping.value = this.rootcomposer.renderTarget2;
                this.meta.uniforms.tDiffuseXY.value = this.glowcomposerxy.renderTarget2;
                this.meta.uniforms.tDiffuseMin.value = this.glowcomposer.renderTarget2;
                this.meta.uniforms.size.value.set( w, h );
                this.meta.transparent = true;
                this.meta.uniforms.env.value = THREE.ImageUtils.loadTexture( './images/spherical/env0.jpg');
                this.meta.isActive = true;
                //this.meta.uniforms.mapping.value = back.map;
                this.meta.needsSwap = true;
                this.meta.renderToScreen = true;
                this.composer.addPass(this.renderTarget);
                this.composer.addPass(this.meta);
                this.isActive = true;
                this.callback();
            }
        }
    },
    render:function(){
        var R = this.root;
        if(this.name == 'ssao'){
            if(this.isAdvancedSSAO){
                var skin = R.skinned.children.length;
                var content = R.content.children.length;
                var i = content;
                while(i--){
                    if(!this.oldMap[i])this.oldMap[i] = R.content.children[i].material;
                    R.content.children[i].material = this.depthMaterial;
                }
                i = skin;
                while(i--){
                    if(!this.oldSkinMap[i])this.oldSkinMap[i] = R.skinned.children[i].material;
                    R.skinned.children[i].material = this.depthMaterial2;
                }
                R.renderer.render( R.scene, R.nav.camera, this.depthTarget );
                i = content;
                while(i--) R.content.children[i].material = this.oldMap[i];
                i = skin;
                while(i--) R.skinned.children[i].material = this.oldSkinMap[i];
            } else {
                R.scene.overrideMaterial = this.depthMaterial;
                R.renderer.render( R.scene, R.nav.camera, this.depthTarget );
                R.scene.overrideMaterial = null;
            }
        }
        if(this.name == 'metaball'){

            var r = R.nav.camera.quaternion;
            var i = R.meshs.length, m
            while(i--){ m=R.meshs[i]; if(m.type=='BLOB') m.update(r); }
            //R.scene.overrideMaterial = this.blobmin;
            this.rootcomposer.render();
            this.glowcomposerxy.render();
            this.glowcomposer.render();
            //
        }
        //if(this.name == 'distortion'){
            //this.composer.render();
        //}
        this.composer.render();
    },
    resize:function(w, h){
        if(this.name == 'ssao'){
            this.depthTarget = new THREE.WebGLRenderTarget( w, h, this.depthParam );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
        }
        if(this.name == 'metaball'){
            //this.glowTarget = new THREE.WebGLRenderTarget(w, h, this.glowParameters );
            //this.renderTarget = new THREE.WebGLRenderTarget(w, h, this.glowParameters );
            //this.glowcomposer = new THREE.EffectComposer( this.root.renderer, this.glowTarget );
            //this.glowcomposer.setSize( w, h );
            //this.meta.uniforms.tDiffuseMin.value = this.glowcomposer.renderTarget2;
            this.meta.uniforms.size.value.set( w, h );
        }
        if(this.name == 'distortion'){
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
            this.updateDistortionEffect();
        }
        this.composer.setSize( w, h );
    },
    updateDistortionEffect:function(){
        var R = this.root;
        var params = {
            horizontalFOV:      140,
            strength:           0.5,
            cylindricalRatio:   2,
        }
        
        var height = Math.tan((params.horizontalFOV*V.ToRad)*0.5) / R.nav.camera.aspect;

        R.nav.camera.fov = (Math.atan(height) * 2) * V.ToDeg;
        R.nav.camera.updateProjectionMatrix();
        
        this.effect.uniforms[ "strength" ].value = params.strength;
        this.effect.uniforms[ "height" ].value = height;
        this.effect.uniforms[ "aspectRatio" ].value = R.nav.camera.aspect;
        this.effect.uniforms[ "cylindricalRatio" ].value = params.cylindricalRatio;
    },
    deformSsao:function( g, map ){
        g.computeBoundingBox();
        var max = g.boundingBox.max;
        var min = g.boundingBox.min;
        this.depthUniforms.tdeep.value = map;
        this.depthUniforms.offset.value = new THREE.Vector2(0 - min.x, 0 - min.z);
        this.depthUniforms.range.value = new THREE.Vector2(max.x - min.x, max.z - min.z);
    }
}



//------------------------------------------
// GAUSS TEXTURE
//------------------------------------------

V.GaussTexture = function (e, t, n) {
    this.sets = { size: e || 64, height: t || 1, deviation: n || .067 };
    return this.createGaussTexture()
}

V.GaussTexture.prototype = {
    createGaussTexture: function () {
        var e = this.sets.size * this.sets.size * 3;
        var t = new Uint8Array(e);
        var n, r, i, u, o, c;
        var s = this.sets.size * 0.5;
        o = this.sets.size;
        while(o--){
            u = this.sets.size;
            while(u--){
                n = 2 * u / this.sets.size - 1;
                r = 2 * o / this.sets.size - 1;
                i = this.sets.height * Math.exp(-(n * n + r * r) / this.sets.deviation);
                i *= 255;
                c = 3 * (o * this.sets.size + u);
                t[c+0] = i;
                t[c+1] = i;
                t[c+2] = i;
            }
        }
        var l = new THREE.DataTexture(t, this.sets.size, this.sets.size, THREE.RGBFormat);
        l.wrapS = l.wrapT = THREE.ClampToEdgeWrapping;
        l.needsUpdate = true;
        return l;
    }
}