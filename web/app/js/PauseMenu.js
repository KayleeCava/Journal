// /js/PauseMenu.js (UPDATED)

class PauseMenu {
    constructor({ onComplete, overworld }) {
        this.onComplete = onComplete;
        this.overworld = overworld;
    }

    getOptions(pagekey) {
        if (pagekey === "root") {
            return [
                {
                    label: "Save",
                    description: "Save your progress to the server",
                    // --- THIS IS THE UPDATED HANDLER ---
                    handler: async () => {
                        // Find the description box's text element, which is created by KeyboardMenu
                        const descriptionElement = this.element.querySelector(".DescriptionBox p");
                        if (!descriptionElement) { return; } // Safety check

                        // Store the current description to restore it later
                        const originalDescription = descriptionElement.innerText;

                        // Give immediate feedback
                        descriptionElement.innerText = "Saving...";

                        try {
                            // Call the async saveGame method
                            await this.overworld.saveGame();

                            // On success, show a success message
                            descriptionElement.innerText = "Game Saved Successfully!";

                        } catch (error) {
                            // On failure, show an error message
                            descriptionElement.innerText = "Save Failed! Check connection.";
                            console.error("Manual save from pause menu failed:", error);
                        }

                        // After a couple of seconds, revert back to the original description
                        setTimeout(() => {
                            // Only revert if the menu is still open and showing the save message
                            if (descriptionElement.innerText.includes("Saved") || descriptionElement.innerText.includes("Failed")) {
                                descriptionElement.innerText = originalDescription;
                            }
                        }, 2500);
                    }
                },
                // ... other menu options (How to play, Logout, etc.) remain exactly the same
                {
                    label: "How to play",
                    description: "Control guide",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions("howToPlay"));
                    }
                },
                {
                    label: "Community",
                    description: "Community",
                    handler: () => {
                        // this.keyboardMenu.setOptions(this.getOptions("Community"));
                        window.open(API_CONFIG.INTERNAL_URL, '_blank');
                    }
                },
                {
                    label: "Logout",
                    description: "Logout from the game",
                    handler: async () => {
                        const reallyLogout = window.confirm("Are you sure you want to logout?");
                        if (!reallyLogout) return;

                        const token = this.overworld.token;
                        if (!token) {
                            alert("Could not find authorization token.");
                            return;
                        }

                        try {
                            await API_SERVICE.logout();
                            console.log("Server logout successful.");
                        } catch (error) {
                            console.error(error);
                            alert(error.message);
                        } finally {
                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            window.location.reload();
                        }
                    }
                },
                {
                    label: "Close",
                    description: "Close the pause menu",
                    handler: () => {
                        this.close();
                    }
                },
            ]
        }

        // ... 'Community' and 'howToPlay' page keys remain the same ...
        // if (pagekey === "Community") {
        //     return [
        //         {
        //             label: "Community Page",
        //             description: "Some forum related actions here",
        //             handler: () => {
        //                 console.log("Opening Community...");
        //             }
        //         },
        //         {
        //             label: "Back",
        //             description: "Go back to main pause menu",
        //             handler: () => {
        //                 this.keyboardMenu.setOptions(this.getOptions("root"));
        //             }
        //         },
        //     ];
        // }

        if (pagekey === "howToPlay") {
            return [
                {
                    label: "Movement",
                    description: "Use arrow keys or WASD to move your character",
                    handler: () => { }
                },
                {
                    label: "Interact",
                    description: "Press Space to interact with NPCs and objects",
                    handler: () => { }
                },
                {
                    label: "Pause",
                    description: "Press Tab or click the pause button to open this menu",
                    handler: () => { }
                },
                {
                    label: "Back",
                    description: "Go back to main pause menu",
                    handler: () => {
                        this.keyboardMenu.setOptions(this.getOptions("root"));
                    }
                },
            ];
        }

        return [];
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("PauseMenu");
        // --- REMOVE THE OLD SAVE-STATUS DIV ---
        this.element.innerHTML = (`
            <h2>Pause Menu</h2>
        `);

        // Add overlay for better visual separation
        this.overlay = document.createElement("div");
        this.overlay.classList.add("pause-overlay");
    }

    // ... The rest of the file (disablePauseButton, close, init, etc.) remains unchanged ...
    disablePauseButton() {
        const pauseButton = document.querySelector('.pause-button');
        if (pauseButton) {
            pauseButton.classList.add('disabled');
            pauseButton.disabled = true;
        }
    }

    enablePauseButton() {
        const pauseButton = document.querySelector('.pause-button');
        if (pauseButton) {
            pauseButton.classList.remove('disabled');
            pauseButton.disabled = false;
        }
    }

    close() {
        this.tab?.unbind();
        this.escapeKey?.unbind();
        this.keyboardMenu.end();
        this.element.remove();
        this.overlay?.remove();

        this.enablePauseButton();

        this.onComplete();
    }

    async init(container) {
        this.createElement();
        container.appendChild(this.overlay);

        this.keyboardMenu = new KeyboardMenu({
            descriptionContainer: this.element
        });
        this.keyboardMenu.init(this.element);
        this.keyboardMenu.setOptions(this.getOptions("root"));

        container.appendChild(this.element);

        this.disablePauseButton();

        await utils.wait(200);

        this.tab = new KeyPressListener("Tab", () => {
            this.close();
        });

        this.escapeKey = new KeyPressListener("Escape", () => {
            this.close();
        });
    }
}