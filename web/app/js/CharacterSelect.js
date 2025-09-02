// /js/CharacterSelect.js

class CharacterSelect {
    constructor(config) {
        this.characters = config.characters;
        this.onComplete = null;

        this.selectedCharacterSrc = null; // Track the currently selected character
        this.cardButtons = {}; // Keep track of card elements to manage the 'selected' class
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("CharacterSelect");

        this.element.innerHTML = `
      <h1>Choose your Character</h1>
      <div class="selection-menu"></div>
      <button class="start-game-button" disabled>Start Game</button>
    `;

        // Create a card for each character
        this.characters.forEach(character => {
            const cardButton = document.createElement("button");
            cardButton.classList.add("character-card");
            cardButton.setAttribute("data-char-src", character.src);
            cardButton.innerHTML = `
        <img src="${character.avatarSrc}" alt="${character.name}" />
        <span>${character.name}</span>
      `;
            this.element.querySelector(".selection-menu").appendChild(cardButton);

            // Store reference to the card
            this.cardButtons[character.src] = cardButton;
        });

        // Add event listeners AFTER creating all cards
        Object.values(this.cardButtons).forEach(card => {
            card.addEventListener("click", (event) => {
                const chosenSrc = event.currentTarget.getAttribute("data-char-src");
                this.selectCharacter(chosenSrc);
            });
        });

        // Set up the Start Game button
        this.startGameButton = this.element.querySelector(".start-game-button");
        this.startGameButton.addEventListener("click", () => {
            // When confirmed, resolve the promise with the chosen character
            if (this.selectedCharacterSrc) {
                this.onComplete(this.selectedCharacterSrc);
            }
        });
    }

    // New method to handle selecting a character
    selectCharacter(src) {
        this.selectedCharacterSrc = src;

        // Enable the Start Game button
        this.startGameButton.disabled = false;

        // Update visual "selected" state on cards
        Object.values(this.cardButtons).forEach(card => {
            // Check if this card's src matches the one that was just selected
            if (card.getAttribute("data-char-src") === this.selectedCharacterSrc) {
                card.classList.add("selected");
            } else {
                card.classList.remove("selected");
            }
        });
    }

    destroy() {
        this.element.remove();
    }

    init(container) {
        return new Promise(resolve => {
            this.createElement();
            container.appendChild(this.element);

            this.onComplete = (chosenSrc) => {
                this.destroy();
                resolve(chosenSrc);
            };
        });
    }
}