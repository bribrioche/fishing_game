import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

import splashScreenImg from "/assets/images/splashScreen.png";
import waterNormals from "/assets/textures/waternormals.jpg";
import soundOffImg from "/assets/images/soundOff.png";
import soundOnImg from "/assets/images/soundOn.png";
import spaceBarImg from "/assets/images/spaceBarSpam.png";
import leviathorImg from "/assets/images/leviathor.png";
import starImg from "/assets/images/star.png";
import notificationImg from "/assets/images/notification.png";
import failed from "/assets/images/failed.png";

import unknown from "/assets/images/unknown.png";

import saumon from "/assets/images/saumon.png";
import bar from "/assets/images/bar.png";
import merlan from "/assets/images/merlan.png";
import anguille from "/assets/images/anguille.png";
import morue from "/assets/images/morue.png";
import hareng from "/assets/images/hareng.png";
import anguille_électrique from "/assets/images/anguille électrique.png";
import poisson_globe from "/assets/images/poisson-globe.png";
import dorade from "/assets/images/dorade.png";
import sole from "/assets/images/sole.png";
import tacaud from "/assets/images/tacaud.png";
import maquereau from "/assets/images/maquereau.png";
import sardine from "/assets/images/sardine.png";
import requin_bleu from "/assets/images/requin bleu.png";
import thon_rouge from "/assets/images/thon rouge.png";
import crevette from "/assets/images/crevette.png";
import homard from "/assets/images/homard.png";
import calamar from "/assets/images/calamar.png";
import moule from "/assets/images/moule.png";
import palourde from "/assets/images/palourde.png";
import méduse from "/assets/images/méduse.png";
import poisson_volant from "/assets/images/poisson volant.png";
import poisson_clown from "/assets/images/poisson-clown.png";
import poisson_chirurgien from "/assets/images/poisson-chirurgien.png";
import marlin from "/assets/images/marlin.png";
import orque from "/assets/images/orque.png";
import oursin from "/assets/images/oursin.png";
import scalaire from "/assets/images/scalaire.png";
import poisson_flute from "/assets/images/poisson-flûte.png";
import raie_manta from "/assets/images/raie manta.png";

import saumonS from "/assets/images/shiny/saumon.png";
import barS from "/assets/images/shiny/bar.png";
import merlanS from "/assets/images/shiny/merlan.png";
import anguilleS from "/assets/images/shiny/anguille.png";
import morueS from "/assets/images/shiny/morue.png";
import harengS from "/assets/images/shiny/hareng.png";
import anguille_électriqueS from "/assets/images/shiny/anguille électrique.png";
import poisson_globeS from "/assets/images/shiny/poisson-globe.png";
import doradeS from "/assets/images/shiny/dorade.png";
import soleS from "/assets/images/shiny/sole.png";
import tacaudS from "/assets/images/shiny/tacaud.png";
import maquereauS from "/assets/images/shiny/maquereau.png";
import sardineS from "/assets/images/shiny/sardine.png";
import requin_bleuS from "/assets/images/shiny/requin bleu.png";
import thon_rougeS from "/assets/images/shiny/thon rouge.png";
import crevetteS from "/assets/images/shiny/crevette.png";
import homardS from "/assets/images/shiny/homard.png";
import calamarS from "/assets/images/shiny/calamar.png";
import mouleS from "/assets/images/shiny/moule.png";
import palourdeS from "/assets/images/shiny/palourde.png";
import méduseS from "/assets/images/shiny/méduse.png";
import poisson_volantS from "/assets/images/shiny/poisson volant.png";
import poisson_clownS from "/assets/images/shiny/poisson-clown.png";
import poisson_chirurgienS from "/assets/images/shiny/poisson-chirurgien.png";
import marlinS from "/assets/images/shiny/marlin.png";
import orqueS from "/assets/images/shiny/orque.png";
import oursinS from "/assets/images/shiny/oursin.png";
import scalaireS from "/assets/images/shiny/scalaire.png";
import poisson_fluteS from "/assets/images/shiny/poisson-flûte.png";
import raie_mantaS from "/assets/images/shiny/raie manta.png";

import unknownTrophy from "/assets/images/trophies/unknown.png";
import escapedTrophy from "/assets/images/trophies/50_escaped.png";
import hundredPercentTrophy from "/assets/images/trophies/100.png";
import hundredkmTrophy from "/assets/images/trophies/100km.png";
import allShiniesTrophy from "/assets/images/trophies/allShinies.png";
import bigOneTrophy from "/assets/images/trophies/big.png";
import firstOneTrophy from "/assets/images/trophies/first.png";
import hundredTrophy from "/assets/images/trophies/hundred.png";
import leviathorTrophy from "/assets/images/trophies/leviathor_shiny.png";
import shinyTrophy from "/assets/images/trophies/shiny.png";

let camera, scene, renderer;
let controls, water, sun, boat;

let imageSrc = "";
let imageShinySrc = "";

let moveSpeed = 0.5;
let boatRotation = 0;
let counter = 0;

let spheres = [];
let fishForSpheres = [];
let colors = [];

let poissonsPeches = {};

let spacebarChallengeCompleted = true;
let isLeviathorCaught = false;
let isClicked = false;
let spacebarGameRunning = false;
let moreThan100km = false;
let soundOn = true;

let randomFish;
let timer;
let timeout;
let timeoutMessage;
let verticalBarAnimation;
let timoutEndDisplay;

let fishingStats = {
  escapedFish: 0,
  distanceTraveled: 0,
  isLeviathorCaught: false,
  firstCaught: false,
  hundredCaught: false,
  oneShiny: false,
  allShiny: false,
  allTypesCaught: false,
  hundredKm: false,
  fiftyEscapedFish: false,
  isLeviathorCaught: false,
  bigOne: false,
};
const poissonsDeMerAvecPourcentage = [
  { nom: "saumon", pourcentage: 10, tailleMinimale: 45, tailleMaximale: 150 },
  { nom: "bar", pourcentage: 15, tailleMinimale: 40, tailleMaximale: 100 },
  { nom: "merlan", pourcentage: 20, tailleMinimale: 30, tailleMaximale: 70 },
  { nom: "anguille", pourcentage: 8, tailleMinimale: 40, tailleMaximale: 150 },
  { nom: "morue", pourcentage: 5, tailleMinimale: 50, tailleMaximale: 180 },
  { nom: "hareng", pourcentage: 12, tailleMinimale: 20, tailleMaximale: 40 },
  {
    nom: "anguille électrique",
    pourcentage: 3,
    tailleMinimale: 170,
    tailleMaximale: 250,
  },
  {
    nom: "poisson-globe",
    pourcentage: 4,
    tailleMinimale: 12,
    tailleMaximale: 40,
  },
  { nom: "dorade", pourcentage: 6, tailleMinimale: 40, tailleMaximale: 70 },
  { nom: "sole", pourcentage: 18, tailleMinimale: 25, tailleMaximale: 70 },
  { nom: "tacaud", pourcentage: 7, tailleMinimale: 21, tailleMaximale: 40 },
  {
    nom: "maquereau",
    pourcentage: 9,
    tailleMinimale: 30,
    tailleMaximale: 60,
  },
  { nom: "sardine", pourcentage: 16, tailleMinimale: 11, tailleMaximale: 15 },
  {
    nom: "requin bleu",
    pourcentage: 2,
    tailleMinimale: 180,
    tailleMaximale: 383,
  },
  {
    nom: "thon rouge",
    pourcentage: 2,
    tailleMinimale: 150,
    tailleMaximale: 300,
  },
  {
    nom: "crevette",
    pourcentage: 14,
    tailleMinimale: 3,
    tailleMaximale: 5,
  },
  { nom: "homard", pourcentage: 11, tailleMinimale: 25, tailleMaximale: 60 },
  {
    nom: "calamar",
    pourcentage: 13,
    tailleMinimale: 1200,
    tailleMaximale: 1400,
  },
  { nom: "moule", pourcentage: 17, tailleMinimale: 4, tailleMaximale: 5 },
  { nom: "palourde", pourcentage: 19, tailleMinimale: 3.5, tailleMaximale: 4 },
  { nom: "méduse", pourcentage: 12, tailleMinimale: 25, tailleMaximale: 40 },
  {
    nom: "marlin",
    pourcentage: 2,
    tailleMinimale: 2000,
    tailleMaximale: 4600,
  },
  {
    nom: "poisson volant",
    pourcentage: 7,
    tailleMinimale: 15,
    tailleMaximale: 30,
  },
  {
    nom: "poisson-chirurgien",
    pourcentage: 5,
    tailleMinimale: 23,
    tailleMaximale: 27,
  },
  {
    nom: "poisson-clown",
    pourcentage: 11,
    tailleMinimale: 7,
    tailleMaximale: 15,
  },
  { nom: "orque", pourcentage: 2, tailleMinimale: 5000, tailleMaximale: 8000 },
  {
    nom: "raie manta",
    pourcentage: 8,
    tailleMinimale: 4000,
    tailleMaximale: 5000,
  },
  {
    nom: "poisson-flûte",
    pourcentage: 10,
    tailleMinimale: 100,
    tailleMaximale: 160,
  },
  { nom: "scalaire", pourcentage: 8, tailleMinimale: 12, tailleMaximale: 15 },
  { nom: "oursin", pourcentage: 18, tailleMinimale: 3.5, tailleMaximale: 5 },
];

const chanceforShiny = 5;
const chanceforLeviathor = 0.5;
const distanceForAchievement = 10000;
const escapedFishForAchievement = 50;

const soundBtn = document.getElementById("soundBtn");
const soundImage = document.getElementById("soundImg");
const fishDetails = document.getElementById("fishDetails");
const fishDetailImage = document.getElementById("fishDetailImage");
const fishDetailImageShiny = document.getElementById("fishDetailImageShiny");
const fishDetailName = document.getElementById("fishDetailName");
const fishDetailCount = document.getElementById("fishDetailCount");
const fishPercent = document.getElementById("fishPercent");
const fishMaxSize = document.getElementById("fishMaxSize");
const showListButton = document.getElementById("showListButton");
const showAchievementsButton = document.getElementById(
  "showAchievementsButton"
);
const listContainer = document.getElementById("listContainer");
const achievementListElement = document.getElementById(
  "achievementListElement"
);
const horizontalBarContainer = document.querySelector(
  ".horizontal-bar-container"
);
const counterElement = document.getElementById("counter");
const fishGrid = document.querySelector(".fish-grid");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const messageElement = document.querySelector(".messageElement");
const verticalBar = document.querySelector(".vertical-bar");
const imgRecord = document.querySelector(".imgRecord");
const imgShiny = document.querySelector(".imgShiny");
const detailNewFish = document.querySelector(".detailNewFish");
const txtNewFish = document.querySelector(".txtFish");

splashScreen();
init();
animate();
playMusic();

//#########################################################region Init##################################################
function init() {
  fishDetails.classList.add("hidden");
  progressContainer.style.display = "none";

  // Save
  const poissonsPechesStr = localStorage.getItem("poissonsPeches");
  const progressionStr = localStorage.getItem("fishingStats");

  if (progressionStr) {
    fishingStats = JSON.parse(progressionStr);
    if (fishingStats.distanceTraveled >= distanceForAchievement) {
      moreThan100km = true;
    }
    if (fishingStats.isLeviathorCaught) {
      isLeviathorCaught = true;
    }
  }

  if (poissonsPechesStr) {
    poissonsPeches = JSON.parse(poissonsPechesStr);
    updateFishingList();
    updateProgression();
  } else {
    setEmptyFishingList();
  }

  getAllAchievements();
  // Init
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();

  scene.matrixWorldAutoUpdate = true;

  // Camera
  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(30, 30, 100);

  // Sounds
  const waterSound = document.getElementById("waterSound");
  const boatSound = document.getElementById("boatSound");

  // Sun
  sun = new THREE.Vector3();

  // Boat
  const fbxLoader = new FBXLoader();

  fbxLoader.load(
    "https://raw.githubusercontent.com/bribrioche/fishing_game/main/assets/3d_models/boat.fbx",
    (object) => {
      boat = object;
      boat.position.set(0, 1.2, 0);
      boat.scale.set(0.01, 0.01, 0.01);
      scene.add(boat);
    },
    (xhr) => {},
    function (error) {
      console.error("Erreur de chargement du modèle FBX : ", error);
    }
  );

  // Water
  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 256,
    textureHeight: 256,
    waterNormals: new THREE.TextureLoader().load(
      waterNormals,
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

  skyUniforms["turbidity"].value = 0;
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
    const theta = THREE.MathUtils.degToRad(parameters.azimuth / 2);

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

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  waterSound.loop = true;
  boatSound.loop = true;

  // Listeners
  showListButton.addEventListener("click", () => {
    const achievementsIsHidden =
      achievementListElement.classList.contains("hidden");

    if (!achievementsIsHidden) {
      achievementListElement.classList.add("hidden");
      showAchievementsButton.classList.remove("clicked");
    }

    listContainer.classList.toggle("hidden");
    showListButton.classList.toggle("clicked");
  });

  showAchievementsButton.addEventListener("click", () => {
    const listIsHidden = listContainer.classList.contains("hidden");

    if (!listIsHidden) {
      listContainer.classList.add("hidden");
      showListButton.classList.remove("clicked");
    }

    achievementListElement.classList.toggle("hidden");
    showAchievementsButton.classList.toggle("clicked");
  });

  soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    if (soundOn) {
      soundImage.src = soundOnImg;
    } else {
      soundImage.src = soundOffImg;
    }
    setAllSoundVolume(soundOn);
  });

  window.addEventListener("resize", onWindowResize);

  let movingForward = false;
  let movingLeft = false;
  let movingRight = false;

  const handleKeyDown = (event) => {
    if (spacebarChallengeCompleted) {
      if (event.key === "ArrowUp" || event.key === "z") {
        movingForward = true;
      }
      if (event.key === "ArrowLeft" || event.key === "q") {
        movingLeft = true;
      }
      if (event.key === "ArrowRight" || event.key === "d") {
        movingRight = true;
      }
      if (event.key === "v") {
        moveSpeed = 1;
      }
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "ArrowUp" || event.key === "z") {
      movingForward = false;
    }
    if (event.key === "ArrowLeft" || event.key === "q") {
      movingLeft = false;
    }
    if (event.key === "ArrowRight" || event.key === "d") {
      movingRight = false;
    }
    if (event.key === "v") {
      moveSpeed = 0.5;
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  const handleEscape = (event) => {
    if (event.key === "Escape" && spacebarGameRunning) {
      endFishing();
    }
  };

  document.addEventListener("keydown", handleEscape);

  function updatePosition() {
    if (spacebarChallengeCompleted) {
      if (movingForward) {
        boat.position.z -= Math.sin(boatRotation) * moveSpeed;
        boat.position.x += Math.cos(boatRotation) * moveSpeed;
        fishingStats.distanceTraveled += moveSpeed;
        localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
        if (
          fishingStats.distanceTraveled >= distanceForAchievement &&
          !moreThan100km
        ) {
          getAllAchievements();
          moreThan100km = true;
        }
      }
      if (movingLeft) {
        boatRotation += (Math.PI / 180) * (moveSpeed * 2);
        boat.rotation.set(0, boatRotation, 0);
      }
      if (movingRight) {
        boatRotation -= (Math.PI / 180) * (moveSpeed * 2);
        boat.rotation.set(0, boatRotation, 0);
      }
    }

    if (boat) {
      const cameraDistance = 80;
      camera.position.x = boat.position.x + cameraDistance;
      camera.position.y = boat.position.y + cameraDistance;
      camera.position.z = boat.position.z + cameraDistance;
      camera.lookAt(boat.position);
    }
    requestAnimationFrame(updatePosition.bind(this));
  }

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  setInterval(createBlackSphere, 3000);
  updatePosition();

  getAllAchievements();
  setAllSoundVolume(soundOn);
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
//#########################################################endregion#########################################################

//#########################################################region Spheres####################################################
function createBlackSphere() {
  if (boat) {
    const newRandomFish = chaineAleatoireAvecPourcentage(
      poissonsDeMerAvecPourcentage
    );
    // console.log(newRandomFish);
    const selectedFish = poissonsDeMerAvecPourcentage.find(
      (fish) => fish.nom === newRandomFish
    );
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sphere = new THREE.Mesh(geometry, material);

    const radius = Math.random() * 50 + 50;
    const angle = Math.random() * Math.PI * 2;
    const x = boat.position.x + Math.cos(angle) * radius;
    const z = boat.position.z + Math.sin(angle) * radius;
    let newSize = 1;
    if (selectedFish.pourcentage < 3) {
      newSize *= 1.4;
    }
    if (selectedFish.pourcentage < 8) {
      newSize *= 1.2;
    }
    sphere.scale.set(0.6 * newSize, 0.1 * newSize, 0.2 * newSize);
    sphere.position.set(x, 0, z);
    sphere.rotateY(Math.random() * 180);
    sphere.material.transparent = true;
    sphere.material.opacity = 1;

    scene.add(sphere);
    spheres.push([sphere, newRandomFish]);
    if (spheres.length > 15) {
      scene.remove(spheres[0][0]);
      spheres.shift();
    }
  }
}

function updateSpheres() {
  const maxDistance = 1000;

  if (spheres.length > 0) {
    for (let i = spheres.length - 1; i >= 0; i--) {
      const sphere = spheres[i][0];
      const distance = boat.position.distanceTo(sphere.position);

      if (distance > maxDistance) {
        spliceAndDeleteSphere(i, "to much spheres");
      }
    }
  }
}

function detectCollision() {
  if (boat) {
    const collisionDistance = 10;

    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i][0];
      const distance = boat.position.distanceTo(sphere.position);

      if (distance < collisionDistance && !sphere.caught && moveSpeed < 0.9) {
        randomFish = spheres[i][1];
        messageElement.style.display = "flex";
        const image = document.getElementById("randomImage");
        image.src = spaceBarImg;
        spliceAndDeleteSphere(i, "Start mini Game");

        if (spacebarChallengeCompleted) {
          spacebarChallengeCompleted = false;
        }

        timeoutMessage = setTimeout(() => {
          messageElement.style.display = "none";
          messageElement.style.pointerEvents = "none";
          startSpacebarChallenge(i);
        }, 1000);

        break;
      } else if (
        distance < collisionDistance * 2 &&
        !sphere.caught &&
        moveSpeed > 0.9
      ) {
        fishEscape(sphere, i);
        sphere.caught = true;
        break;
      }
    }
  }
}

function fishEscape(sphere, pos) {
  if (!sphere.caught) {
    const opaciteDiminution = 0.2;
    const diminutionInterval = 10;
    const tempsTotal = 100;

    const nombreIterations = tempsTotal / diminutionInterval;
    const opaciteDelta = opaciteDiminution / nombreIterations;

    const deplacementDistance = 0.5;

    const direction = new THREE.Vector3(0, 0, 1);

    const intervalID = setInterval(function () {
      sphere.material.opacity -= opaciteDelta;

      if (sphere.material.opacity <= 0) {
        fishingStats.escapedFish++;
        localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
        if (
          fishingStats.escapedFish >= escapedFishForAchievement &&
          fishingStats.fiftyEscapedFish === false
        ) {
          getAllAchievements();
        }
        clearInterval(intervalID);
        spliceAndDeleteSphere(pos, "opacity");
      } else {
        const deplacement = direction
          .clone()
          .multiplyScalar(deplacementDistance);
        sphere.position.add(deplacement);

        const angle = Math.atan2(direction.z, direction.x);
        sphere.rotation.y = angle;
      }
    }, diminutionInterval);
  }
}

function spliceAndDeleteSphere(pos, text) {
  if (pos >= 0 && pos < spheres.length) {
    const removedSphere = spheres.splice(pos, 1)[0];
    if (removedSphere) {
      scene.remove(removedSphere[0]);
    }
  }
}
//#########################################################endregion#########################################################

//#########################################################region Mini-Game##################################################
function startSpacebarChallenge(fishPos) {
  progressContainer.style.display = "block";

  let timeRemaining = 10;

  updateRemainingTime(timeRemaining);

  if (!spacebarGameRunning) {
    document.addEventListener("keydown", handleSpacebarClick);
    spacebarGameRunning = true;
  }

  //Update Time Remaining
  timer = setInterval(() => {
    timeRemaining--;
    if (timeRemaining >= 0) {
      updateRemainingTime(timeRemaining);
    }
  }, 1000);

  counter = 0;
  setSegmentSize();

  startVerticalBarAnimation();

  // Stop after 10 sec
  timeout = setTimeout(() => {
    clearInterval(timer);
    if (!spacebarChallengeCompleted) {
      const image = document.getElementById("randomImage");
      image.src = failed;

      document.removeEventListener("keydown", handleSpacebarClick);
      spacebarGameRunning = false;

      messageElement.style.display = "flex";
      progressContainer.style.display = "none";
      setTimeout(() => {
        messageElement.style.display = "none";
        spacebarChallengeCompleted = true;
      }, 3000);
    }
  }, 10000);
}

let animationInterval;
function startVerticalBarAnimation() {
  const speed = setSpeed(randomFish);
  const containerWidth = horizontalBarContainer.offsetWidth;
  let position = 0;
  let direction = 1;

  animationInterval = setInterval(() => {
    verticalBar.style.left = position + "px";

    if (position >= containerWidth) {
      direction = -1;
    } else if (position <= 0) {
      direction = 1;
    }

    position += direction * speed;
  }, 10);

  verticalBarAnimation = setTimeout(() => {
    clearInterval(animationInterval);
  }, 10000);
}

function getColorForPosition(position, containerWidth, colors) {
  let currentPosition = 0;

  for (let i = 0; i < colors.length; i++) {
    const segmentWidth = (containerWidth * colors[i].pourcentage) / 100;
    if (
      position >= currentPosition &&
      position <= currentPosition + segmentWidth
    ) {
      return colors[i].color;
    }

    currentPosition += segmentWidth;
  }

  return null;
}

function updateCounter(color) {
  if (color === "green") {
    counter++;
  } else if (color === "red" && counter > 0) {
    counter--;
  }

  switch (counter) {
    case 1:
      counterElement.textContent = "Moulinez !";
      break;

    case 2:
      counterElement.textContent = "Relevez !";
      break;

    case 3:
      counterElement.textContent = "Ferrez !";
      counter == 0;
      break;
  }
}

document.addEventListener("keyup", function (event) {
  if (event.code === "Space" && isClicked) {
    isClicked = false;
  }
});

function handleSpacebarClick(event) {
  if (event.key === " " && !isClicked && counter < 3) {
    const position = verticalBar.offsetLeft;
    isClicked = true;

    const horizontalBarContainer = document.querySelector(
      ".horizontal-bar-container"
    );
    const containerWidth = horizontalBarContainer.offsetWidth;

    const color = getColorForPosition(position, containerWidth, colors);

    updateCounter(color);

    if (counter == 3) {
      counter++;
      showCongratulationsMessage();
    }
  }
}

function updateRemainingTime(timeRemaining) {
  document.getElementById("timeRemaining").textContent = `${timeRemaining}s`;
}

function endFishing() {
  clearTimeout(timeout);
  clearInterval(timer);
  clearTimeout(verticalBarAnimation);
  clearTimeout(timeoutMessage);
  clearTimeout(timoutEndDisplay);

  clearInterval(animationInterval);

  progressContainer.style.display = "none";

  imgRecord.style.display = "none";
  imgShiny.style.display = "none";
  messageElement.style.display = "none";
  detailNewFish.style.display = "none";
  randomImage.src = spaceBarImg;
  spacebarChallengeCompleted = true;
}

function showCongratulationsMessage() {
  clearTimeout(timeout);
  clearInterval(timer);
  clearTimeout(verticalBarAnimation);

  clearInterval(animationInterval);

  const fishData = poissonsDeMerAvecPourcentage.find(
    (fish) => fish.nom === randomFish
  );
  const randomSize = generateRandomSize(
    fishData.tailleMinimale,
    fishData.tailleMaximale
  );

  const randomImage = document.getElementById("randomImage");
  const chance = getRandomInRange(0, 100);
  let chanceforShinyCalculated = chanceforShiny * 1;
  const poissonsPechesArray = Object.values(poissonsPeches);
  let total = 0;
  poissonsPechesArray.forEach((fish) => {
    total += fish.peches;
  });

  if (total > 100) chanceforShinyCalculated = chanceforShiny * 1.5;
  if (total > 500) chanceforShinyCalculated = chanceforShiny * 2;
  if (total > 1000) chanceforShinyCalculated = chanceforShiny * 2.5;
  if (total > 1300) chanceforShinyCalculated = chanceforShiny * 3;

  const isShiny = chance < chanceforShinyCalculated;
  const chanceLeviathor = getRandomInRange(0, 100);
  const isLeviathor = chanceLeviathor < chanceforLeviathor;

  const image = document.createElement("img");
  image.classList.add("fish-image");

  if (isLeviathor) {
    randomImage.src = leviathorImg;
    txtNewFish.textContent = "Leviathor Shiny - Wow !";
    isLeviathorCaught = true;
    localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    getAllAchievements();
  } else {
    if (isShiny) {
      loadShinyPoissonImage(randomFish);

      randomImage.src = imageShinySrc;
    } else {
      loadPoissonImage(randomFish);
      randomImage.src = imageSrc;
    }

    if (poissonsPeches[randomFish]) {
      // Already caught
      poissonsPeches[randomFish].peches++;

      if (isShiny) {
        poissonsPeches[randomFish].shiny = true;
        imgShiny.style.display = "block";
      }

      if (poissonsPeches[randomFish].taille < randomSize) {
        imgRecord.style.display = "block";
      }

      poissonsPeches[randomFish].taille = Math.max(
        poissonsPeches[randomFish].taille,
        randomSize
      );
    } else {
      // First time
      poissonsPeches[randomFish] = { taille: randomSize, peches: 1 };
      if (isShiny) {
        poissonsPeches[randomFish].shiny = true;
      }
      imgRecord.style.display = "block";
    }
    txtNewFish.textContent =
      randomFish.charAt(0).toUpperCase() +
      randomFish.substring(1) +
      " - " +
      randomSize +
      " cm";

    updateFishingList();
    getAllAchievements();
    updateProgression();

    localStorage.setItem("poissonsPeches", JSON.stringify(poissonsPeches));
  }

  messageElement.style.display = "flex";
  progressContainer.style.display = "none";
  detailNewFish.style.display = "flex";

  timoutEndDisplay = setTimeout(() => {
    imgRecord.style.display = "none";
    imgShiny.style.display = "none";
    messageElement.style.display = "none";
    detailNewFish.style.display = "none";
    randomImage.src = spaceBarImg;
    spacebarChallengeCompleted = true;
  }, 2000);
}

function setSegmentSize() {
  const selectedFish = poissonsDeMerAvecPourcentage.find(
    (fish) => fish.nom === randomFish
  );
  const selectedFishPercentage = selectedFish ? selectedFish.pourcentage : 0;

  const middleSegment = document.querySelector(".segment-3");
  const adjacentSegment1 = document.querySelector(".segment-2");
  const adjacentSegment2 = document.querySelector(".segment-4");
  const newWidth = selectedFishPercentage * 2.5;

  middleSegment.style.width = newWidth + "%";
  const adjacentWidth = (100 - newWidth - 20) / 2;

  middleSegment.style.width = newWidth + "%";
  adjacentSegment1.style.width = adjacentWidth + "%";
  adjacentSegment2.style.width = adjacentWidth + "%";
  colors = [
    { color: "red", pourcentage: 10 },
    { color: "orange", pourcentage: adjacentWidth },
    { color: "green", pourcentage: newWidth },
    { color: "orange", pourcentage: adjacentWidth },
    { color: "red", pourcentage: 10 },
  ];
}
//#########################################################endregion#########################################################

//#########################################################region Confetti###################################################
function createConfetti() {
  const confetti = document.createElement("div");
  confetti.className = "confetti";

  // Random Color
  confetti.style.backgroundColor = `rgb(${Math.random() * 255}, ${
    Math.random() * 255
  }, ${Math.random() * 255})`;

  // Random Position
  confetti.style.top = "-50px";
  confetti.style.left = `${getRandomInRange(0, window.innerWidth)}px`;

  // Définir la vitesse de rotation aléatoire
  const rotationSpeed = getRandomInRange(-0.2, 0.2);
  confetti.setAttribute("data-rotation-speed", rotationSpeed);

  document.body.appendChild(confetti);

  animateConfetti(confetti);
}

function animateConfetti(confetti) {
  const fallSpeed = getRandomInRange(3, 6);
  let rotation = getRandomInRange(0, 1);

  function fall() {
    const confettiTop = parseFloat(confetti.style.top);
    const newTop = confettiTop + fallSpeed;

    if (newTop < window.innerHeight) {
      confetti.style.top = `${newTop}px`;

      const rotationSpeed = getRandomInRange(0.009, 0.015);

      rotation += rotationSpeed;
      confetti.style.transform = `rotate(${rotation}turn)`;

      requestAnimationFrame(fall);
    } else {
      document.body.removeChild(confetti);
    }
  }

  fall();
}

function launchConfetti() {
  const confettiCount = 150;

  for (let i = 0; i < confettiCount; i++) {
    createConfetti();
  }
}
//#########################################################endregion#########################################################

//#########################################################region SplashScreen###############################################
function splashScreen() {
  document.addEventListener("DOMContentLoaded", () => {
    const loadingBar = document.querySelector(".loading-bar");
    const splashScreen = document.querySelector(".splashScreen");

    let width = 0;
    const duration = 500;
    const interval = 10;
    const increment = (interval / duration) * 100;
    let currentPercent = 0;

    function updateLoadingProgressBar() {
      if (width >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          splashScreen.style.opacity = 0;
          setTimeout(() => {
            splashScreen.style.display = "none";
          }, 1000);
        }, 1000);
      } else {
        width += increment;
        currentPercent += increment;
        loadingBar.style.width = `${width}%`;
      }
    }

    const loadingInterval = setInterval(updateLoadingProgressBar, interval);
  });
}
//#########################################################endregion#########################################################

//#########################################################region Sound######################################################
function playWaterSound() {
  waterSound.playbackRate = 1;

  waterSound.play().catch((error) => {
    console.error("Erreur de lecture du son : ", error);
  });
}

function playBoatSound() {
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

function playBubbleSound() {
  funkyAudio.volume = 0.8;
  funkyAudio.playbackRate = 1.1;

  funkyAudio.play().catch((error) => {
    console.error("Erreur de lecture du son : ", error);
  });
}

function playMusic() {
  music.volume = 0.5;
  music.playbackRate = 1.1;
  music.loop = true;
  music.play().catch((error) => {
    console.error("Erreur de lecture du son : ", error);
  });
}

function setAllSoundVolume(isOn) {
  if (isOn) {
    music.volume = 0.5;
    waterSound.volume = 0.2;
    boatSound.volume = 0.1;
    funkyAudio.volume = 0.8;
  } else {
    music.volume = 0;
    waterSound.volume = 0;
    boatSound.volume = 0;
    funkyAudio.volume = 0;
  }
}
//#########################################################endregion#########################################################

//#########################################################region Html_Modifiers#############################################
function setEmptyFishingList() {
  for (let i = 0; i < poissonsDeMerAvecPourcentage.length; i++) {
    const fishItem = document.createElement("div");
    fishItem.classList.add("fish-item");

    const image = document.createElement("img");
    image.classList.add("fish-image");
    image.src = unknown;
    image.alt = "???";

    const text = document.createElement("p");
    text.classList.add("fish-name");
    text.textContent = "???";

    fishItem.appendChild(image);
    fishItem.appendChild(text);
    fishGrid.appendChild(fishItem);
  }
}

function updateFishingList() {
  // Erase current grid
  fishGrid.innerHTML = "";

  for (const poisson in poissonsPeches) {
    const fishItem = document.createElement("div");
    fishItem.classList.add("fish-item");

    const image = document.createElement("img");
    image.classList.add("fish-image");
    loadPoissonImage(poisson);
    image.src = imageSrc;
    image.alt = poisson;

    const textContainer = document.createElement("div");
    textContainer.classList.add("fish-text-container");

    if (poissonsPeches[poisson].shiny) {
      const shinyStar = document.createElement("img");
      shinyStar.classList.add("shiny-icon");
      shinyStar.src = starImg;
      shinyStar.alt = "Shiny";
      textContainer.appendChild(shinyStar);
    }

    const text = document.createElement("p");
    text.classList.add("fish-name");
    text.textContent = upcaseFirstLetter(poisson);

    textContainer.appendChild(text);
    fishItem.appendChild(image);
    fishItem.appendChild(textContainer);
    fishGrid.appendChild(fishItem);
  }

  for (
    let i = 0;
    i <
    poissonsDeMerAvecPourcentage.length - Object.keys(poissonsPeches).length;
    i++
  ) {
    const fishItem = document.createElement("div");
    fishItem.classList.add("fish-item");

    const image = document.createElement("img");
    image.classList.add("fish-image");
    image.src = unknown;
    image.alt = "???";

    const text = document.createElement("p");
    text.classList.add("fish-name");
    text.textContent = "???";

    fishItem.appendChild(image);
    fishItem.appendChild(text);
    fishGrid.appendChild(fishItem);
  }

  const fishItems = document.querySelectorAll(".fish-item");

  fishItems.forEach((fishItem) => {
    fishItem.addEventListener("mouseover", () => {
      let fishFound;
      for (const poisson in poissonsPeches) {
        if (fishItem.textContent == upcaseFirstLetter(poisson)) {
          fishFound = poisson;
        }
      }

      if (fishFound) {
        const fishCount = poissonsPeches[fishFound].peches || 0;
        loadPoissonImage(fishFound);
        loadShinyPoissonImage(fishFound);
        const fishImageSrc = imageSrc;
        const fishImageShinySrc = imageShinySrc;
        const fishName = fishFound;
        const fishSize = poissonsPeches[fishFound].taille;

        // Search current fish
        let fishPourcentage = 0;
        for (const fish of poissonsDeMerAvecPourcentage) {
          if (fish.nom === fishName) {
            fishPourcentage = fish.pourcentage;
            break;
          }
        }

        fishDetailName.textContent = fishName.toLocaleUpperCase();
        if (fishCount > 1) {
          fishDetailCount.textContent =
            upcaseFirstLetter(plural(fishName)) + " pêché(e)s : " + fishCount;
        } else {
          fishDetailCount.textContent =
            upcaseFirstLetter(fishName) + " pêché(e) : " + fishCount;
        }

        fishDetailImage.src = fishImageSrc;
        if (poissonsPeches[fishFound].shiny) {
          fishDetailImageShiny.style.display = "";

          fishDetailImageShiny.src = fishImageShinySrc;
        } else {
          fishDetailImageShiny.style.display = "none";
        }
        let rarity = "";
        if (fishPourcentage < 3) {
          rarity = "Legendaire";
        } else if (fishPourcentage < 5) {
          rarity = "Très rare";
        } else if (fishPourcentage < 10) {
          rarity = "Rare";
        } else if (fishPourcentage < 15) {
          rarity = "Peu commun";
        } else {
          rarity = "Commun";
        }
        fishPercent.textContent = "Rareté : " + rarity;
        fishMaxSize.textContent = "Taille max. obtenue : " + fishSize + " cm";
      } else {
        const fishName = "???";
        const fishImageSrc = unknown;

        fishDetailName.textContent = fishName;
        fishDetailCount.textContent = "???";
        fishDetailImage.src = fishImageSrc;
        fishPercent.textContent = "???";
        fishMaxSize.textContent = "???";
      }

      fishDetails.classList.remove("hidden");
    });

    fishItem.addEventListener("mouseout", () => {
      fishDetails.classList.add("hidden");
    });
  });
}

function updateProgression() {
  const fishProgressContainer = document.querySelector(
    ".fish-progress-container"
  );
  const fishProgressBar = document.querySelector(".fish-progress-bar");
  const fishProgressBar2 = document.querySelector(".fish-progress-bar2");
  const fishProgressPercent = document.querySelector(".text");

  const numberOfFishTypes = Object.keys(poissonsPeches).length;
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100;
  fishProgressBar.style.width = percentage + "%";

  const poissonsPechesArray = Object.values(poissonsPeches);
  let numberOfFishShiny = 0;
  for (let index = 0; index < poissonsPechesArray.length; index++) {
    if (poissonsPechesArray[index].shiny) {
      numberOfFishShiny++;
    }
  }
  const percentageShiny =
    (numberOfFishShiny / poissonsDeMerAvecPourcentage.length) * 100;
  fishProgressBar2.style.width = percentageShiny + "%";

  let total = 0;
  poissonsPechesArray.forEach((fish) => {
    total += fish.peches;
  });

  fishProgressPercent.textContent =
    percentage.toFixed(0) + "%" + " (" + total + ")";
}

function addAchievementToHTML(title, imagePath, description) {
  const achievementDiv = document.createElement("div");
  achievementDiv.classList.add("achievement-item");

  const imageElement = document.createElement("img");
  imageElement.classList.add("achievement-item-image");
  imageElement.src = imagePath;
  imageElement.alt = title;

  const textContainer = document.createElement("div");
  textContainer.classList.add("achievement-text-container");

  const titleElement = document.createElement("h3");
  titleElement.classList.add("achievement-item-title");
  titleElement.textContent = title;

  const descriptionElement = document.createElement("p");
  descriptionElement.classList.add("achievement-item-description");
  descriptionElement.textContent = description;

  textContainer.appendChild(titleElement);
  textContainer.appendChild(descriptionElement);

  achievementDiv.appendChild(imageElement);
  achievementDiv.appendChild(textContainer);

  achievementListElement.appendChild(achievementDiv);
}

//#########################################################endregion#########################################################

//#########################################################region Achievements###############################################
function getAllAchievements() {
  const poissonsPechesArray = Object.values(poissonsPeches);

  achievementListElement.innerHTML = "";
  const numberOfFishTypes = Object.keys(poissonsPeches).length;

  //1st fish caught
  if (poissonsPechesArray.length > 0) {
    addAchievementToHTML(
      "Première touche !",
      firstOneTrophy,
      "Vous avez pêché votre premier poisson"
    );
    if (!fishingStats.firstCaught) {
      showNewAchievementNotification();
      fishingStats.firstCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //100 fish caught
  let total = 0;
  poissonsPechesArray.forEach((fish) => {
    total += fish.peches;
  });
  if (total >= 100) {
    addAchievementToHTML(
      "Pêche en grande quantité",
      hundredTrophy,
      "Vous avez pêché 100 poissons"
    );
    if (!fishingStats.hundredCaught) {
      showNewAchievementNotification();
      fishingStats.hundredCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //shiny
  const oneShinyCaught = poissonsPechesArray.some(
    (fish) => fish.shiny === true
  );
  if (oneShinyCaught) {
    addAchievementToHTML(
      "First shiny",
      shinyTrophy,
      "Vous avez pêché un shiny"
    );
    if (!fishingStats.oneShiny) {
      showNewAchievementNotification();
      fishingStats.oneShiny = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //All shiny caught Shiny hunter
  let numberOfShinies = 0;
  poissonsPechesArray.forEach((fish) => {
    if (fish.shiny) numberOfShinies++;
  });
  if (poissonsPechesArray.length > 0 && numberOfShinies === numberOfFishTypes) {
    addAchievementToHTML(
      "Shiny hunter",
      allShiniesTrophy,
      "Vous avez pêché toutes les versions shiny"
    );
    if (!fishingStats.allShiny) {
      showNewAchievementNotification();
      launchConfetti();
      fishingStats.allShiny = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //100%
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100;
  if (percentage === 100) {
    addAchievementToHTML(
      "100%",
      hundredPercentTrophy,

      "100% des espèces attrapées"
    );
    if (!fishingStats.allTypesCaught) {
      launchConfetti();
      showNewAchievementNotification();
      fishingStats.allTypesCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //100km VOYAGEUR
  if (fishingStats.distanceTraveled >= distanceForAchievement) {
    addAchievementToHTML(
      "Voyageur",
      hundredkmTrophy,
      "Vous avez parcourus 100 km en bateau"
    );
    if (!fishingStats.hundredKm) {
      showNewAchievementNotification();
      fishingStats.hundredKm = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //50 fish escaped TROP RAPIDE
  if (fishingStats.escapedFish >= escapedFishForAchievement) {
    addAchievementToHTML(
      "Trop rapide",
      escapedTrophy,
      "Vous avez effrayé 50 poissons"
    );
    if (!fishingStats.fiftyEscapedFish) {
      showNewAchievementNotification();
      fishingStats.fiftyEscapedFish = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //Leviathor shiny Chanceux
  if (isLeviathorCaught) {
    addAchievementToHTML(
      "Bizarre ce poisson",
      leviathorTrophy,
      "Vous avez pêché Leviathor Shiny"
    );
    if (!fishingStats.isLeviathorCaught) {
      showNewAchievementNotification();
      fishingStats.isLeviathorCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }

  //5% du poids max PECHE AU GROS
  let isBigOneCaught = false;
  Object.keys(poissonsPeches).forEach((fishName) => {
    const fishData = poissonsPeches[fishName];
    const caughtSize = fishData.taille;

    const isWithinRange = isWithinXPercentMaxSize(fishName, caughtSize);
    if (isWithinRange) {
      isBigOneCaught = true;
    }
  });
  if (isBigOneCaught) {
    addAchievementToHTML(
      "Pêche au gros",
      bigOneTrophy,
      "Vous avez pêché un poisson plus gros que 95% de son espèce"
    );
    if (!fishingStats.bigOne) {
      showNewAchievementNotification();
      fishingStats.bigOne = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", unknownTrophy, "???");
  }
}

function isWithinXPercentMaxSize(fishName, caughtSize) {
  const percent = 5;
  const fish = poissonsDeMerAvecPourcentage.find(
    (item) => item.nom === fishName
  );

  if (fish) {
    const PercentMaxSize = (fish.tailleMaximale * percent) / 100;
    return caughtSize >= fish.tailleMaximale - PercentMaxSize;
  }

  return false; // Poisson non trouvé
}

function showNewAchievementNotification() {
  const notification = document.querySelector(".notification");
  const notificationImage = document.querySelector(".notification-image");

  notificationImage.src = notificationImg;
  notification.classList.add("show", "slide-up");

  setTimeout(() => {
    playBubbleSound();
    notification.classList.remove("show", "slide-up");
    notification.classList.add("slide-down");

    setTimeout(() => {
      notification.classList.remove("slide-down");
    }, 2000);
  }, 1000);
}
//#########################################################endregion#########################################################

//#########################################################region Utils######################################################
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function generateRandomSize(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

function chaineAleatoireAvecPourcentage(chainesAvecPourcentage) {
  const totalPourcentage = chainesAvecPourcentage.reduce(
    (acc, chaine) => acc + chaine.pourcentage,
    0
  );
  let random = Math.random() * totalPourcentage;

  for (const chaine of chainesAvecPourcentage) {
    if (random < chaine.pourcentage) {
      return chaine.nom;
    }
    random -= chaine.pourcentage;
  }
}

function plural(singular) {
  if (singular.substring(singular.length - 3) == "eau") {
    return singular + "x";
  } else if (singular.includes(" ")) {
    const words = singular.split(" ");
    const pluralWords = words.map((word) => word + "s");

    const newString = pluralWords.join(" ");

    return newString;
  } else {
    return singular + "s";
  }
}

function upcaseFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

function setSpeed(nameFish) {
  const fish = poissonsDeMerAvecPourcentage.find(
    (fish) => fish.nom === nameFish
  );
  const minSpeed = 5;
  const maxSpeed = 15;
  if (fish) {
    const percentage = fish.pourcentage;
    const invertedPercentage = 100 - percentage;
    const speed = minSpeed + (invertedPercentage / 100) * (maxSpeed - minSpeed);

    return Math.min(maxSpeed, Math.max(minSpeed, speed));
  } else {
    return 0;
  }
}

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}
//#########################################################endregion#########################################################

//#########################################################region Images#####################################################
function loadPoissonImage(nomPoisson) {
  switch (nomPoisson) {
    case "saumon":
      imageSrc = saumon;
      break;
    case "bar":
      imageSrc = bar;
      break;
    case "anguille":
      imageSrc = anguille;
      break;
    case "moule":
      imageSrc = moule;
      break;
    case "sole":
      imageSrc = sole;
      break;
    case "sardine":
      imageSrc = sardine;
      break;
    case "hareng":
      imageSrc = hareng;
      break;
    case "merlan":
      imageSrc = merlan;
      break;
    case "dorade":
      imageSrc = dorade;
      break;
    case "palourde":
      imageSrc = palourde;
      break;
    case "dorade":
      imageSrc = dorade;
      break;
    case "poisson-globe":
      imageSrc = poisson_globe;
      break;
    case "calamar":
      imageSrc = calamar;
      break;
    case "morue":
      imageSrc = morue;
      break;
    case "thon rouge":
      imageSrc = thon_rouge;
      break;
    case "requin bleu":
      imageSrc = requin_bleu;
      break;
    case "tacaud":
      imageSrc = tacaud;
      break;
    case "maquereau":
      imageSrc = maquereau;
      break;
    case "anguille électrique":
      imageSrc = anguille_électrique;
      break;
    case "homard":
      imageSrc = homard;
      break;
    case "crevette":
      imageSrc = crevette;
      break;
    case "poisson volant":
      imageSrc = poisson_volant;
      break;
    case "poisson-clown":
      imageSrc = poisson_clown;
      break;
    case "poisson-chirurgien":
      imageSrc = poisson_chirurgien;
      break;
    case "marlin":
      imageSrc = marlin;
      break;
    case "méduse":
      imageSrc = méduse;
      break;
    case "orque":
      imageSrc = orque;
      break;
    case "poisson-flûte":
      imageSrc = poisson_flute;
      break;
    case "oursin":
      imageSrc = oursin;
      break;
    case "raie manta":
      imageSrc = raie_manta;
      break;
    case "scalaire":
      imageSrc = scalaire;
      break;

    default:
      imageSrc = "";
  }
}

function loadShinyPoissonImage(nomPoisson) {
  switch (nomPoisson) {
    case "saumon":
      imageShinySrc = saumonS;
      break;
    case "bar":
      imageShinySrc = barS;
      break;
    case "anguille":
      imageShinySrc = anguilleS;
      break;
    case "moule":
      imageShinySrc = mouleS;
      break;
    case "sole":
      imageShinySrc = soleS;
      break;
    case "sardine":
      imageShinySrc = sardineS;
      break;
    case "hareng":
      imageShinySrc = harengS;
      break;
    case "merlan":
      imageShinySrc = merlanS;
      break;
    case "dorade":
      imageShinySrc = doradeS;
      break;
    case "palourde":
      imageShinySrc = palourdeS;
      break;
    case "dorade":
      imageShinySrc = doradeS;
      break;
    case "poisson-globe":
      imageShinySrc = poisson_globeS;
      break;
    case "calamar":
      imageShinySrc = calamarS;
      break;
    case "morue":
      imageShinySrc = morueS;
      break;
    case "thon rouge":
      imageShinySrc = thon_rougeS;
      break;
    case "requin bleu":
      imageShinySrc = requin_bleuS;
      break;
    case "tacaud":
      imageShinySrc = tacaudS;
      break;
    case "maquereau":
      imageShinySrc = maquereauS;
      break;
    case "anguille électrique":
      imageShinySrc = anguille_électriqueS;
      break;
    case "homard":
      imageShinySrc = homardS;
      break;
    case "crevette":
      imageShinySrc = crevetteS;
      break;
    case "poisson volant":
      imageShinySrc = poisson_volantS;
      break;
    case "poisson-clown":
      imageShinySrc = poisson_clownS;
      break;
    case "poisson-chirurgien":
      imageShinySrc = poisson_chirurgienS;
      break;
    case "marlin":
      imageShinySrc = marlinS;
      break;
    case "méduse":
      imageShinySrc = méduseS;
      break;
    case "orque":
      imageShinySrc = orqueS;
      break;
    case "poisson-flûte":
      imageShinySrc = poisson_fluteS;
      break;
    case "oursin":
      imageShinySrc = oursinS;
      break;
    case "raie manta":
      imageShinySrc = raie_mantaS;
      break;
    case "scalaire":
      imageShinySrc = scalaireS;
      break;

    default:
      imageShinySrc = "";
  }
}
//#########################################################endregion#########################################################
