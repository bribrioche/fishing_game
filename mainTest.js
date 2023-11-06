import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Water } from "three/addons/objects/Water.js";
import { Sky } from "three/addons/objects/Sky.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

let camera, scene, renderer;
let controls, water, sun, boat;
// Créez un tableau pour stocker les sphères générées
const spheres = [];

// Déclarez un objet pour stocker les poissons pêchés
let poissonsPeches = {};
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
  { nom: "crevette", pourcentage: 14, tailleMinimale: 3, tailleMaximale: 5 },
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

let spacebarChallengeCompleted = true;

// Sélectionnez le conteneur de détails de poisson
const fishDetails = document.getElementById("fishDetails");
fishDetails.classList.add("hidden");
// Sélectionnez les éléments de détail du poisson
const fishDetailImage = document.getElementById("fishDetailImage");
const fishDetailName = document.getElementById("fishDetailName");
const fishDetailCount = document.getElementById("fishDetailCount");
const fishPercent = document.getElementById("fishPercent");
const fishMaxSize = document.getElementById("fishMaxSize");
// Sélectionnez la grille des poissons
const fishGrid = document.querySelector(".fish-grid");

splashScreen();
init();
animate();

function init() {
  const poissonsPechesStr = localStorage.getItem("poissonsPeches");

  if (poissonsPechesStr) {
    poissonsPeches = JSON.parse(poissonsPechesStr);
    updateFishingList();
    updateProgression();
  } else {
    setEmptyFishingList();
  }
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
    if (spacebarChallengeCompleted) {
      // Vérifiez si le défi de la barre d'espace n'est pas encore terminé
      keyState[event.key] = true;

      // Si "ArrowUp" est enfoncé et le son n'est pas déjà en cours de lecture, activez le son
      if (event.key === "ArrowUp" && !soundIsPlaying) {
        playBoatSound();
        playWaterSound();
        soundIsPlaying = true;
      }
    } else {
      keyState[event.key] = false;
    }
  });

  // Ajoutez un gestionnaire d'événements pour la touche "ArrowUp" relâchée
  document.addEventListener("keyup", (event) => {
    if (spacebarChallengeCompleted) {
      // Vérifiez si le défi de la barre d'espace n'est pas encore terminé
      keyState[event.key] = false;

      // Si la touche "ArrowUp" est relâchée et aucune autre touche "ArrowUp" n'est enfoncée, arrêtez le son
      if (
        (event.key === "ArrowUp" || event.key === "z") &&
        !Object.values(keyState).some((key) => key === true)
      ) {
        stopBoatSound();
        stopWaterSound();
        soundIsPlaying = false;
      }
    } else {
      keyState[event.key] = false;
    }
  });

  function updatePosition() {
    if (spacebarChallengeCompleted) {
      // Vérifiez si le défi de la barre d'espace n'est pas encore terminé
      if (keyState["z"] || keyState["ArrowUp"]) {
        boatSound.volume = 0.15;

        boat.position.z -= Math.sin(boatRotation) * moveSpeed;
        boat.position.x += Math.cos(boatRotation) * moveSpeed;
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
      // Mettre à jour la position de la caméra en fonction du bateau
      const cameraDistance = 80;
      camera.position.x = boat.position.x + cameraDistance;
      camera.position.y = boat.position.y + cameraDistance;
      camera.position.z = boat.position.z + cameraDistance;
      camera.lookAt(boat.position);
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
        const image = document.getElementById("randomImage");
        image.src = "./images/spaceBarSpam.png";

        if (spacebarChallengeCompleted) {
          spacebarClickCount = 0;
          spacebarChallengeCompleted = false;
          progressBar.style.width = "0%";
          // updateProgressBar(); // Réinitialise la barre de progression
        }

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

let spacebarGameRunning = false;
let timeout;
function startSpacebarChallenge() {
  progressContainer.style.display = "block";

  // Initialiser le temps restant
  let timeRemaining = 10;

  // Afficher le temps restant au départ
  updateRemainingTime(timeRemaining);

  if (!spacebarGameRunning) {
    // Ajouter un nouvel écouteur d'événements pour la barre d'espace uniquement si le jeu n'est pas déjà en cours
    document.addEventListener("keyup", handleSpacebarClick);
    spacebarGameRunning = true;
  }

  // Mettre à jour le temps restant toutes les secondes
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

  // Arrêtez le défi après 10 secondes
  timeout = setTimeout(() => {
    // Arrêter le compteur
    clearInterval(timer);
    if (!spacebarChallengeCompleted) {
      console.log("Jfejvijefbviujbfreuigsduif");
      messageElement.style.display = "flex";
      progressBar.style.width = "0%";
      progressContainer.style.display = "none";
      spacebarClickCount = 0;
      const image = document.getElementById("randomImage");
      image.src = "./images/failed.png";
      // Supprimer l'écouteur d'événements de la barre d'espace à la fin du jeu
      document.removeEventListener("keydown", handleSpacebarClick);
      spacebarGameRunning = false;

      // Cacher l'élément message après 3 secondes
      setTimeout(() => {
        messageElement.style.display = "none";
        spacebarChallengeCompleted = true;
      }, 3000);
    }
  }, 10000);
}

let counter = 0;
const verticalBar = document.querySelector(".vertical-bar");
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

  // Arrêtez l'animation après un certain temps (par exemple, 10 secondes)
  setTimeout(() => {
    clearInterval(animationInterval);
  }, 10000); // 10 secondes
}

// Fonction pour déterminer la couleur en fonction de la position de la barre verticale
function getColorForPosition(position, containerWidth, colors) {
  let currentPosition = 0;

  for (let i = 0; i < colors.length; i++) {
    const segmentWidth = (containerWidth * colors[i].pourcentage) / 100;

    if (
      position >= currentPosition &&
      position <= currentPosition + segmentWidth
    ) {
      console.log(colors[i].color);
      return colors[i].color;
    }

    currentPosition += segmentWidth;
  }

  return null; // Si la position n'est pas dans un segment
}

// Variable pour stocker le compteur
const counterElement = document.getElementById("counter");
// Fonction pour mettre à jour le compteur en fonction de la couleur
function updateCounter(color) {
  if (color === "green") {
    counter++;
  } else if (color === "red" && counter > 0) {
    counter--;
  }

  counterElement.textContent = "Compteur : " + counter;
}

// Fonction pour gérer l'événement de la barre d'espace
function handleSpacebarClick(event) {
  if (event.key === " ") {
    // Obtenez la position actuelle de la barre verticale
    const position = verticalBar.offsetLeft;

    // Obtenez la largeur du conteneur horizontal
    const horizontalBarContainer = document.querySelector(
      ".horizontal-bar-container"
    );
    const containerWidth = horizontalBarContainer.offsetWidth;

    // Appelez la fonction pour déterminer la couleur
    const color = getColorForPosition(position, containerWidth, colors);

    // Mettez à jour le compteur en fonction de la couleur
    updateCounter(color);

    if (counter == 3) {
      counter++;
      showCongratulationsMessage();
    }
  }
}

const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");

let spacebarClickCount = 0;

function updateRemainingTime(timeRemaining) {
  document.getElementById("timeRemaining").textContent = `${timeRemaining}s`;
}

const imgRecord = document.querySelector(".imgRecord");
const detailNewFish = document.querySelector(".detailNewFish");
const txtNewFish = document.querySelector(".txtFish");
let randomFish;
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

  // Mettre à jour l'attribut src de l'image
  const randomImage = document.getElementById("randomImage");
  randomImage.src = "./images/" + randomFish + ".png";
  messageElement.style.display = "flex";
  progressContainer.style.display = "none";
  detailNewFish.style.display = "flex";

  // Vérifier si le poisson a déjà été pêché
  if (poissonsPeches[randomFish]) {
    // Si le poisson a déjà été pêché, augmentez le compteur de pêche
    poissonsPeches[randomFish].peches++;
    // Comparez les tailles et gardez la plus grande
    if (poissonsPeches[randomFish].taille < randomSize) {
      imgRecord.style.display = "block";
    }

    poissonsPeches[randomFish].taille = Math.max(
      poissonsPeches[randomFish].taille,
      randomSize
    );
  } else {
    // Si c'est la première pêche, ajoutez le poisson avec sa taille
    poissonsPeches[randomFish] = { taille: randomSize, peches: 1 };
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

// Sélectionnez le bouton et la liste
const showListButton = document.getElementById("showListButton");
const listContainer = document.getElementById("listContainer");

// Ajoutez un gestionnaire d'événements pour le bouton
showListButton.addEventListener("click", () => {
  // Basculez la classe "hidden" sur la liste pour l'afficher ou la masquer
  listContainer.classList.toggle("hidden");
});

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
  // Effacez la grille actuelle
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

  // Ajoutez des éléments pour les poissons manquants
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

  // Sélectionnez tous les éléments .fish-item
  const fishItems = document.querySelectorAll(".fish-item");

  // Parcourez tous les éléments .fish-item et ajoutez un gestionnaire d'événements pour chaque élément
  fishItems.forEach((fishItem) => {
    fishItem.addEventListener("mouseover", () => {
      let fishFound;
      for (const poisson in poissonsPeches) {
        if (fishItem.textContent == poisson) {
          fishFound = poisson;
        }
      }

      if (fishFound) {
        const fishCount = poissonsPeches[fishFound].peches || 0; // Nombre de fois pêché
        const fishImageSrc = `./images/${fishFound}.png`;
        const fishName = fishFound;
        const fishSize = poissonsPeches[fishFound].taille;

        // Recherche du pourcentage dans poissonsDeMerAvecPourcentage
        let fishPourcentage = 0;
        for (const fish of poissonsDeMerAvecPourcentage) {
          if (fish.nom === fishName) {
            fishPourcentage = fish.pourcentage;
            break; // Sortez de la boucle une fois que vous avez trouvé le poisson
          }
        }

        // Mettez à jour les éléments de détail du poisson
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
        // Récupérez les informations du poisson depuis les éléments de données
        const fishName = "???";
        // const fishCount =
        const fishImageSrc = `./images/unknown.png`;

        // Mettez à jour les éléments de détail du poisson
        fishDetailName.textContent = fishName;
        fishDetailCount.textContent = "???";
        fishDetailImage.src = fishImageSrc;
        fishPercent.textContent = "???";
        fishMaxSize.textContent = "???";
      }

      // Affichez le conteneur de détails
      fishDetails.classList.remove("hidden");
    });

    fishItem.addEventListener("mouseout", () => {
      // Masquez le conteneur de détails lorsque la souris quitte l'élément .fish-item
      fishDetails.classList.add("hidden");
    });
  });
}

function updateProgression() {
  // Mettre à jour la barre de progression pour le nombre de types de poissons pêchés
  const fishProgressContainer = document.querySelector(
    ".fish-progress-container"
  );
  const fishProgressBar = document.querySelector(".fish-progress-bar");
  const fishProgressPercent = document.querySelector(".text");

  // Calculer le nombre de types différents de poissons pêchés
  const numberOfFishTypes = Object.keys(poissonsPeches).length;
  // Mettre à jour la largeur de la barre de progression en fonction du nombre de types
  const percentage =
    (numberOfFishTypes / poissonsDeMerAvecPourcentage.length) * 100; // MAX_FISH_TYPES est le nombre total de types de poissons
  fishProgressBar.style.width = percentage + "%";

  // Mettre à jour le texte à l'intérieur de la barre de progression
  fishProgressPercent.textContent = percentage.toFixed(0) + "%";
}

// Ajoutez un gestionnaire d'événements pour le bouton
showListButton.addEventListener("click", function () {
  // Vérifiez si le bouton a déjà la classe "clicked"
  if (this.classList.contains("clicked")) {
    // Si oui, enlevez la classe "clicked"
    this.classList.remove("clicked");
  } else {
    // Sinon, ajoutez la classe "clicked" pour changer le style
    this.classList.add("clicked");
  }
});

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

function plural(singular) {
  if (singular.substring(singular.length - 3) == "eau") {
    return singular + "x";
  } else if (singular.includes(" ")) {
    const words = singular.split(" ");
    const pluralWords = words.map((word) => word + "s");

    // Rejoindre les mots avec un espace pour former la nouvelle chaîne
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
    // Calculez la vitesse en fonction du pourcentage du poisson
    const percentage = fish.pourcentage;
    // Inversez la relation entre le pourcentage et la vitesse
    const invertedPercentage = 100 - percentage;
    // Calculez la vitesse en fonction de l'inverse du pourcentage
    const speed = minSpeed + (invertedPercentage / 100) * (maxSpeed - minSpeed);

    // Assurez-vous que la vitesse reste dans la plage spécifiée (minspeed à maxspeed)
    return Math.min(maxSpeed, Math.max(minSpeed, speed));
  } else {
    // Retournez une valeur par défaut (par exemple, 0) si le poisson n'est pas trouvé
    return 0;
  }
}

let colors = [];

function setSegmentSize() {
  // Obtenir le pourcentage du poisson sélectionné au hasard
  const selectedFish = poissonsDeMerAvecPourcentage.find(
    (fish) => fish.nom === randomFish
  );
  const selectedFishPercentage = selectedFish ? selectedFish.pourcentage : 0;

  // Mettre à jour la taille du segment du milieu en fonction du pourcentage du poisson
  const middleSegmentWidth = 100 - selectedFishPercentage; // Inverser le pourcentage

  // Mettez à jour la couleur du segment du milieu
  const middleSegment = document.querySelector(".segment-3");
  const adjacentSegment1 = document.querySelector(".segment-2");
  const adjacentSegment2 = document.querySelector(".segment-4");
  // middleSegment.style.backgroundColor = getColorForPosition(
  //   middleSegmentWidth,
  //   100
  // );
  const newWidth = selectedFishPercentage * 2.5; // Exemple de calcul, ajustez-le en fonction de vos besoins

  // Mettez à jour le style du segment du milieu
  middleSegment.style.width = newWidth + "%";
  const adjacentWidth = (100 - newWidth - 20) / 2;

  // Mettez à jour le style des segments
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
  console.log(colors);
}
