import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://app.ignitegrowth.biz',
});

// Request interceptor - AUTOMATICALLY adds Firebase token to all requests
// Follows FIREBASE-AUTH-AND-USER-MANAGEMENT.md pattern
api.interceptors.request.use(
  async (config) => {
    // CLIENT PORTAL ARCHITECTURE: Local routes use relative URLs
    // If URL starts with /api/, use relative URL (no baseURL) - calls client portal's own routes
    // Otherwise, use baseURL for external calls
    if (config.url?.startsWith('/api/')) {
      // Force relative URL for local routes (client portal's own API)
      // CRITICAL: Explicitly set baseURL to current origin to override instance default
      if (typeof window !== 'undefined') {
        // Explicitly use current origin (clientportal.ignitegrowth.biz)
        config.baseURL = window.location.origin;
      } else {
        // Server-side: empty string for relative URLs
        config.baseURL = '';
      }
      
      // Debug logging
      console.log('🔍 Client Portal API Call:', {
        url: config.url,
        baseURL: config.baseURL,
        instanceBaseURL: api.defaults.baseURL,
        fullURL: typeof window !== 'undefined' 
          ? `${window.location.origin}${config.url}`
          : config.url,
        origin: typeof window !== 'undefined' ? window.location.origin : 'server',
      });
    }

    if (typeof window !== 'undefined') {
      try {
        // Get Firebase auth instance
        const firebaseAuth = getAuth();
        const user = firebaseAuth.currentUser;
        
        // If user is authenticated, add token to request
        if (user) {
          try {
            const token = await user.getIdToken(); // Firebase SDK gets fresh token automatically
            config.headers.Authorization = `Bearer ${token}`; // Automatically added!
          } catch (error) {
            console.error('❌ Failed to get Firebase token:', error);
          }
        }
      } catch (error) {
        // Firebase not initialized yet - skip token for now
        if (error.code !== 'app/no-app') {
          console.warn('Firebase auth not available:', error.message);
        }
      }
    }
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handles errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log error for debugging
    if (error.config?.url?.startsWith('/api/')) {
      console.error('❌ Client Portal API Error:', {
        url: error.config.url,
        baseURL: error.config.baseURL,
        fullURL: error.config.url?.startsWith('http') 
          ? error.config.url 
          : `${error.config.baseURL || window.location.origin}${error.config.url}`,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Handle 401 (Unauthorized) - token expired or invalid
    if (error.response?.status === 401) {
      console.error('🚫 Unauthorized - redirecting to login');
      // Clear any stored auth data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

