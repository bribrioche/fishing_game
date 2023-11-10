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

let randomFish;
let timeout;

const fishingStats = {
  escapedFish: 0,
  distanceTraveled: 0,
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
  { nom: "maquereau", pourcentage: 9, tailleMinimale: 30, tailleMaximale: 60 },
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
    tcolorsailleMaximale: 5,
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

const chanceforShiny = 100;
const distanceForAchievement = 10000;
const escapedFishForAchievement = 50;

const fishDetails = document.getElementById("fishDetails");
const fishDetailImage = document.getElementById("fishDetailImage");
const fishDetailName = document.getElementById("fishDetailName");
const fishDetailCount = document.getElementById("fishDetailCount");
const fishPercent = document.getElementById("fishPercent");
const fishMaxSize = document.getElementById("fishMaxSize");
const showListButton = document.getElementById("showListButton");
const listContainer = document.getElementById("listContainer");
const counterElement = document.getElementById("counter");
const fishGrid = document.querySelector(".fish-grid");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const messageElement = document.querySelector(".messageElement");
const verticalBar = document.querySelector(".vertical-bar");
const imgRecord = document.querySelector(".imgRecord");
const detailNewFish = document.querySelector(".detailNewFish");
const txtNewFish = document.querySelector(".txtFish");

// splashScreen();
init();
animate();

//#########################################################region Init##################################################
function init() {
  fishDetails.classList.add("hidden");
  progressContainer.style.display = "none";

  // Save
  const poissonsPechesStr = localStorage.getItem("poissonsPeches");
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
    "./3d_models/boat.fbx",
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
  document.addEventListener("keydown", (event) => {
    if (spacebarChallengeCompleted) {
      keyState[event.key] = true;
      moveSpeed = event.shiftKey ? 1 : 0.5;
      if (event.key === "ArrowUp" && !soundIsPlaying) {
        playBoatSound();
        playWaterSound();
        soundIsPlaying = true;
      }
    } else {
      keyState[event.key] = false;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (spacebarChallengeCompleted) {
      keyState[event.key] = false;
      if (
        (event.key === "ArrowUp" || event.key === "z") &&
        !Object.values(keyState).some((key) => key === true)
      ) {
        stopBoatSound();
        stopWaterSound();
        soundIsPlaying = false;
      }

      if (event.key === "Shift") {
        moveSpeed = 0.5;
      }
    } else {
      keyState[event.key] = false;
    }
  });

  showListButton.addEventListener("click", () => {
    listContainer.classList.toggle("hidden");
  });

  showListButton.addEventListener("click", function () {
    if (this.classList.contains("clicked")) {
      this.classList.remove("clicked");
    } else {
      this.classList.add("clicked");
    }
  });

  function updatePosition() {
    if (spacebarChallengeCompleted) {
      if (keyState["z"] || keyState["ArrowUp"]) {
        boatSound.volume = 0.15;
        boat.position.z -= Math.sin(boatRotation) * moveSpeed;
        boat.position.x += Math.cos(boatRotation) * moveSpeed;
        fishingStats.distanceTraveled += moveSpeed;
        localStorage.setItem("fishingStats", JSON.stringify(fishingStats));
        if (fishingStats.distanceTraveled >= distanceForAchievement) {
          getAllAchievements();
        }
      }
      if (keyState["q"] || keyState["ArrowLeft"]) {
        boatSound.volume = 0.2;
        boatRotation += Math.PI / 180;
        boat.rotation.set(0, boatRotation, 0);
      }
      if (keyState["d"] || keyState["ArrowRight"]) {
        boatSound.volume = 0.2;

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

  setInterval(createBlackSphere, 10000);
  updatePosition();

  window.addEventListener("resize", onWindowResize);
  getAllAchievements();
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
    if (spheres.length > 10) {
      scene.remove(spheres[0]);
      console.log("shift");
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
        image.src = "./images/spaceBarSpam.png";

        if (spacebarChallengeCompleted) {
          spacebarChallengeCompleted = false;
        }

        setTimeout(() => {
          messageElement.style.display = "none";
          messageElement.style.pointerEvents = "none";
          startSpacebarChallenge();
        }, 3000);

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
        if (fishingStats.escapedFish >= escapedFishForAchievement) {
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
  console.log(text);
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
  const timer = setInterval(() => {
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
      image.src = "./images/failed.png";
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

  setTimeout(() => {
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
      console.log(counter);
      showCongratulationsMessage();
    }
  }
}

function updateRemainingTime(timeRemaining) {
  document.getElementById("timeRemaining").textContent = `${timeRemaining}s`;
}

function showCongratulationsMessage() {
  spacebarChallengeCompleted = true;
  clearTimeout(timeout);
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

  const image = document.createElement("img");
  image.classList.add("fish-image");

  if (isShiny) {
    randomImage.src = "./images/shiny/" + randomFish + ".png";
  } else {
    randomImage.src = "./images/" + randomFish + ".png";
  }

  messageElement.style.display = "flex";
  progressContainer.style.display = "none";
  detailNewFish.style.display = "flex";

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
  detailNewFish.style.display = "flex";

  updateFishingList();

  updateProgression();

  localStorage.setItem("poissonsPeches", JSON.stringify(poissonsPeches));
  setTimeout(() => {
    imgRecord.style.display = "none";
    messageElement.style.display = "none";
    detailNewFish.style.display = "none";
  }, 3000);
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
    const loadingBar = document.querySelector(".loading-bar"); // Mettez à jour la classe ici
    const splashScreen = document.querySelector(".splashScreen");

    let width = 0;
    const duration = 500; // 1.5 secondes
    const interval = 10; // Mettez à jour la barre de chargement toutes les 20 ms
    const increment = (interval / duration) * 100;
    let currentPercent = 0;

    function updateLoadingProgressBar() {
      if (width >= 100) {
        clearInterval(loadingInterval);
        setTimeout(() => {
          // Disparition du splash screen après la fin de la barre de chargement
          splashScreen.style.opacity = 0;
          setTimeout(() => {
            splashScreen.style.display = "none";
            // Appeler la fonction pour lancer la pluie de confettis
          }, 1000); // Attendre 1 seconde pour que le splash screen disparaisse complètement
        }, 1000); // Attendre 1 seconde après l'atteinte de 100 % pour laisser le temps à l'animation de disparaître
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
//#########################################################endregion#########################################################

//#########################################################region Html_Modifiers#############################################
function setEmptyFishingList() {
  for (let i = 0; i < poissonsDeMerAvecPourcentage.length; i++) {
    const fishItem = document.createElement("div");
    fishItem.classList.add("fish-item");

    const image = document.createElement("img");
    image.classList.add("fish-image");
    image.src = `./images/unknown.png`;
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
    image.src = `./images/${poisson}.png`;
    image.alt = poisson;

    const text = document.createElement("p");
    text.classList.add("fish-name");
    text.textContent = `${poisson}`;

    fishItem.appendChild(image);
    fishItem.appendChild(text);
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
    image.src = `./images/unknown.png`;
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
        if (fishItem.textContent == poisson) {
          fishFound = poisson;
        }
      }

      if (fishFound) {
        const fishCount = poissonsPeches[fishFound].peches || 0;
        const fishImageSrc = `./images/${fishFound}.png`;
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
        fishPercent.textContent =
          "Chance de pêcher un(e) " + fishName + " : " + fishPourcentage + "%";
        fishMaxSize.textContent = "Taille max. obtenue : " + fishSize + " cm";
      } else {
        const fishName = "???";
        const fishImageSrc = `./images/unknown.png`;

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
  if (percentage === 100) {
    launchConfetti();
  }
}

//#########################################################endregion#########################################################

//#########################################################region Achievements###############################################
function getAllAchievements() {
  const poissonsPechesArray = Object.values(poissonsPeches);

  //100%
  const numberOfFishTypes = Object.keys(poissonsPeches).length;
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100;
  if (percentage === 100) {
    console.log("achievement all fish caught");
  }

  //shiny
  const oneShinyCaught = poissonsPechesArray.some(
    (fish) => fish.shiny === true
  );
  oneShinyCaught
    ? console.log("shiny caught !")
    : console.log("shiny not caught !");

  //1st fish caught
  if (poissonsPechesArray.length > 0) {
    console.log("first fish caught !");
  }

  //1st fish caught
  let total = 0;
  poissonsPechesArray.forEach((fish) => {
    total += fish.peches;
  });
  if (total >= 100) {
    console.log("more than 100 fish caught ! " + total);
  }

  //100km
  if (fishingStats.distanceTraveled >= distanceForAchievement) {
    console.log("100 km ! " + total);
  }

  //50 fish escaped
  if (fishingStats.escapedFish >= escapedFishForAchievement) {
    console.log("50 fish escaped ! " + total);
  }
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
  const maxSpeed = 10;
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
