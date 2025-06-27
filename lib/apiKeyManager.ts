import axios from 'axios';

const API_KEY_STORAGE_KEY = 'geminiApiKey';

// Get environment API key if available
const ENV_API_KEY: string | undefined = typeof process !== 'undefined' ? process.env.GOOGLE_API_KEY : undefined;

// Function to validate if an API key is properly formatted
const isValidApiKeyFormat = (key: string | null | undefined): boolean => {
  return !!key && key.startsWith('AIza') && key.length > 30;
};

// Ensure TypeScript knows about our global window extension
declare global {
  interface Window {
    __apiKey?: string;
  }
}

// Export types for better type checking
export interface ApiKeyManager {
  saveApiKey: (key: string) => void;
  getApiKey: () => string | null;
  clearApiKey: () => void;
}

export const saveApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Save to localStorage
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    
    // Save to memory for current session
    window.__apiKey = key;
    
    // Update axios defaults if available
    if (typeof axios !== 'undefined') {
      axios.defaults.headers.common['x-api-key'] = key;
    }
  } catch (error) {
    console.error('Error saving API key:', error);
  }
};

export const getApiKey = (): string | null => {
  // Server-side: return environment key if available and valid
  if (typeof window === 'undefined') {
    return ENV_API_KEY && isValidApiKeyFormat(ENV_API_KEY) ? ENV_API_KEY : null;
  }
  
  try {
    // First check memory
    const memoryKey = window.__apiKey;
    if (memoryKey && isValidApiKeyFormat(memoryKey)) {
      return memoryKey;
    }
    
    // Then check localStorage
    const key = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (key && isValidApiKeyFormat(key)) {
      window.__apiKey = key;
      return key;
    }
    
    // Fallback to environment variable (only on client if explicitly exposed)
    if (ENV_API_KEY && isValidApiKeyFormat(ENV_API_KEY)) {
      return ENV_API_KEY;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting API key:', error);
    return null;
  }
};

export const clearApiKey = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear from memory and storage
    delete window.__apiKey;
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    
    // Remove from axios if available
    if (typeof axios !== 'undefined') {
      delete axios.defaults.headers.common['x-api-key'];
    }
  } catch (error) {
    console.error('Error clearing API key:', error);
  }
};

// Initialize with saved key when this module is loaded
if (typeof window !== 'undefined') {
  try {
    // Prefer localStorage key, fallback to env key
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY) || ENV_API_KEY;
    if (savedKey) {
      window.__apiKey = savedKey;
      if (typeof axios !== 'undefined') {
        axios.defaults.headers.common['x-api-key'] = savedKey;
      }
    }
  } catch (error) {
    console.error('Error initializing API key:', error);
    // Still try to use env key if available
    if (ENV_API_KEY && typeof axios !== 'undefined') {
      axios.defaults.headers.common['x-api-key'] = ENV_API_KEY;
    }
  }
} else if (ENV_API_KEY && typeof axios !== 'undefined') {
  // For server-side, use env key if available
  axios.defaults.headers.common['x-api-key'] = ENV_API_KEY;
}

// Export the API key manager functions
export const apiKeyManager: ApiKeyManager = {
  saveApiKey,
  getApiKey,
  clearApiKey
};

export default apiKeyManager;
