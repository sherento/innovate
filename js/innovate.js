//Initilise the scene

let step = 0;
let mltLoader = null;
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

// add a gizmo in the center of the marker
// const geometry = new THREE.DodecahedronGeometry(0.3, 0);
// const material = new THREE.MeshNormalMaterial({
//   transparent: true,
//   opacity: 0.8,
//   side: THREE.DoubleSide
// });
// model = new THREE.Mesh(geometry, material);
// markerRoot.add(model);

const mltLoader = new THREE.MTLLoader();
mtlLoader.load(".mtl", function(materials) {
  materials.preload();
  const objLoader = new THREE.OBJLoader();
  objLoader.setMaterials(materials);

  objLoader.load(".obj", function(mesh) {
    mesh.transverse(function(node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    scene.add(mesh);
    mesh.position.set(-3, 0, 4);
    mesh.rotation.y = -Math.PI / 4;
  });
});
markerRoot.add(mltLoader);

////animate
const Controller = new function() {
  this.rotationSpeed = 0.02;
  this.bouncingSpeed = 0.02;
}();

const animate = () => {
  step = step + Controller.bouncingSpeed;

  mltLoader.rotation.x += Controller.rotationSpeed;

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
