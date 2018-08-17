//Initilise the scene
let step = 0;
let model = null;
let controls = null;

// init renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setClearColor(new THREE.Color("lightgrey"), 0);
renderer.setSize(640, 480);
renderer.domElement.style.position = "absolute";
renderer.domElement.style.top = "0px";
renderer.domElement.style.left = "0px";
document.body.appendChild(renderer.domElement);

// array of functions for the rendering loop
let onRenderFcts = [];

// init scene and camera
const scene = new THREE.Scene();

//Initialise a basic camera

// Create a camera
const camera = new THREE.PerspectiveCamera();
scene.add(camera);

//handle arToolkitSource

const arToolkitSource = new THREEx.ArToolkitSource({
  // to read from the webcam
  sourceType: "webcam"
});

arToolkitSource.init(function onReady() {
  onResize();
});

// handle resize
window.addEventListener("resize", function() {
  onResize();
});

function onResize() {
  arToolkitSource.onResizeElement();
  arToolkitSource.copyElementSizeTo(renderer.domElement);
  if (arToolkitContext.arController !== null) {
    arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
  }
}
//initialise arToolkitContext

// create atToolkitContext
const arToolkitContext = new THREEx.ArToolkitContext({
  cameraParametersUrl:
    THREEx.ArToolkitContext.baseURL + "image/camera_para.dat",
  detectionMode: "mono"
});
// initialise it
arToolkitContext.init(function onCompleted() {
  // copy projection matrix to camera
  camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

// update artoolkit on every frame
onRenderFcts.push(function() {
  if (arToolkitSource.ready === false) return;

  arToolkitContext.update(arToolkitSource.domElement);
});

//lighting
// var light = new THREE.SpotLight(0xffeedd);
// light.position.set(3.5, 10, 1);
// light.castShadow = true; // default false
// light.shadow.mapSize.width = 2048; // default: 512
// light.shadow.mapSize.height = 2048; // default: 512
// light.shadow.camera.near = 0.5; // default: 0.5
// light.shadow.camera.far = 500; // default: 500
// light.shadow.camera.fov = 90;
// //light.intensity = 1;
// scene.add(light);

const ambient = new THREE.AmbientLight(0x222222);
ambient.intensity = 5;
scene.add(ambient);

//markerRoot

// build markerControls
let markerRoot = new THREE.Group();
markerRoot.name = "marker";
scene.add(markerRoot);
const markerControls = new THREEx.ArMarkerControls(
  arToolkitContext,
  markerRoot,
  {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "image/pattern-letterA.patt"
  }
);

// Instantiate a loader
const loader = new THREE.GLTF2Loader();
// Load a glTF resource
loader.load("image/bg4.gltf", function(gltf) {
  model = gltf.scene || gltf.scenes[0];
  model.rotation.x = 90 * (Math.PI / 180);
  model.rotation.y = 270 * (Math.PI / 180);
  model.rotation.z = 0 * (Math.PI / 180);

  // arController.loadMarker('image/pattern-letterA.patt', function (markerId) {
  //   var markerRoot = arController.createThreeMarker(markerId);
  //   markerRoot.add(sphere);
  //   arScene.scene.add(markerRoot);
  scene.add(gltf.scene);
  markerRoot.add(model);
});
// add a gizmo in the center of the marker
// const loader = new THREE.JSONLoader();
// loader.load("./model.json", function(geometry) {
//   model = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
//   scene.add(model);
//   markerRoot.add(model);
// });

////animate
const Controller = new function() {
  this.rotationSpeed = 0.02;
  this.bouncingSpeed = 0.02;
}();

const animate = () => {
  step = step + Controller.bouncingSpeed;

  // model.rotation.x += Controller.rotationSpeed;

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  animate();
};

window.onload = init;

markerRoot = scene.getObjectByName("marker");

// render the scene
onRenderFcts.push(function() {
  renderer.render(scene, camera);
});

// run the rendering loop
let lastTimeMsec = null;
requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // measure time
  lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
  let deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
  lastTimeMsec = nowMsec;
  // call each update function
  onRenderFcts.forEach(function(onRenderFct) {
    onRenderFct(deltaMsec / 1000, nowMsec / 1000);
  });
});
