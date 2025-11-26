// Utility functions for persistent storage
export const storage = {
  // Save data to localStorage
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Error saving to storage:", error);
      return false;
    }
  },

  // Get data from localStorage
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },

  // Remove data from localStorage
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Error removing from storage:", error);
      return false;
    }
  },

  // Clear all storage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing storage:", error);
      return false;
    }
  },
};

// Specific storage keys
export const STORAGE_KEYS = {
  USER_DATA: "quizUserData",
  SCORES: "quizScores",
  REVIEWS: "quizReviews",
  HIGH_SCORES: "quizHighScores",
};
