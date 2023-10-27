import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let camera, scene, renderer;
let controls, water, sun, boat;
// Créez un tableau pour stocker les sphères générées
const spheres = [];

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

  // Fonction pour créer une sphère noire
  function createBlackSphere() {
    if (boat) {
      const geometry = new THREE.SphereGeometry(5, 32, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const sphere = new THREE.Mesh(geometry, material);

      // Positionnez la sphère à une position aléatoire autour du bateau
      const radius = Math.random() * 50 + 50; // Rayon de génération
      const angle = Math.random() * Math.PI * 2;
      const x = boat.position.x + Math.cos(angle) * radius;
      const z = boat.position.z + Math.sin(angle) * radius;
      sphere.scale.set(0.6, 0.1, 0.2);
      sphere.position.set(x, 0, z);
      sphere.rotateY(Math.random() * 180);

      scene.add(sphere);
      spheres.push(sphere);
      if (spheres.length > 5) {
        scene.remove(spheres[0]);
        spheres.shift();
      }
    }
  }

  createBlackSphere();
  // Appelez la fonction pour créer une sphère toutes les 60 secondes (60000 ms)
  setInterval(createBlackSphere, 10000);
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
  updateSpheres();
  detectCollision();
}

function render() {
  const time = performance.now() * 0.001;

  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}

//PLay sounds
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

// Fonction pour mettre à jour les sphères existantes (par exemple, les supprimer si elles sont trop éloignées)
function updateSpheres() {
  const maxDistance = 1000; // Distance maximale avant de supprimer une sphère

  for (let i = spheres.length - 1; i >= 0; i--) {
    const sphere = spheres[i];
    const distance = boat.position.distanceTo(sphere.position);

    if (distance > maxDistance) {
      scene.remove(sphere);
      spheres.splice(i, 1);
    }
  }
}

const messageElement = document.querySelector(".messageElement");

function detectCollision() {
  if (boat) {
    const collisionDistance = 10; // Distance de collision, ajustez selon vos besoins

    // Parcourez toutes les sphères noires
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i];
      const distance = boat.position.distanceTo(sphere.position);

      if (distance < collisionDistance) {
        // Retirez la sphère de la scène et du tableau
        scene.remove(sphere);
        spheres.splice(i, 1);

        // Affichez le message
        messageElement.style.display = "flex";

        // Masquez le message après 3 secondes
        setTimeout(() => {
          messageElement.style.display = "none";
          messageElement.style.pointerEvents = "none";
          startSpacebarChallenge();
        }, 3000);

        // Sortez de la boucle, car une seule collision est gérée à la fois
        break;
      }
    }
  }
}

function startSpacebarChallenge() {
  progressContainer.style.display = "block";

  const goalClicks = 20;
  spacebarClickCount = 0;
  spacebarChallengeCompleted = false;
  progressBar.style.width = "0%";

  document.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      handleSpacebarClick();
    }
  });

  setTimeout(() => {
    if (!spacebarChallengeCompleted) {
      progressContainer.style.display = "none";
    } else {
      showCongratulationsMessage();
    }
  }, 10000); // Arrêtez le défi après 10 secondes
}

const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");

let spacebarClickCount = 0;
let spacebarChallengeCompleted = false;

// Fonction pour incrémenter le compteur de clics sur la barre d'espace
function handleSpacebarClick() {
  spacebarClickCount++;
  updateProgressBar();
}

// Fonction pour mettre à jour la barre de progression
function updateProgressBar() {
  if (!spacebarChallengeCompleted) {
    const goalClicks = 20;
    const percentage = (spacebarClickCount / goalClicks) * 100;
    progressBar.style.width = percentage + "%";

    if (spacebarClickCount >= goalClicks) {
      spacebarChallengeCompleted = true;
      progressBar.style.width = "100%";
      showCongratulationsMessage();
    }
  }
}

// Fonction pour afficher le message de félicitations
function showCongratulationsMessage() {
  messageElement.innerText = "Bravo !";
  messageElement.style.display = "flex";

  const randomString = generateRandomString();

  // Ajouter la chaîne à la liste
  const listContainer = document.getElementById("listContainer");
  const listItem = document.createElement("h2");
  listItem.textContent = randomString;
  listContainer.appendChild(listItem);
}

// Fonction pour générer une chaîne aléatoire
function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 8; // Longueur de la chaîne aléatoire

  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

// Sélectionnez le bouton et la liste
const showListButton = document.getElementById("showListButton");
const listContainer = document.getElementById("listContainer");

// Ajoutez un gestionnaire d'événements pour le bouton
showListButton.addEventListener("click", () => {
  // Basculez la classe "hidden" sur la liste pour l'afficher ou la masquer
  listContainer.classList.toggle("hidden");
});
