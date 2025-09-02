class TextMessage {
    constructor({ text, onComplete, onCancel }) {
        this.text = text;
        this.onComplete = onComplete;
        this.onCancel = onCancel; // New callback for cancel functionality

        this.element = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("TextMessage");

        this.element.innerHTML = (`
            <p class="TextMessage_p"></p>
            <button class="TextMessage_button TextMessage_button--cancel">Cancel</button>
            <button class="TextMessage_button TextMessage_button--next">Next</button>
        `)

        this.revealingText = new RevealingText({
            element: this.element.querySelector(".TextMessage_p"),
            text: this.text
        })

        // Next button event listener
        this.element.querySelector(".TextMessage_button--next").addEventListener("click", () => {
            this.done();
        });

        // Cancel button event listener
        this.element.querySelector(".TextMessage_button--cancel").addEventListener("click", () => {
            this.cancel();
        });

        // Space key for next (existing functionality)
        this.actionListener = new KeyPressListener("Space", () => {
            this.actionListener.unbind();
            this.done();
        });

        // Escape key for cancel (optional - good UX)
        this.cancelListener = new KeyPressListener("Escape", () => {
            this.cancelListener.unbind();
            this.cancel();
        });
    }

    done() {
        // Clean up listeners
        if (this.cancelListener) {
            this.cancelListener.unbind();
        }
        this.element.remove();
        this.onComplete();
    }

    cancel() {
        // Clean up listeners
        if (this.actionListener) {
            this.actionListener.unbind();
        }
        this.element.remove();
        if (this.onCancel) {
            this.onCancel();
        }
    }

    init(container) {
        this.createElement();
        container.appendChild(this.element);
        this.revealingText.init();
    }
}