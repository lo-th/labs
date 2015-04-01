var v = new V.View(90, 90, 130, true);
v.initSky();
//var sky = new V.Skylab(v);
var mat = new THREE.MeshBasicMaterial( {map:v.environment, side:THREE.DoubleSide } );
var plane = new THREE.Mesh(v.geo.plane, mat);
plane.scale.set(40,40,40);
v.scene.add(plane);

loop();

function loop(){
    v.render();
    //sky.update();
    requestAnimationFrame( loop );
}