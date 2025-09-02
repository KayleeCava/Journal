// /js/QuizChoice.js (Final API-driven version)

class QuizChoice {
    constructor({ question, choices, onChoice, onCancel, overworld, successMessage }) {
        this.question = question;
        this.choices = choices; // Each choice now has an 'answer_key'
        this.onChoice = onChoice;
        this.onCancel = onCancel;

        this.overworld = overworld;
        this.successMessage = successMessage;

        this.element = null;
        this.selectedChoice = null;
    }

    createElement() {
        this.element = document.createElement("div");
        this.element.classList.add("QuizChoice");

        let choicesHTML = '';
        this.choices.forEach((choice, index) => {
            const key = index + 1;
            choicesHTML += `
                <button class="QuizChoice_option" data-choice-index="${index}" data-key="${key}">
                    <span class="QuizChoice_key">${key}</span>
                    <span class="QuizChoice_text">${choice.text}</span>
                </button>
            `;
        });

        this.element.innerHTML = `
            <div class="QuizChoice_question"><p>${this.question}</p></div>
            <div class="QuizChoice_options">${choicesHTML}</div>
            <div class="QuizChoice_controls">
                <button class="QuizChoice_button QuizChoice_button--cancel">Cancel</button>
                <span class="QuizChoice_hint">Use arrow keys and Enter to select.</span>
            </div>
        `;
        this.setupEventListeners();
    }
    
    // setupEventListeners, highlightChoice, navigateChoice can remain the same.
    setupEventListeners() {
        this.element.querySelectorAll('.QuizChoice_option').forEach((button, index) => {
            button.addEventListener('click', () => { this.selectChoice(index); });
            button.addEventListener('mouseenter', () => { this.highlightChoice(index); });
        });
        this.element.querySelector('.QuizChoice_button--cancel').addEventListener('click', () => { this.cancel(); });
        this.keyboardListeners = [
            new KeyPressListener("Escape", () => { this.cancel(); }),
            new KeyPressListener("ArrowUp", () => { this.navigateChoice(-1); }),
            new KeyPressListener("ArrowDown", () => { this.navigateChoice(1); }),
            new KeyPressListener("Enter", () => { 
                if (this.highlightedIndex !== null) this.selectChoice(this.highlightedIndex);
            })
        ];
        this.choices.forEach((_, index) => {
            const key = index + 1;
            this.keyboardListeners.push(new KeyPressListener(key.toString(), () => this.selectChoice(index)));
        });
        this.highlightedIndex = null;
    }

    highlightChoice(index) {
        this.element.querySelectorAll('.QuizChoice_option').forEach(btn => btn.classList.remove('highlighted'));
        if (index >= 0 && index < this.choices.length) {
            this.element.querySelectorAll('.QuizChoice_option')[index].classList.add('highlighted');
            this.highlightedIndex = index;
        }
    }

    navigateChoice(direction) {
        const currentIndex = this.highlightedIndex ?? -1;
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = this.choices.length - 1;
        if (newIndex >= this.choices.length) newIndex = 0;
        this.highlightChoice(newIndex);
    }
    
    // --- LOGIC CHANGES START HERE ---

    selectChoice(index) {
        if (index < 0 || index >= this.choices.length) return;

        this.selectedChoice = this.choices[index];
        this.setLoadingState(true);

        // Always call the API, sending the key from the chosen option.
        this.submitAnswer(this.selectedChoice.answer_key);
    }

    async submitAnswer(answerKey) {
        const token = localStorage.getItem("token");
        if (!token) {
            this.done({ correct: false, message: "Error: You are not logged in." });
            return;
        }
        if (!answerKey) {
            // This is a developer-facing error, but we show a nice message.
            this.done({ correct: false, message: "This option seems to be broken." });
            return;
        }

        try {
            const data = await API_SERVICE.submitAnswer(answerKey);
            
            if (this.overworld) {
                await this.overworld.updatePlayerInfo();
            }
            // Correct answer! Pass the success message from the API.
            const message = this.successMessage || "Horray correct!!!";

            this.done({ correct: true, message: message });
        } catch (error) {
            console.error('Error submitting answer:', error);
            
            if (error.response?.status === 409) {
                // Correct, but already solved. Use the API message ("You have already...").
                this.done({ correct: false, message: error.response.data.message });
            } else if (error.response?.status === 400) {
                // Invalid key was sent. This means it's a wrong answer.
                // Use the actual API message instead of a generic one.
                const apiMessage = error.response?.data?.message || "That doesn't seem to be the right answer.";
                this.done({ correct: false, message: apiMessage });
            } else {
                // Generic message for network failures or other errors.
                this.done({ correct: false, message: "Could not connect to the server." });
            }
        }
    }

    setLoadingState(isLoading) {
        this.element.querySelectorAll('button').forEach(button => { button.disabled = isLoading; });
        if (isLoading) this.element.querySelector('.QuizChoice_hint').textContent = 'Checking answer...';
    }

    done(result) {
        this.cleanup();
        if (this.onChoice) {
            this.onChoice({ choice: this.selectedChoice, result: result });
        }
    }

    cancel() { this.cleanup(); if (this.onCancel) this.onCancel(); }
    cleanup() { this.keyboardListeners.forEach(l => l.unbind()); this.element.remove(); }
    init(container) { this.createElement(); container.appendChild(this.element); this.highlightChoice(0); }
}