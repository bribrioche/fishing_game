import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water2.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let scene, camera, renderer, water;

const params = {
  color: "#ffffff",
  scale: 4,
  flowX: 1,
  flowY: 1,
};

init();
animate();

function init() {
  // scene

  scene = new THREE.Scene();

  // camera

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(-15, 7, 15);
  camera.lookAt(scene.position);

  // Créez des lignes pour les axes x, y et z
  const axesHelper = new THREE.AxesHelper(10); // Vous pouvez ajuster la longueur des axes selon vos besoins
  scene.add(axesHelper);

  // Boat
  const fbxLoader = new FBXLoader();
  let boat;

  fbxLoader.load("./3d_models/boat.fbx", (object) => {
    boat = object;
    boat.position.set(0, 3.25, 0);
    boat.scale.set(0.01, 0.01, 0.01);
    scene.add(boat);
  });

  // ground

  const groundGeometry = new THREE.PlaneGeometry(2000, 2000);
  const groundMaterial = new THREE.MeshStandardMaterial({
    roughness: 0.8,
    metalness: 0.4,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = Math.PI * -0.5;
  scene.add(ground);

  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(
    "textures/sand/TCom_Nature_SandBeach_1K_albedo.png",
    function (map) {
      map.wrapS = THREE.RepeatWrapping;
      map.wrapT = THREE.RepeatWrapping;
      map.anisotropy = 16;
      map.repeat.set(400, 400);
      map.colorSpace = THREE.SRGBColorSpace;
      groundMaterial.map = map;
      groundMaterial.needsUpdate = true;
    }
  );

  // water

  const waterGeometry = new THREE.PlaneGeometry(2000, 2000);

  water = new Water(waterGeometry, {
    color: "#b6dfe9",
    scale: 10,
    flowDirection: new THREE.Vector2(params.flowX, params.flowY),
    textureWidth: 1024,
    textureHeight: 1024,
  });

  water.position.y = 2;
  water.rotation.x = Math.PI * -0.5;
  scene.add(water);

  // skybox

  //   const cubeTextureLoader = new THREE.CubeTextureLoader();
  //   cubeTextureLoader.setPath("textures/cube/Park2/");

  //   //   const cubeTexture = cubeTextureLoader.load([
  //   //     "posx.jpg",
  //   //     "negx.jpg",
  //   //     "posy.jpg",
  //   //     "negy.jpg",
  //   //     "posz.jpg",
  //   //     "negz.jpg",
  //   //   ]);

  //   scene.background = cubeTexture;

  // light

  const ambientLight = new THREE.AmbientLight(0xe7e7e7, 1.2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-1, 1, 1);
  scene.add(directionalLight);

  // renderer

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // gui

  //   const gui = new GUI();

  //   gui.addColor(params, "color").onChange(function (value) {
  //     water.material.uniforms["color"].value.set(value);
  //   });
  //   gui.add(params, "scale", 1, 10).onChange(function (value) {
  //     water.material.uniforms["config"].value.w = value;
  //   });
  //   gui
  //     .add(params, "flowX", -1, 1)
  //     .step(0.01)
  //     .onChange(function (value) {
  //       water.material.uniforms["flowDirection"].value.x = value;
  //       water.material.uniforms["flowDirection"].value.normalize();
  //     });
  //   gui
  //     .add(params, "flowY", -1, 1)
  //     .step(0.01)
  //     .onChange(function (value) {
  //       water.material.uniforms["flowDirection"].value.y = value;
  //       water.material.uniforms["flowDirection"].value.normalize();
  //     });

  //   gui.open();

  //

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 200;

  const moveSpeed = 0.2;
  let boatRotation = 0;
  const keyState = {};

  document.addEventListener("keydown", (event) => {
    keyState[event.key] = true;
  });

  document.addEventListener("keyup", (event) => {
    keyState[event.key] = false;
  });

  function updatePosition() {
    if (keyState["ArrowUp"]) {
      boat.position.z -= Math.sin(boatRotation) * moveSpeed;
      boat.position.x += Math.cos(boatRotation) * moveSpeed;
    }
    if (keyState["ArrowLeft"]) {
      boatRotation += Math.PI / 180;
      boat.rotation.set(0, boatRotation, 0);
    }
    if (keyState["ArrowRight"]) {
      boatRotation -= Math.PI / 180;
      boat.rotation.set(0, boatRotation, 0);
    }
    requestAnimationFrame(updatePosition);
  }

  updatePosition();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.render(scene, camera);
}
