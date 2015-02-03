var v = new V.View(180, 45, 200);
v.tell('mesh deform');

var effect = { depth: 20.0, radius: 0.2, radiusbase: 0.2, power: 1.0, wireframe:false };

var ball = new THREE.Mesh( new THREE.SphereGeometry(1,12,10), new THREE.MeshBasicMaterial({color:0x33FF00}));
v.scene.add(ball);

var material = new V.Shader('Spherical',{transparent:true, env:THREE.ImageUtils.loadTexture( './images/spherical/e_chrome.jpg')}, false);

var env = new V.Environment();
env.add(material);

var mesh = new THREE.Mesh( new THREE.PlaneGeometry(160,160, 64, 64), material );
mesh.geometry.dynamic = true;
mesh.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI*0.5));
v.base.add(mesh);

var speeds = new V.AR32(mesh.geometry.vertices.length);
var mouseVector = new THREE.Vector3();

var gui = new dat.GUI();
gui.add(effect, "depth", 0.0, 100.0, 1.0);
gui.add(effect, "radius", 0.0, 1.0, 0.6).onChange( changeRadius );
gui.add(effect, "power", 0.0, 1.0, 0.1);
gui.add(effect, "wireframe").onChange( changeWire );

loop();

function loop(){
    requestAnimationFrame( loop );

    var i = mesh.geometry.vertices.length;
    while(i--){
        var vector = mesh.geometry.vertices[i];
        var coord = new THREE.Vector3( vector.x, -vector.y, vector.z );
        var power = effect.power / (effect.radius * 0.1 * coord.sub(mouseVector).length() + effect.radius);
        speeds[i] -= power * power + mesh.geometry.vertices[i].y * .1;
        speeds[i] *= 0.95;
        mesh.geometry.vertices[i].y += speeds[i];
        mesh.geometry.vertices[i].y = Math.max(-effect.depth, mesh.geometry.vertices[i].y);
    }
    mesh.geometry.verticesNeedUpdate = true;    
    mesh.geometry.computeVertexNormals( true );
    mesh.geometry.normalsNeedUpdate = true;
    v.render();
}

function mainRay(){
    mouseVector.x = v.nav.mouse3d.x;
    mouseVector.z = v.nav.mouse3d.z;
    ball.position.copy(mouseVector);
}
function mainDown(){
    effect.radius *=10;
}

function mainUp(){
    effect.radius = effect.radiusbase;
}

function changeWire(){
     material.wireframe=effect.wireframe;
}

function changeRadius(){
    effect.radiusbase = effect.radius;
}