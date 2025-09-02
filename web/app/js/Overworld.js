class Overworld {
  constructor(config) {
    this.element = config.element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null;

    // Properties to hold player and API data
    this.playerSpriteSrc = null;
    this.token = null;
    this.playerInfo = null;
    this.data = null;

    this.saveInterval = null;
  }

  startGameLoop() {
    const step = () => {
      //Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      //Draw Lower layer
      this.map.drawLowerImage(this.ctx);

      //Draw Game Objects
      Object.values(this.map.gameObjects).sort((a, b) => {
        return a.y - b.y;
      }).forEach(object => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        })
        object.sprite.draw(this.ctx);
      })

      //Draw Upper layer
      this.map.drawUpperImage(this.ctx);

      //Draw Upper layer
      if (!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();
        })
      }
    }
    step();
  }

  // New method to create pause button UI
  createPauseButton() {
    // Create pause button container
    this.pauseButtonContainer = document.createElement("div");
    this.pauseButtonContainer.classList.add("pause-button-container");

    // Create the pause button
    this.pauseButton = document.createElement("button");
    this.pauseButton.classList.add("pause-button");
    this.pauseButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9zM7 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-9A.5.5 0 0 0 9 3H7z"/>
        <path d="M2.5 3.5A1.5 1.5 0 0 1 4 2h.5a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 4.5 14H4a1.5 1.5 0 0 1-1.5-1.5v-9zM4 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5v-9A.5.5 0 0 0 4.5 3H4z"/>
      </svg>
      <span class="pause-button-text">Pause</span>
    `;

    // Add tooltip
    this.pauseButton.title = "Pause Game (Tab)";

    // Add click handler
    this.pauseButton.addEventListener("click", () => {
      this.triggerPause();
    });

    // Add hover effects
    this.pauseButton.addEventListener("mouseenter", () => {
      this.pauseButton.classList.add("pause-button-hover");
    });

    this.pauseButton.addEventListener("mouseleave", () => {
      this.pauseButton.classList.remove("pause-button-hover");
    });

    this.pauseButtonContainer.appendChild(this.pauseButton);
    this.element.appendChild(this.pauseButtonContainer);
  }

  // Method to trigger pause (used by both button click and Tab key)
  triggerPause() {
    if (!this.map.isCutscenePlaying && !this.map.isPaused) {
      this.map.startCutscene([
        { type: "pause" }
      ]);
    }
  }

  bindActionInput() {
    new KeyPressListener("Space", () => {
      this.map.checkForActionCutscene();
    })
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", e => {
      if (e.detail.whoId === "hero") {
        this.map.checkForFootstepCutscene();
      }
    });

    // Tab key for pause
    new KeyPressListener("Tab", () => {
      this.triggerPause();
    });
  }

  startMap(mapConfig, mapId, heroInitialState = null) { // 3. The heroInitialState parameter is no longer needed
    this.map = new OverworldMap(mapConfig);
    this.map.id = mapId;
    this.map.overworld = this;

    // Apply the centrally-stored player sprite to the new map's hero
    const hero = this.map.gameObjects.hero;
    if (hero) {
      hero.src = this.playerSpriteSrc; // Use the stored src
      hero.sprite = new Sprite({
        gameObject: hero,
        src: hero.src,
      });
    }

    if (heroInitialState) {
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.map.mountObjects();
  }

  async saveGame() {
    if (!this.map || !this.map.gameObjects.hero) {
      return;
    }

    const saveData = {
      mapId: this.map.id, // The ID we assign in startMap
      playerX: this.map.gameObjects.hero.x,
      playerY: this.map.gameObjects.hero.y,
      playerDirection: this.map.gameObjects.hero.direction,
      characterSrc: this.playerSpriteSrc,
    };

    console.log("Preparing to save game state...");

    try {
      // Step 1: Get the serialized string from our PHP helper script.
      const serializedString = await API_SERVICE.serializeGame(saveData);      

      console.log("PHP Serialized Data:", serializedString);
      // Step 2: Send the serialized string to the main game API for persistent storage.
      const apiResponse = await API_SERVICE.saveGame(serializedString.data.serialized_data);      
      console.log("Game state successfully saved to API.", apiResponse);

    } catch (error) {
      console.error("Failed to save game data to backend:", error);
    }

  }

  async updatePlayerInfo() {
    try {
      console.log("Refreshing player profile...");
      const response = await API_SERVICE.getProfile();
      this.playerInfo = response.data; // Fix: use response.data instead of response
      console.log("Player profile updated!", this.playerInfo);

    } catch (error) {
      console.error("Could not update player info:", error);
    }
  }

  init(chosenCharacterSrc, loginData, savedGameData = null) {
    // Store all the important state
    this.playerSpriteSrc = chosenCharacterSrc;
    this.token = loginData.token;
    this.playerInfo = loginData.user;

    // Determine the starting map and player position
    let startingMapId = "OutsideShack";
    let heroInitialState = null;

    if (savedGameData) {
      const potentialMapId = savedGameData.mapId;
      const potentialMapConfig = window.OverworldMaps[potentialMapId];

      if (potentialMapConfig && potentialMapConfig.requiresAdmin) {
        if (this.playerInfo.role === "admin") {
          console.log(`Admin user (ID: 1) loading restricted map '${potentialMapId}' from save. Access granted.`);
          startingMapId = potentialMapId;
          heroInitialState = {
            x: savedGameData.playerX,
            y: savedGameData.playerY,
            direction: savedGameData.playerDirection,
          };
        } else {
          console.log(`Access Denied: Non-admin user (ID: ${this.playerInfo.role}) attempted to load restricted map '${potentialMapId}' from save file. Resetting to default location.`);
        }
      } else {
        startingMapId = potentialMapId;
        heroInitialState = {
          x: savedGameData.playerX,
          y: savedGameData.playerY,
          direction: savedGameData.playerDirection,
        };
      }
    }

    this.startMap(window.OverworldMaps[startingMapId], startingMapId, heroInitialState);

    this.createPauseButton();
    this.bindActionInput();
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput();
    this.directionInput.init();

    this.startGameLoop();

    clearInterval(this.saveInterval);
    this.saveInterval = setInterval(() => {
      this.saveGame();
    }, 5000);
  }
}