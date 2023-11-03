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
    pourcentage: 1,
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

init();
animate();

function init() {
  const poissonsPechesStr = localStorage.getItem("poissonsPeches");

  if (poissonsPechesStr) {
    poissonsPeches = JSON.parse(poissonsPechesStr);
    updateFishingList();
    updateProgression();
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
        event.key === "ArrowUp" &&
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
      if (keyState["z"]) {
        boatSound.volume = 0.15;

        boat.position.z -= Math.sin(boatRotation) * moveSpeed;
        boat.position.x += Math.cos(boatRotation) * moveSpeed;
      }
      if (keyState["q"]) {
        boatSound.volume = 0.2;
        boatRotation += Math.PI / 180;
        boat.rotation.set(0, boatRotation, 0);
      }
      if (keyState["d"]) {
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
          updateProgressBar(); // Réinitialise la barre de progression
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

  // Arrêtez le défi après 10 secondes
  setTimeout(() => {
    clearInterval(timer); // Arrêter le compteur
    if (!spacebarChallengeCompleted) {
      progressBar.style.width = "0%";
      progressContainer.style.display = "none";
      spacebarClickCount = 0;
      // Supprimer l'écouteur d'événements de la barre d'espace à la fin du jeu
      document.removeEventListener("keydown", handleSpacebarClick);
      spacebarGameRunning = false;
    }
  }, 10000);
}

const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");

let spacebarClickCount = 0;

// Fonction pour incrémenter le compteur de clics sur la barre d'espace
function handleSpacebarClick() {
  spacebarClickCount++;
  updateProgressBar();
}

// Modifier la fonction updateProgressBar pour gérer la couleur, le pourcentage et le temps
function updateProgressBar() {
  console.log("count : " + spacebarClickCount);
  if (!spacebarChallengeCompleted) {
    const goalClicks = 20;
    const percentage = (spacebarClickCount / goalClicks) * 100;
    progressBar.style.width = percentage + "%";
    console.log("goal : " + goalClicks);

    // Modifier la couleur en fonction de la progression
    if (percentage < 30) {
      progressBar.style.backgroundColor = "#FF0000"; // Rouge
    } else if (percentage < 70) {
      progressBar.style.backgroundColor = "#FFA500"; // Orange
    } else {
      progressBar.style.backgroundColor = "#295e2b"; // Vert
    }

    if (spacebarClickCount == goalClicks) {
      progressBar.style.width = "100%";
      progressBar.style.backgroundColor = "#295e2b"; // Vert
      document.getElementById("timeRemaining").textContent = "0s";
      showCongratulationsMessage();
    }
  }
}

function updateRemainingTime(timeRemaining) {
  document.getElementById("timeRemaining").textContent = `${timeRemaining}s`;
}

const imgRecord = document.querySelector(".imgRecord");
const detailNewFish = document.querySelector(".detailNewFish");
const txtNewFish = document.querySelector(".txtFish");

function showCongratulationsMessage() {
  const randomFish = chaineAleatoireAvecPourcentage(
    poissonsDeMerAvecPourcentage
  );
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
  txtNewFish.textContent = randomFish + " - " + randomSize + " cm";
  detailNewFish.style.display = "flex";

  updateFishingList();

  updateProgression();

  localStorage.setItem("poissonsPeches", JSON.stringify(poissonsPeches));
  setTimeout(() => {
    imgRecord.style.display = "none";
    messageElement.style.display = "none";
    detailNewFish.style.display = "none";
    spacebarChallengeCompleted = true;
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

// Sélectionnez le conteneur de détails de poisson
const fishDetails = document.getElementById("fishDetails");
fishDetails.classList.add("hidden");
// Sélectionnez les éléments de détail du poisson
const fishDetailImage = document.getElementById("fishDetailImage");
const fishDetailName = document.getElementById("fishDetailName");
const fishDetailCount = document.getElementById("fishDetailCount");
const fishPercent = document.getElementById("fishPercent");
const fishMaxSize = document.getElementById("fishMaxSize");

function updateFishingList() {
  // Sélectionnez la grille des poissons
  const fishGrid = document.querySelector(".fish-grid");

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
        fishDetailCount.textContent =
          fishName.charAt(0).toUpperCase() +
          fishName.slice(1) +
          "s" +
          " pêché(e)s : " +
          fishCount;
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
  console.log(numberOfFishTypes);
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
