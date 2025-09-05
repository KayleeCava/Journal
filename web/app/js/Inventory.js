class Inventory {
    constructor({ overworld, onComplete }) {
        this.overworld = overworld;
        this.onComplete = onComplete;
        this.items = [];
        this.element = null;
        this.defaultDescription = "Hover over an item to see its description.";
    }

    async fetchAndShowItems() {
        const grid = this.element.querySelector(".Inventory_items-grid");
        const descriptionBox = this.element.querySelector(".Inventory_description-box p");

        try {
            const result = await API_SERVICE.getInventory();
            this.items = result.data;

            if (this.items.length === 0) {
                grid.innerHTML = `<p class="Inventory_message">Your inventory is empty.</p>`;
                descriptionBox.textContent = ""; // Hide description text when empty
                return;
            }

            const imagePromises = this.items.map(item => API_SERVICE.fetchImage(item.image));
            const imageDataUris = await Promise.all(imagePromises);
            grid.innerHTML = "";
            this.items.forEach((item, index) => {
                const card = document.createElement("div");
                card.classList.add("Inventory_item-card");

                const imageSrc = imageDataUris[index] || "/images/icons/chill.png";

                card.innerHTML = `
          <div class="Inventory_item-image-container">
            <img src="${imageSrc}" alt="${item.name}" />
          </div>
          <span class="Inventory_item-name">${item.name}</span>
        `;

                // --- ADD EVENT LISTENERS FOR HOVER ---
                card.addEventListener("mouseenter", () => {
                    descriptionBox.textContent = item.description;
                });

                card.addEventListener("mouseleave", () => {
                    descriptionBox.textContent = this.defaultDescription;
                });
                // --- END OF NEW LISTENERS ---

                grid.appendChild(card);
            });

        } catch (error) {
            console.error("Could not fetch inventory:", error);
            grid.innerHTML = `<p class="Inventory_message Inventory_message--error">Could not load inventory.</p>`;
            descriptionBox.textContent = ""; // Hide description text on error
        }
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("Inventory");
        this.element.innerHTML = `
      <div class="Inventory_content">
        <h2>Inventory</h2>
        <div class="Inventory_items-grid">
          <p class="Inventory_message">Loading items...</p>
        </div>
        <div class="Inventory_description-box">
          <p>${this.defaultDescription}</p>
        </div>
        <div class="Inventory_controls">
            <button class="Inventory_close-button">Close</button>
        </div>
      </div>
    `;

        this.element.querySelector(".Inventory_close-button").addEventListener("click", () => {
            this.close();
        });

        this.escapeListener = new KeyPressListener("Escape", () => {
            this.close();
        });
    }

    close() {
        this.escapeListener.unbind();
        this.element.remove();
        this.onComplete();
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
        this.fetchAndShowItems();
    }
}