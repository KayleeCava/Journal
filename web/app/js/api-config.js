// API Configuration
const API_CONFIG = {
  // Get the internal URL from environment variable or use default
  INTERNAL_URL: '{{INTERNAL_URL}}',  

  // Default headers
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// Validate that axios is available
if (typeof axios === 'undefined') {
  console.error('Axios is not loaded. Please ensure axios is included before this script.');
  throw new Error('Axios dependency missing');
}

// Create axios instance with default configuration for API calls
const apiClient = axios.create({
  baseURL: API_CONFIG.INTERNAL_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: 10000 // 10 seconds timeout
});

// Create axios instance for local PHP services
const localClient = axios.create({
  baseURL: window.location.origin, // Use current domain for PHP services
  headers: API_CONFIG.DEFAULT_HEADERS,
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // You can redirect to login here if needed
    }
    return Promise.reject(error);
  }
);

// API service functions
const API_SERVICE = {
  // Get user profile
  async getProfile() {
    try {
      const response = await apiClient.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async register(credentials) {
    try {
      const response = await apiClient.post('/api/register', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/api/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await apiClient.post('/api/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Error during logout:', error);
      // Still remove local storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Save game data using local PHP service
  async serializeGame(gameData) {
    try {
      const response = await localClient.post('/services/saveGame.php', gameData);
      return response.data;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  },

  // Load game data using local PHP service
  async loadGame(saveGameString) {
    try {
      const response = await localClient.post('/services/loadGame.php', {
        save_game_string: saveGameString
      });
      return response.data;
    } catch (error) {
      console.error('Error loading game:', error);
      throw error;
    }
  },

  async saveGame(gameData) {
    try {
      const response = await apiClient.post('/api/save-game', { save_game: gameData });
      return response.data;
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  },

  // Get inventory
  async getInventory() {
    try {
      const response = await apiClient.get('/api/inventory?page=1&per_page=99');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // Submit quiz answer
  async submitAnswer(answerKey) {
    try {
      const response = await apiClient.post('/api/submit-answer', { 
        answer_key: answerKey 
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  async fetchImage(path) {
    try {
      const response = await apiClient.get(`/api${path}`);
      return response.data.data.data_uri;
    } catch (error) {
      console.error('Error fetching image:', error);
      throw error;
    }
  },
  async getFlag(){
    try {
      const response = await apiClient.get('/api/flag');
      return response.data;
    } catch (error) {
      console.error('Error fetching flag:', error);
      throw error;
    }
  },

  // Generic GET request
  async get(endpoint, config = {}) {
    try {
      const response = await apiClient.get(endpoint, config);
      return response.data;
    } catch (error) {
      console.error(`Error in GET request to ${endpoint}:`, error);
      throw error;
    }
  },

  // Generic POST request
  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await apiClient.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      console.error(`Error in POST request to ${endpoint}:`, error);
      throw error;
    }
  }
};

// Make API_SERVICE available globally
window.API_SERVICE = API_SERVICE;
window.API_CONFIG = API_CONFIG;
