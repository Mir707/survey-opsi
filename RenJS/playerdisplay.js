// PlayerHelper that works with single player character with combined look names
class PlayerHelper {
  constructor(game) {
    this.game = game;
    console.log("PlayerHelper initialized for single character mode");
  }

  getCurrentPlayerLookName(emotion) {
    const vars = this.game.managers.logic.vars;
    const gender = vars.playerGender;
    const level = vars.playerLevel;

    console.log("Getting look name for:", { gender, level, emotion });

    if (!gender || !level) {
      console.warn(
        "PlayerHelper: Player gender or level not set, using default look"
      );
      return emotion; // fallback to basic emotion
    }

    // Match setup.yaml naming convention: sma_female_neutral
    const lookName = `${level}_${gender}_${emotion}`.toLowerCase();
    console.log("Generated look name:", lookName);
    return lookName;
  }

  showPlayer(emotion) {
    console.log("showPlayer called with emotion:", emotion);

    const lookName = this.getCurrentPlayerLookName(emotion);

    // Check if this look exists in the player character
    const playerCharacter = this.game.managers.character.characters.player;

    if (!playerCharacter) {
      console.error("Player character not found!");
      return;
    }

    console.log("Available looks:", Object.keys(playerCharacter.config.looks));
    console.log("Looking for look:", lookName);

    if (playerCharacter.config.looks[lookName]) {
      // Show the player character with the specific look
      console.log(`Showing player with look: ${lookName}`);
      this.game.managers.character.show("player", lookName);
    } else {
      console.warn(
        `Look "${lookName}" not found, checking fallback options...`
      );

      const baseLook = `${level}_${gender}`.toLowerCase();
      if (playerCharacter.config.looks[baseLook]) {
        console.log(`Using base look: ${baseLook}`);
        this.game.managers.character.show("player", baseLook);
      }
      // Fallback to basic emotion if specific look not found
      if (playerCharacter.config.looks[emotion]) {
        console.log(`Using fallback emotion: ${emotion}`);
        this.game.managers.character.show("player", emotion);
      } else {
        console.error(
          `Neither "${lookName}" nor "${emotion}" found in player looks`
        );
        console.log(
          "Available looks:",
          Object.keys(playerCharacter.config.looks)
        );

        // Ultimate fallback to neutral
        if (playerCharacter.config.looks.neutral) {
          console.log("Using ultimate fallback: neutral");
          this.game.managers.character.show("player", "neutral");
        }
      }
    }
  }

  debugPlayer() {
    const vars = this.game.managers.logic.vars;
    const emotion = "neutral";
    const expectedLook = this.getCurrentPlayerLookName(emotion);

    console.log("=== PLAYER DEBUG INFO ===");
    console.log("Player Data:", {
      gender: vars.playerGender,
      level: vars.playerLevel,
      expectedLook: expectedLook,
      playerName: vars.TextInputName_player,
    });

    const playerCharacter = this.game.managers.character.characters.player;
    if (playerCharacter) {
      console.log("Player character exists");
      console.log(
        "All available looks:",
        Object.keys(playerCharacter.config.looks)
      );
      console.log(
        "Expected look exists?",
        !!playerCharacter.config.looks[expectedLook]
      );
    } else {
      console.error("Player character does not exist!");
    }

    console.log("All variables:", vars);
    console.log("=== END DEBUG ===");
  }

  // Test method to directly show a specific look
  testLook(lookName) {
    console.log(`Testing look: ${lookName}`);
    const playerCharacter = this.game.managers.character.characters.player;

    if (playerCharacter && playerCharacter.config.looks[lookName]) {
      this.game.managers.character.show("player", lookName);
      console.log("✅ Test successful");
    } else {
      console.error("❌ Look not found");
      if (playerCharacter) {
        console.log(
          "Available looks:",
          Object.keys(playerCharacter.config.looks)
        );
      }
    }
  }
}

// Add to global scope after game initialization
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    if (window.game) {
      window.playerHelper = new PlayerHelper(window.game);

      window.showPlayer = (emotion) => {
        console.log("Global showPlayer called with:", emotion);
        window.playerHelper.showPlayer(emotion);
      };

      window.debugPlayer = () => {
        window.playerHelper.debugPlayer();
      };

      // Test function to try specific looks
      window.testLook = (lookName) => {
        window.playerHelper.testLook(lookName);
      };

      console.log(
        "PlayerHelper loaded - single character mode with combined looks"
      );
    } else {
      console.error("Game not found!");
    }
  }, 1000);
});
