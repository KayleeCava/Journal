// /js/ImagePopup.js

class ImagePopup {
    constructor({ src, onComplete }) {
        this.src = src;
        this.onComplete = onComplete;
        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("ImagePopup");
        this.element.innerHTML = `
      <div class="ImagePopup_content">
        <img src="${this.src}" alt="Special Item" />
        <button class="ImagePopup_close-button">&times;</button>
      </div>
    `;

        this.element.querySelector(".ImagePopup_close-button").addEventListener("click", () => {
            this.close();
        });

        // Also close when clicking the background overlay
        this.element.addEventListener("click", (e) => {
            if (e.target === this.element) {
                this.close();
            }
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
    }
}