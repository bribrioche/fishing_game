import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let camera, scene, renderer;
let controls, water, sun, boat;

let moveSpeed = 0.5;
let boatRotation = 0;
let counter = 0;

let spheres = [];
let colors = [];

let poissonsPeches = {};

let spacebarChallengeCompleted = true;
let isClicked = false;
let spacebarGameRunning = false;
let moreThan100km = false;
let soundOn = true;

let randomFish;
let timer;
let timeout;
let verticalBarAnimation;

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
const counterElement = document.getElementById("counter");
const fishGrid = document.querySelector(".fish-grid");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const messageElement = document.querySelector(".messageElement");
const verticalBar = document.querySelector(".vertical-bar");
const imgRecord = document.querySelector(".imgRecord");
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
  }

  getAllAchievements();

  if (poissonsPechesStr) {
    poissonsPeches = JSON.parse(poissonsPechesStr);
    updateFishingList();
    updateProgression();
  } else {
    setEmptyFishingList();
  }

  // Init
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);
  scene = new THREE.Scene();

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
    "./assets/3d_models/boat.fbx",
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
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "assets/textures/waternormals.jpg",
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

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  let soundIsPlaying = false;
  const keyState = {};
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
      soundImage.src = "./assets/images/soundOn.png";
    } else {
      soundImage.src = "./assets/images/soundOff.png";
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
        boatRotation += Math.PI / 180;
        boat.rotation.set(0, boatRotation, 0);
      }
      if (movingRight) {
        boatRotation -= Math.PI / 180;
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

  setInterval(createBlackSphere, 5000);
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
    const geometry = new THREE.SphereGeometry(5, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const sphere = new THREE.Mesh(geometry, material);

    const radius = Math.random() * 50 + 50;
    const angle = Math.random() * Math.PI * 2;
    const x = boat.position.x + Math.cos(angle) * radius;
    const z = boat.position.z + Math.sin(angle) * radius;
    sphere.scale.set(0.6, 0.1, 0.2);
    sphere.position.set(x, 0, z);
    sphere.rotateY(Math.random() * 180);
    sphere.material.transparent = true;
    sphere.material.opacity = 1;

    scene.add(sphere);
    spheres.push(sphere);
    if (spheres.length > 15) {
      scene.remove(spheres[0]);
      spheres.shift();
    }
  }
}

function updateSpheres() {
  const maxDistance = 1000;

  for (let i = spheres.length - 1; i >= 0; i--) {
    const sphere = spheres[i];
    const distance = boat.position.distanceTo(sphere.position);

    if (distance > maxDistance) {
      spliceAndDeleteSphere(i, "to much spheres");
    }
  }
}

function detectCollision() {
  if (boat) {
    const collisionDistance = 10;

    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i];
      const distance = boat.position.distanceTo(sphere.position);

      if (distance < collisionDistance && !sphere.caught && moveSpeed < 0.9) {
        spliceAndDeleteSphere(i, "Start mini Game");

        messageElement.style.display = "flex";
        const image = document.getElementById("randomImage");
        image.src = "./assets/images/spaceBarSpam.png";

        if (spacebarChallengeCompleted) {
          spacebarChallengeCompleted = false;
        }

        setTimeout(() => {
          messageElement.style.display = "none";
          messageElement.style.pointerEvents = "none";
          startSpacebarChallenge();
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
      scene.remove(removedSphere);
    }
  }
}
//#########################################################endregion#########################################################

//#########################################################region Mini-Game##################################################
function startSpacebarChallenge() {
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
  randomFish = chaineAleatoireAvecPourcentage(poissonsDeMerAvecPourcentage);
  setSegmentSize();

  startVerticalBarAnimation();

  // Stop after 10 sec
  timeout = setTimeout(() => {
    clearInterval(timer);
    if (!spacebarChallengeCompleted) {
      messageElement.style.display = "flex";
      progressBar.style.width = "0%";
      progressContainer.style.display = "none";
      spacebarClickCount = 0;
      const image = document.getElementById("randomImage");
      image.src = "./assets/images/failed.png";
      document.removeEventListener("keydown", handleSpacebarClick);
      spacebarGameRunning = false;

      setTimeout(() => {
        messageElement.style.display = "none";
        spacebarChallengeCompleted = true;
      }, 3000);
    }
  }, 10000);
}

function startVerticalBarAnimation() {
  const horizontalBarContainer = document.querySelector(
    ".horizontal-bar-container"
  );

  let position = 0;
  let direction = 1;
  const speed = setSpeed(randomFish);
  const containerWidth = horizontalBarContainer.offsetWidth;

  const animationInterval = setInterval(() => {
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

function showCongratulationsMessage() {
  clearTimeout(timeout);
  clearTimeout(timer);
  clearTimeout(verticalBarAnimation);
  const fishData = poissonsDeMerAvecPourcentage.find(
    (fish) => fish.nom === randomFish
  );
  const randomSize = generateRandomSize(
    fishData.tailleMinimale,
    fishData.tailleMaximale
  );

  const randomImage = document.getElementById("randomImage");
  const chance = getRandomInRange(0, 100);
  const isShiny = chance < chanceforShiny;
  const chanceLeviathor = getRandomInRange(0, 100);
  const isLeviathor = chanceLeviathor < chanceforLeviathor;

  const image = document.createElement("img");
  image.classList.add("fish-image");

  if (isLeviathor) {
    randomImage.src = "./assets/images/leviathor.png";
    txtNewFish.textContent = "Leviathor Shiny - Wow !";
    fishingStats.isLeviathorCaught = true;
    localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    getAllAchievements();
  } else {
    if (isShiny) {
      randomImage.src = "./assets/images/shiny/" + randomFish + ".png";
    } else {
      randomImage.src = "./assets/images/" + randomFish + ".png";
    }

    if (poissonsPeches[randomFish]) {
      // Already caught
      poissonsPeches[randomFish].peches++;

      if (isShiny) {
        poissonsPeches[randomFish].shiny = true;
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

    updateProgression();

    localStorage.setItem("poissonsPeches", JSON.stringify(poissonsPeches));
  }

  messageElement.style.display = "flex";
  progressContainer.style.display = "none";
  detailNewFish.style.display = "flex";

  setTimeout(() => {
    imgRecord.style.display = "none";
    messageElement.style.display = "none";
    detailNewFish.style.display = "none";
    randomImage.src = "./assets/images/spaceBarSpam.png";
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
    image.src = `./assets/images/unknown.png`;
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
    image.src = `./assets/images/${poisson}.png`;
    image.alt = poisson;

    const textContainer = document.createElement("div");
    textContainer.classList.add("fish-text-container");

    if (poissonsPeches[poisson].shiny) {
      const shinyStar = document.createElement("img");
      shinyStar.classList.add("shiny-icon");
      shinyStar.src = "./assets/images/star.png";
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
    image.src = `./assets/images/unknown.png`;
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
        const fishImageSrc = `./assets/images/${fishFound}.png`;
        const fishImageShinySrc = `./assets/images/shiny/${fishFound}.png`;
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

        fishPercent.textContent =
          "Chance de pêcher un(e) " + fishName + " : " + fishPourcentage + "%";
        fishMaxSize.textContent = "Taille max. obtenue : " + fishSize + " cm";
      } else {
        const fishName = "???";
        const fishImageSrc = `./assets/images/unknown.png`;

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
  const fishProgressPercent = document.querySelector(".text");

  const numberOfFishTypes = Object.keys(poissonsPeches).length;
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100;
  fishProgressBar.style.width = percentage + "%";

  fishProgressPercent.textContent = percentage.toFixed(0) + "%";
  if (percentage === 100 && !fishingStats.allTypesCaught) {
    launchConfetti();
  }
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
      "./assets/images/trophies/first.png",
      "Vous avez pêché votre premier poisson"
    );
    if (!fishingStats.firstCaught) {
      showNewAchievementNotification();
      fishingStats.firstCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //100 fish caught
  let total = 0;
  poissonsPechesArray.forEach((fish) => {
    total += fish.peches;
  });
  if (total >= 100) {
    addAchievementToHTML(
      "Pêche en grande quantité",
      "./assets/images/trophies/hundred.png",
      "Vous avez pêché 100 poissons"
    );
    if (!fishingStats.hundredCaught) {
      showNewAchievementNotification();
      fishingStats.hundredCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //shiny
  const oneShinyCaught = poissonsPechesArray.some(
    (fish) => fish.shiny === true
  );
  if (oneShinyCaught) {
    addAchievementToHTML(
      "First shiny",
      "./assets/images/trophies/shiny.png",
      "Vous avez pêché un shiny"
    );
    if (!fishingStats.oneShiny) {
      showNewAchievementNotification();
      fishingStats.oneShiny = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //All shiny caught Shiny hunter
  let numberOfShinies = 0;
  poissonsPechesArray.forEach((fish) => {
    if (fish.shiny) numberOfShinies++;
  });
  if (numberOfShinies === numberOfFishTypes) {
    addAchievementToHTML(
      "Shiny hunter",
      "./assets/images/trophies/allShinies.png",
      "Vous avez pêché toutes les versions shiny"
    );
    if (!fishingStats.allShiny) {
      showNewAchievementNotification();
      fishingStats.allShiny = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //100%
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100;
  if (percentage === 100) {
    addAchievementToHTML(
      "100%",
      "./assets/images/trophies/100.png",

      "100% des espèces attrapées"
    );
    if (!fishingStats.allTypesCaught) {
      showNewAchievementNotification();
      fishingStats.allTypesCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //100km VOYAGEUR
  if (fishingStats.distanceTraveled >= distanceForAchievement) {
    addAchievementToHTML(
      "Voyageur",
      "./assets/images/trophies/100km.png",
      "Vous avez parcourus 100 km en bateau"
    );
    if (!fishingStats.hundredKm) {
      showNewAchievementNotification();
      fishingStats.hundredKm = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //50 fish escaped TROP RAPIDE
  if (fishingStats.escapedFish >= escapedFishForAchievement) {
    addAchievementToHTML(
      "Trop rapide",
      "./assets/images/trophies/50_escaped.png",
      "Vous avez effrayé 50 poissons"
    );
    if (!fishingStats.fiftyEscapedFish) {
      showNewAchievementNotification();
      fishingStats.fiftyEscapedFish = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
  }

  //Leviathor shiny Chanceux
  if (fishingStats.isLeviathorCaught === true) {
    addAchievementToHTML(
      "Bizarre ce poisson",
      "./assets/images/trophies/leviathor_shiny.png",
      "Vous avez pêché Leviathor Shiny"
    );
    if (!fishingStats.isLeviathorCaught) {
      showNewAchievementNotification();
      fishingStats.isLeviathorCaught = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
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
      "./assets/images/trophies/big.png",
      "Vous avez pêché un poisson plus gros que 95% de son espèce"
    );
    if (!fishingStats.bigOne) {
      showNewAchievementNotification();
      fishingStats.bigOne = true;
      localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
    }
  } else {
    addAchievementToHTML("???", "./assets/images/trophies/unknown.png", "???");
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

  notificationImage.src = "./assets/images/notification.png";
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
