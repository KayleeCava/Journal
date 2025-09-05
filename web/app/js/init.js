(async () => {
  const container = document.querySelector(".game-container");
  let loginData = null;
  let chosenCharacterSrc = null;
  let savedGameData = null; 

  const existingToken = localStorage.getItem("token");
  const existingUserString = localStorage.getItem("user");

  if (existingToken) {
    try {
      const validationData = await API_SERVICE.getProfile();
      loginData = { token: existingToken, user: validationData.data };
    } catch (error) {
      console.error(error.message);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }

  if (!loginData) {
    const loginScreen = new LoginScreen();
    loginData = await loginScreen.init(container);
    if (loginData && loginData.token) {
      try {
        const fullProfileData = await API_SERVICE.getProfile();
        loginData.user = fullProfileData.data;
      } catch (error) {
        console.error("Critical error fetching profile after login:", error.message);
        loginData = null;
      }
    }
  }


  if (loginData) {
    const savedGameString = loginData.user.save_game; 

    if (savedGameString) {
      try {
        const result = await API_SERVICE.loadGame(savedGameString);
        savedGameData = result.data; // This is now our usable JSON object

        // If the loaded data has a character, set it for the next step
        if (savedGameData && savedGameData.characterSrc) {
          chosenCharacterSrc = savedGameData.characterSrc;
        }

      } catch (error) {
        console.error("Could not load or process saved game data:", error);
        // If loading fails, we'll proceed as if it's a new player.
      }
    }
  }
  
  if (loginData && !chosenCharacterSrc) {
    const availableCharacters = [
      { name: "Dipper", src: "/images/characters/dipper.png", avatarSrc: "/images/avatars/dipper.png" },
      { name: "Mabel", src: "/images/characters/mabel.png", avatarSrc: "/images/avatars/mabel.png" },
    ];
    const characterSelect = new CharacterSelect({ characters: availableCharacters });

    chosenCharacterSrc = await characterSelect.init(container);

    // Create a temporary Overworld instance to call our powerful saveGame method.
    const tempOverworld = new Overworld({ element: container });
    tempOverworld.playerSpriteSrc = chosenCharacterSrc;
    tempOverworld.token = loginData.token; // The instance needs the token to save

    // The saveGame method needs a minimal map state to function correctly.
    tempOverworld.map = {
      id: "OutsideShack",
      gameObjects: { hero: { x: utils.withGrid(10), y: utils.withGrid(13), direction: "down" } }
    };

    await tempOverworld.saveGame(); // This now saves the character choice to the API.

    // Define the initial state for the game to start immediately after selection.
    savedGameData = {
      mapId: "OutsideShack",
      playerX: utils.withGrid(10),
      playerY: utils.withGrid(13),
      playerDirection: "down",
      characterSrc: chosenCharacterSrc
    };
  }

  if (loginData && chosenCharacterSrc) {
    const overworld = new Overworld({ element: container });
    overworld.init(chosenCharacterSrc, loginData, savedGameData);
  } else {
    console.error("Could not start game. Missing data. Please refresh.");
  }
})();