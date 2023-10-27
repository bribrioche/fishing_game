import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let camera, scene, renderer;
let controls, water, sun;

init();
animate();

function init() {
  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(30, 30, 100);
  //sounds
  const waterSound = document.getElementById("waterSound");
  const boatSound = document.getElementById("boatSound");
  // Sun

  sun = new THREE.Vector3();

  // Boat
  const fbxLoader = new FBXLoader();
  let boat;

  fbxLoader.load(
    "./3d_models/boat.fbx",
    (object) => {
      boat = object;
      boat.position.set(0, 1.2, 0);
      boat.scale.set(0.01, 0.01, 0.01);
      scene.add(boat);
    },
    function (error) {
      console.error("Erreur de chargement du modèle FBX : ", error);
    }
  );

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "textures/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  const parameters = {
    elevation: 5,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  updateSun();

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  const moveSpeed = 0.5;
  let boatRotation = 0;
  let soundIsPlaying = false;
  const keyState = {};
  waterSound.loop = true;
  boatSound.loop = true;

  // Ajoutez un gestionnaire d'événements pour la touche "ArrowUp" enfoncée
  document.addEventListener("keydown", (event) => {
    keyState[event.key] = true;

    // Si "ArrowUp" est enfoncé et le son n'est pas déjà en cours de lecture, activez le son
    if (event.key === "ArrowUp" && !soundIsPlaying) {
      playBoatSound();
      playWaterSound();
      soundIsPlaying = true;
    }
  });

  // Ajoutez un gestionnaire d'événements pour la touche "ArrowUp" relâchée
  document.addEventListener("keyup", (event) => {
    keyState[event.key] = false;

    // Si la touche "ArrowUp" est relâchée et aucune autre touche "ArrowUp" n'est enfoncée, arrêtez le son
    if (
      event.key === "ArrowUp" &&
      !Object.values(keyState).some((key) => key === true)
    ) {
      stopBoatSound();
      stopWaterSound();
      soundIsPlaying = false;
    }
  });

  function updatePosition() {
    if (keyState["ArrowUp"]) {
      boatSound.volume = 0.15;

      boat.position.z -= Math.sin(boatRotation) * moveSpeed;
      boat.position.x += Math.cos(boatRotation) * moveSpeed;
    }
    if (keyState["ArrowLeft"]) {
      boatSound.volume = 0.2;
      boatRotation += Math.PI / 180;
      boat.rotation.set(0, boatRotation, 0);
    }
    if (keyState["ArrowRight"]) {
      boatSound.volume = 0.2;

      boatRotation -= Math.PI / 180;
      boat.rotation.set(0, boatRotation, 0);
    }
    if (boat) {
      //   camera.lookAt(boat.position);
    }
    requestAnimationFrame(updatePosition);
  }

  const ambientLight = new THREE.AmbientLight(0xffffff, 3); // Couleur et intensité
  scene.add(ambientLight);

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
  const time = performance.now() * 0.001;

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}

function playWaterSound() {
  waterSound.volume = 0.2;
  waterSound.playbackRate = 1;

  waterSound.play().catch((error) => {
    console.error("Erreur de lecture du son : ", error);
  });
}

function playBoatSound() {
  boatSound.volume = 0.1;
  boatSound.playbackRate = 1.1;

  boatSound.play().catch((error) => {
    console.error("Erreur de lecture du son : ", error);
  });
}
function stopWaterSound() {
  waterSound.pause();
  waterSound.currentTime = 0;
}

function stopBoatSound() {
  boatSound.pause();
  boatSound.currentTime = 0;
}
