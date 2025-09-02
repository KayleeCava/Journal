class LoginScreen {
  constructor(config) {
    this.onComplete = null;
    this.mode = 'login'; // The component can be in either 'login' or 'register' mode
  }

  /**
   * Dynamically builds the HTML for the form based on the current mode.
   * This method is responsible for rendering the correct fields and switcher links.
   */
  _setupForm() {
    let formHTML;

    if (this.mode === 'login') {
      formHTML = `
        <form class="login-form">
          <h1>Shack Quest</h1>
          <p class="login-description">Enter your credentials to begin your adventure.</p>
          
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
          </div>
          
          <div class="form-field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="current-password" />
          </div>

          <div class="error-message"></div>
          
          <button type="submit">Login</button>
          <p class="form-switcher">Don't have an account? <a href="#" data-mode="register">Register here</a></p>
        </form>
      `;
    } else { // Register mode
      // This form has the "register-mode" class for specific compact styling
      formHTML = `
        <form class="login-form register-mode">
          <h1>Create Account</h1>
          <p class="login-description">Join the adventure in Shack Quest!</p>
          
          <div class="form-field">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required autocomplete="name" />
          </div>
          <div class="form-field">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required autocomplete="username" />
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
          </div>
          <div class="form-field">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required autocomplete="new-password" />
          </div>
          <div class="form-field">
            <label for="password_confirmation">Confirm Password</label>
            <input type="password" id="password_confirmation" name="password_confirmation" required autocomplete="new-password" />
          </div>

          <div class="error-message"></div>
          
          <button type="submit">Register</button>
          <p class="form-switcher">Already have an account? <a href="#" data-mode="login">Login here</a></p>
        </form>
      `;
    }

    this.element.innerHTML = formHTML;
    this.errorMessage = this.element.querySelector(".error-message");

    // Re-attach listeners after re-rendering the HTML
    this._attachListeners();
  }

  /**
   * Attaches all necessary event listeners to the form elements.
   */
  _attachListeners() {
    // Listener to switch between login and register forms
    this.element.querySelector(".form-switcher a").addEventListener("click", (e) => {
      e.preventDefault();
      this.mode = e.target.dataset.mode;
      this._setupForm(); // Re-render the form for the new mode
    });

    // Listener for the main form submission
    this.element.querySelector(".login-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      this.errorMessage.textContent = "";

      if (this.mode === 'login') {
        this.handleLogin(e.target);
      } else {
        this.handleRegister(e.target);
      }
    });
  }

  /**
   * Handles the API call and logic for logging in.
   * @param {HTMLFormElement} form The form element that was submitted.
   */
  async handleLogin(form) {
    const requestBody = {
      email: form.email.value,
      password: form.password.value,
    };
    try {
      const data = await API_SERVICE.login(requestBody);
      this.handleAuthSuccess(data.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed.";
      this.errorMessage.textContent = errorMessage;
      console.error("Login failed:", error);
    }
  }

  /**
   * Handles the API call and logic for registration.
   * @param {HTMLFormElement} form The form element that was submitted.
   */
  async handleRegister(form) {
    const password = form.password.value;
    const password_confirmation = form.password_confirmation.value;

    if (password !== password_confirmation) {
      this.errorMessage.textContent = "Passwords do not match.";
      return;
    }

    const requestBody = {
      name: form.name.value,
      username: form.username.value,
      email: form.email.value,
      password: password,
      password_confirmation: password_confirmation
    };

    try {
      const data = await API_SERVICE.register(requestBody);
      this.handleAuthSuccess(data.data);
    } catch (error) {
      let errorMessage = error.response?.data?.message || error.message || "Registration failed.";
      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).map(err => err[0]).join(' ');
      }
      this.errorMessage.textContent = errorMessage;
      console.error("Registration failed:", error);
    }
  }

  /**
   * A unified success handler for both login and registration.
   * Saves data to localStorage and resolves the init promise.
   * @param {object} data The data object from the API response.
   */
  handleAuthSuccess(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    console.log('Authentication Success!', data);
    this.onComplete(data);
  }

  /**
   * Creates the main DOM element for the component.
   */
  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("LoginScreen");
    this._setupForm(); // Call for the initial render
  }

  /**
   * Removes the component's element from the DOM.
   */
  destroy() {
    this.element.remove();
  }

  /**
   * Initializes the component and returns a Promise that resolves on successful authentication.
   * @param {HTMLElement} container The DOM element to append the login screen to.
   * @returns {Promise<object>} A promise that resolves with the user and token data.
   */
  init(container) {
    return new Promise(resolve => {
      this.createElement();
      container.appendChild(this.element);
      this.onComplete = (loginData) => {
        this.destroy();
        resolve(loginData);
      };
    });
  }
}