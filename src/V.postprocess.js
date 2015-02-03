V.PostEffect = function(parent, name, adv){
    this.root = parent;
    this.name = name;
    this.init(adv);
}

V.PostEffect.prototype = {
    constructor: V.PostEffect,
    init:function(adv){
        var w = this.root.dimentions.w;
        var h = this.root.dimentions.h;

        this.composer = new THREE.EffectComposer( this.root.renderer );
        this.renderModel = new THREE.RenderPass( this.root.scene, this.root.nav.camera );
        this.composer.addPass( this.renderModel);

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
            var dpr = 1;
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
            this.composer.addPass( this.fxaa );

            this.ao = new THREE.ShaderPass( THREE.SSAOShader );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.ao.uniforms.cameraNear.value = this.root.nav.camera.near;
            this.ao.uniforms.cameraFar.value = this.root.nav.camera.far;
            this.ao.needsSwap = true;
            this.ao.renderToScreen = true;
            this.composer.addPass( this.ao );

            this.root.renderer.autoClear = true;
        }
        //if(this.name == 'metaball'){ }
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
        //if(this.name == 'metaball'){ }
        this.composer.render();
    },
    resize:function(){
        if(this.name == 'ssao'){
            var w = this.root.dimentions.w;
            var h = this.root.dimentions.h;
            this.depthTarget = new THREE.WebGLRenderTarget( w, h, this.depthParam );
            this.ao.uniforms.tDepth.value = this.depthTarget;
            this.ao.uniforms.size.value.set( w, h );
            this.fxaa.uniforms.resolution.value.set( 1 / w, 1 / h );
        }
        //if(this.name == 'metaball'){ }
        this.composer.setSize( w, h );
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