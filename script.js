
document.addEventListener("DOMContentLoaded", function () {
  const playBtn = document.getElementById("play-btn");
  const hintBtn = document.getElementById("hint-btn");
  const hintText = document.getElementById("hint-text");
  const firePuzzleHint = document.getElementById("fire-puzzle-hint");
  const riverPuzzleHint = document.getElementById("river-puzzle-hint");

  const sceneUi = document.getElementById('scene-ui');
  const fireEntity = document.querySelector("#fire");
  const firePitEntity = document.querySelector('a-gltf-model[src="#firePit"]');
  const riverPuzzleEntity = document.querySelector("#riverPuzzle");

  if (fireEntity) fireEntity.setAttribute("visible", false);
  if (firePitEntity) firePitEntity.setAttribute("visible", false);
  if (riverPuzzleEntity) riverPuzzleEntity.setAttribute("visible", false);
  let puzzleStarted = false;

  playBtn.addEventListener("click", function () {
    if (fireEntity) fireEntity.setAttribute("visible", true);
    if (firePitEntity) firePitEntity.setAttribute("visible", true);
    if (riverPuzzleEntity) riverPuzzleEntity.setAttribute("visible", true);
    puzzleStarted = true;
    hintText.style.display = "none";
    firePuzzleHint.style.display = "none";
    riverPuzzleHint.style.display = "none";
    sceneUi.style.display = 'none';
  });

  hintBtn.addEventListener("click", function () {
    if (!puzzleStarted) {
      hintText.textContent = "Press Play to start the puzzles!";
      hintText.style.display = "block";
      firePuzzleHint.style.display = "none";
      riverPuzzleHint.style.display = "none";
      return;
    }
    // Show hints 
    firePuzzleHint.textContent = "Hint: Use water to extinguish the fire.";
    firePuzzleHint.style.display = "block";
    riverPuzzleHint.textContent =
      "Hint: Click the boulders in the correct sequence to let the river flow.";
    riverPuzzleHint.style.display = "block";
    hintText.style.display = "none";
  });
});
AFRAME.registerComponent("log", {
  schema: {
    message: { type: "string", default: "Change the default message" },
  },

  init: function () {
    // Do something when component first attached.
    let msg = this.data.message;
    console.log(msg);

    this.el.addEventListener("collide", function (evt) {
      console.log("collided", evt);
    });
  },
});

AFRAME.registerComponent("change-color-on-hover", {
  dependencies: ["material"],
  schema: {
    color: { default: "#FF0000" },
  },

  init: function () {
    let el = this.el;
    let data = this.data;
    let defaultColor = el.getAttribute("material").color;

    el.addEventListener("mouseenter", function (env) {
      el.setAttribute("color", data.color);
    });
    el.addEventListener("mouseleave", function (env) {
      el.setAttribute("color", defaultColor);
    });
  },

  update: function () {
    // Do something when component's data is updated.
  },

  remove: function () {
    // Do something the component or its entity is detached.
  },

  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  },
});

AFRAME.registerComponent("modify-materials", {
  init: function () {
    this.el.addEventListener("model-loaded", () => {
      const obj = this.el.getObject3D("mesh");
      obj.traverse((node) => {

        if (!node.name) return;

        if (node.name.indexOf("ship") !== -1) {

          if (!node.material) return;
          const materials = Array.isArray(node.material)
            ? node.material
            : [node.material];
          materials.forEach((mat) => {
            if (!mat) return;
            if (mat.color && typeof mat.color.set === "function") {
              // prefer THREE.Color if available
              if (window.THREE && window.THREE.Color) {
                mat.color.set(new window.THREE.Color("green"));
              } else {
                mat.color.set("green");
              }
            }
          });
        }
      });
    });
  },
});

AFRAME.registerComponent("flower", {
  schema: {
    text: { default: "Change the default text.", type: "string" },
  },
  init: function () {
    const el = this.el;
  

    const showPopup = () => {
      console.log('Flower is Clicked');
      const popupSound = document.querySelector('#popupSound');
      const popup = document.querySelector('#popup');
      const popupText = document.querySelector('#popupText');
      // Get camera and position popup in front of it
      const camera = document.querySelector('[camera]');
      if (camera && popup) {
        const camObj = camera.object3D;
        const camPos = new THREE.Vector3();
        camObj.getWorldPosition(camPos);
        const camDir = new THREE.Vector3();
        camObj.getWorldDirection(camDir);

        const popupPos = camPos.clone().sub(camDir.multiplyScalar(2));
        popup.setAttribute('position', `${popupPos.x} ${popupPos.y} ${popupPos.z}`);
      }

      if (popupText) {
        console.log(this.data.text);
        
        popupText.setAttribute('text', {
  value: this.data.text,
  color: '#FFF',
  align: 'center',
  width: 1.4
});
        popupText.setAttribute('visible', true);
      }

      if (popupSound && popupSound.components && popupSound.components.sound) {
        popupSound.components.sound.playSound();
      }

      if (popup) {
        console.log('poup is showinp');
        
        popup.setAttribute('visible', true);
      }
    };
    el.addEventListener('click', showPopup);
  }
});

// close popup on click
document.addEventListener("click", function (evt) {
  const popup = document.querySelector("#popup");
  if (!popup) return;
  if (!popup.getAttribute("visible")) return;

  const popupEl = popup;
  const flowerEl = document.querySelector("[flower]");
  const clickedEl = evt.target;

  if (
    popupEl.contains(clickedEl) ||
    (flowerEl && flowerEl.contains(clickedEl))
  ) {

    return;
  }

  popup.setAttribute("visible", false);
  const popupText = document.querySelector("#popupText");
  if (popupText) popupText.setAttribute("visible", false);
});



AFRAME.registerComponent("puzzle-manager", {

  init: function () {
    console.log("Puzzle Manager Initialized!");


    this.playerHasWater = false;


    const fireEl = document.querySelector("#fire");
    const waterEl = document.querySelector("#waterSource");
    const waterSound = document.querySelector("#waterPickup");

    waterEl.addEventListener("click", () => {
      console.log("Player clicked the water source!");
      waterSound.play();
      this.playerHasWater = true;


    });


    fireEl.addEventListener("click", () => {
      console.log("Player clicked the fire!");


      if (this.playerHasWater) {
        console.log("SUCCESS: Player had water. Extinguishing fire.");

        fireEl.setAttribute("visible", false);

        fireEl.setAttribute("particle-system", "enabled", false);

        fireEl.components.sound.stopSound();

        this.playerHasWater = false;
      } else {
        console.log("FAILURE: Player did not have water.");

      }
    });
  },
});


AFRAME.registerComponent("river-puzzle-manager", {

  schema: {
    solution: { type: "array", default: ["boulder1", "boulder3", "boulder2"] },
  },

  init: function () {
    console.log("River Puzzle Initialized!");

    this.playerInput = [];
    this.boulders = this.el.querySelectorAll(".boulder");
    this.riverFlow = this.el.querySelector("#riverFlow");

    this.boulders.forEach((boulder) => {
      boulder.addEventListener("click", this.handleBoulderClick.bind(this));
    });
  },

  handleBoulderClick: function (evt) {

    const clickedBoulderId = evt.target.id;
    console.log(`Player clicked: ${clickedBoulderId}`);


    this.playerInput.push(clickedBoulderId);


    const currentIndex = this.playerInput.length - 1;


    if (this.playerInput[currentIndex] !== this.data.solution[currentIndex]) {
      console.log("Wrong sequence! Resetting puzzle.");
      this.playerInput = [];
      return;
    }

    console.log("Correct step in sequence!");

    if (this.playerInput.length === this.data.solution.length) {
      this.solvePuzzle();
    }
  },

  solvePuzzle: function () {
    console.log("PUZZLE SOLVED! The river flows!");


    this.boulders.forEach((boulder) => {
      boulder.setAttribute("visible", false);
    });


    this.riverFlow.setAttribute("visible", true);

  },
});

AFRAME.registerComponent("flow-animation", {
 
  schema: {
    speed: { type: "number", default: 0.1 }, 
  },


  tick: function (time, timeDelta) {
    const material = this.el.getObject3D("mesh").material;


    const secondsDelta = timeDelta / 1000;

    material.map.offset.y += secondsDelta * this.data.speed;
  },
});
