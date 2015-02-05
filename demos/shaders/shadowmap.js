var v = new V.View(180, 45, 600);
v.tell('shadow map');
v.initGui(false);
v.nav.camera.far = 3000;
v.nav.target.y=200;
v.nav.moveCamera();
v.pool.load('shell', onload);

var s = 400;
var shadowCamera = new THREE.OrthographicCamera( -s, s, s, -s, 1, 1000 );

var mesh;
var size = 512;
var shadowBuffer = new THREE.WebGLRenderTarget( size, size );

var depthMaterial = new V.Shader('Depth', {});
var shader = new V.Shader('ShadowMapping', {depthTexture:shadowBuffer, projector:THREE.ImageUtils.loadTexture( 'images/grider.jpg' ) }, true, onComplete);

var tmpMatrix = new THREE.Matrix4();
var tmpVector = new THREE.Vector3();
var isShader = false;
var isMesh = false;
loop();

function loop(){
    requestAnimationFrame( loop );
    if(!isShader || !isMesh) return;
    if(!shader.isActive) return;
	var t = Date.now() * .001;
	t *= .5;
	shadowCamera.position.set( 
		200 * Math.cos( t * .9 ), 
		260 * Math.cos( t * .9 ), 
		200 * Math.sin( t * .9 ) 
	);
	shadowCamera.position.y = 200;
	shadowCamera.lookAt( v.scene.position );

	v.scene.overrideMaterial = depthMaterial;
	v.renderer.render( v.scene, shadowCamera, shadowBuffer, true );

	tmpVector.copy( v.scene.position );
	tmpVector.sub( shadowCamera.position );
	tmpVector.normalize();

	tmpMatrix.copy( shadowCamera.projectionMatrix );
	tmpMatrix.multiply( mesh.matrixWorld );
	tmpMatrix.multiply( shadowCamera.matrixWorldInverse);
	//shader.uniforms.mmMatrix.value.copy( mesh.matrixWorld );
	shader.uniforms.shadowMVP.value.copy( tmpMatrix );
	shader.uniforms.shadowP.value.copy( shadowCamera.projectionMatrix );
	shader.uniforms.shadowV.value.copy( shadowCamera.matrixWorldInverse );
	shader.uniforms.lightPosition.value.copy( shadowCamera.position );
	shader.uniforms.lightDirection.value.copy( tmpVector );

	v.scene.overrideMaterial = shader;
    
    v.render();
}
//function onCompleteFirst(){
//	shader = new V.Shader('ShadowMapping', {depthTexture:shadowBuffer, projector:THREE.ImageUtils.loadTexture( 'images/grider.jpg' ) }, true, onComplete);
	//var env = new V.Environment();
    //env.add(shader);
	//depthMaterial = new V.Shader('Depth', {}, false, onComplete);
//}

function onComplete(){
	console.log('ok')
	isShader = true;
}

function onload(){

	var material = new THREE.MeshNormalMaterial( { shading: THREE.SmoothShading } );
	var g = new THREE.Geometry();
	var m = v.pool.meshes.shell;
	var mtx = new THREE.Matrix4().makeScale(2, 2, -2);
	var i = 8;
    while(i--){
    	g.merge(m['body_'+i].geometry, mtx);
    }
    mesh = new THREE.Mesh( new THREE.BoxGeometry( 1000, 10, 1000 ), material );
    mesh.position.set( 0, -5, 0 );
    mesh.updateMatrixWorld()
    g.merge( mesh.geometry, mesh.matrixWorld );
    mesh = new THREE.Mesh( V.TransGeo(g), material );
    v.scene.add( mesh );

    isMesh = true;
}