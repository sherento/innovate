//initialise scene
let step = 0;
let dode = null;

//initialise renderer
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

//arToolkitSource
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

//marker
let markerRoot1 = new THREE.Group();
markerRoot1.name = "marker1";
scene.add(markerRoot1);
const dodeMarkerControls = new THREEx.ArMarkerControls(
  arToolkitContext,
  markerRoot1,
  {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "image/pattern-letterA.patt"
  }
);

// add a gizmo in the center of the marker
const dodeGeometry = new THREE.DodecahedronGeometry(0.3, 0);
const dodeMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.8,
  side: THREE.DoubleSide
});
dode = new THREE.Mesh(dodeGeometry, dodeMaterial);
markerRoot1.add(dode);

// build markerControls
// let markerRoot = new THREE.Group();
// markerRoot.name = "marker1";
// scene.add(markerRoot);
// const modelMarkerControls = new THREEx.ArMarkerControls(
//   arToolkitContext,
//   markerRoot,
//   {
//     type: "pattern",
//     patternUrl: THREEx.ArToolkitContext.baseURL + "image/pattern-letterA.patt"
//   }
// );

// add a gizmo in the center of the marker
// const mltLoader = new THREE.MTLLoader();
// mtlLoader.load("image/bg4.mtl", function(materials) {
//   materials.preload();
//   const objLoader = new THREE.OBJLoader();
//   objLoader.setMaterials(materials);

//   objLoader.load("image/bg4.obj", function(mesh) {
//     mesh.transverse(function(node) {
//       if (node instanceof THREE.Mesh) {
//         node.castShadow = true;
//         node.receiveShadow = true;
//       }
//     });

//     scene.add(mesh);
//     mesh.position.set(-3, 0, 4);
//     mesh.rotation.y = -Math.PI / 4;
//   });
// });
// markerRoot.add(mltLoader);
//instantiates a loader
// const loader = new THREE.OBJLoader();

// loader.load("image/model.obj", function(object) {
//   scene.add(object);
// });

// //load a resource
// const geometry = new THREE.BufferGeometry();
// const material = new THREE.MeshNormalMaterial({
//   transparent: true,
//   opacity: 0.8
// });
// object = new THREE.Mesh(geometry, material);
// object.position.x = 1;
// object.position.y = 0.8;
// markerRoot.add(object);

//animate

const Controller = new function() {
  this.rotationSpeed = 0.02;
  this.bouncingSpeed = 0.02;
}();

const animate = () => {
  step = step + Controller.bouncingSpeed;

  object.rotation.x += Controller.rotationSpeed;

  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

//
init = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
  animate();
};

window.onload = init;

markerRoot1 = scene.getObjectByName("marker1");

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
