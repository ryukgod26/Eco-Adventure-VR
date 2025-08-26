// --- Scene UI logic ---
document.addEventListener("DOMContentLoaded", function () {
  const playBtn = document.getElementById("play-btn");
  const hintBtn = document.getElementById("hint-btn");
  const hintText = document.getElementById("hint-text");
  const firePuzzleHint = document.getElementById("fire-puzzle-hint");
  const riverPuzzleHint = document.getElementById("river-puzzle-hint");
  // A-Frame puzzle entities
  const fireEntity = document.querySelector("#fire");
  const firePitEntity = document.querySelector('a-gltf-model[src="#firePit"]');
  const riverPuzzleEntity = document.querySelector("#riverPuzzle");
  // Hide puzzle entities initially
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
  });

  hintBtn.addEventListener("click", function () {
    if (!puzzleStarted) {
      hintText.textContent = "Press Play to start the puzzles!";
      hintText.style.display = "block";
      firePuzzleHint.style.display = "none";
      riverPuzzleHint.style.display = "none";
      return;
    }
    // Show hints for both puzzles
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

    // Attach the collide listener to the entity itself. This avoids
    // querying the DOM before A-Frame has created the entity.
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
        // skip if no name
        if (!node.name) return;
        // correct indexOf usage: look for substring 'ship'
        if (node.name.indexOf("ship") !== -1) {
          // ensure material exists; handle material arrays
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
        // Position popup 2 units in front of camera
        const popupPos = camPos.clone().sub(camDir.multiplyScalar(2));
        popup.setAttribute('position', `${popupPos.x} ${popupPos.y} ${popupPos.z}`);
      }
      // Set popup text to roses info and make it visible
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
      // play sound effect if available
      if (popupSound && popupSound.components && popupSound.components.sound) {
        popupSound.components.sound.playSound();
      }
      // show educational popup
      if (popup) {
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
  // Only close if click is outside popup and flower
  const popupEl = popup;
  const flowerEl = document.querySelector("[flower]");
  const clickedEl = evt.target;
  // Check if click is inside popup or flower
  if (
    popupEl.contains(clickedEl) ||
    (flowerEl && flowerEl.contains(clickedEl))
  ) {
    // Do nothing, let flower click or popup interaction happen
    return;
  }
  // Otherwise, hide popup and popupText
  popup.setAttribute("visible", false);
  const popupText = document.querySelector("#popupText");
  if (popupText) popupText.setAttribute("visible", false);
});

/* global AFRAME */

AFRAME.registerComponent("puzzle-manager", {
  // The init function is called once when the component is first attached.
  init: function () {
    console.log("Puzzle Manager Initialized!");

    // --- 1. Set up Initial State ---
    // This variable will track if the player has "picked up" water.
    this.playerHasWater = false;

    // --- 2. Get References to Our Objects ---
    // We grab the fire and water entities from the HTML using their IDs.
    const fireEl = document.querySelector("#fire");
    const waterEl = document.querySelector("#waterSource");
    const waterSound = document.querySelector("#waterPickup");
    // --- 3. Listen for a Click on the Water Source ---
    waterEl.addEventListener("click", () => {
      console.log("Player clicked the water source!");
      waterSound.play();
      this.playerHasWater = true;

      // Optional: Add feedback to the player, like a sound effect.
    });

    // --- 4. Listen for a Click on the Fire ---
    fireEl.addEventListener("click", () => {
      console.log("Player clicked the fire!");

      // Check the state we are tracking
      if (this.playerHasWater) {
        console.log("SUCCESS: Player had water. Extinguishing fire.");

        // --- 5. Extinguish the Fire ---
        // Make the fire entity invisible.
        fireEl.setAttribute("visible", false);

        // Disable the particle system so the fire effect stops.
        fireEl.setAttribute("particle-system", "enabled", false);

        // Stop the fire's crackling sound.
        fireEl.components.sound.stopSound();

        // --- 6. Reset the State ---
        // The water has been used, so we reset the variable.
        this.playerHasWater = false;
      } else {
        console.log("FAILURE: Player did not have water.");
        // Optional: Add feedback, like a "sizzle" sound, to show it failed.
      }
    });
  },
});

/* global AFRAME */

AFRAME.registerComponent("river-puzzle-manager", {
  // Schema defines the properties of our component.
  // We can set the solution from our HTML.
  schema: {
    solution: { type: "array", default: ["boulder1", "boulder3", "boulder2"] },
  },

  init: function () {
    console.log("River Puzzle Initialized!");

    // --- 1. Set up Initial State ---
    this.playerInput = [];
    this.boulders = this.el.querySelectorAll(".boulder");
    this.riverFlow = this.el.querySelector("#riverFlow");

    // --- 2. Add Click Listeners to Boulders ---
    // We loop through each boulder and tell it to run our 'handleBoulderClick' function when clicked.
    this.boulders.forEach((boulder) => {
      boulder.addEventListener("click", this.handleBoulderClick.bind(this));
    });
  },

  handleBoulderClick: function (evt) {
    // evt.target is the specific element that was clicked.
    const clickedBoulderId = evt.target.id;
    console.log(`Player clicked: ${clickedBoulderId}`);

    // --- 3. Record Player's Input ---
    this.playerInput.push(clickedBoulderId);

    // --- 4. Check if the Input is Correct So Far ---
    const currentIndex = this.playerInput.length - 1;

    // If the boulder they just clicked doesn't match the solution at that step...
    if (this.playerInput[currentIndex] !== this.data.solution[currentIndex]) {
      console.log("Wrong sequence! Resetting puzzle.");
      this.playerInput = []; // Reset their progress.
      // Optional: Add a "failure" sound effect.
      return; // Stop the function here.
    }

    console.log("Correct step in sequence!");
    // Optional: Add a "success" sound effect or make the boulder glow.

    // --- 5. Check if the Full Puzzle is Solved ---
    if (this.playerInput.length === this.data.solution.length) {
      this.solvePuzzle();
    }
  },

  solvePuzzle: function () {
    console.log("PUZZLE SOLVED! The river flows!");

    // Hide all the boulders.
    this.boulders.forEach((boulder) => {
      boulder.setAttribute("visible", false);
    });

    // Show the flowing river.
    this.riverFlow.setAttribute("visible", true);
    // Optional: Play a big "rush of water" sound effect.
  },
});

AFRAME.registerComponent("flow-animation", {
  // Schema defines the properties we can change
  schema: {
    speed: { type: "number", default: 0.1 }, // How fast the water flows
  },

  // The tick function is called on every single frame
  tick: function (time, timeDelta) {
    // Get the material component of the entity (our water plane)
    const material = this.el.getObject3D("mesh").material;

    // Convert timeDelta (milliseconds) to seconds
    const secondsDelta = timeDelta / 1000;

    // Animate the texture's vertical offset
    // This moves the texture downwards, creating a flowing illusion
    material.map.offset.y += secondsDelta * this.data.speed;
  },
});
