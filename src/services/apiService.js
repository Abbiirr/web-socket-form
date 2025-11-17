/**
 * API Service
 * Handles all HTTP requests with OAuth2 token management
 * Implements automatic token refresh and request retry logic
 */

import axios from 'axios';
import config from '../config/env';
import tokenService from './tokenService';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: config.api.baseURL,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (refreshToken) {
          // Attempt to refresh the token
          const response = await axios.post(
            `${config.api.baseURL}/api/auth/refresh`,
            { refreshToken }
          );

          const { accessToken, expiresIn } = response.data;
          tokenService.setTokens({ accessToken, refreshToken, expiresIn });

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenService.clearTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

class ApiService {
  /**
   * Request magic link
   * @param {string} email - User's email address
   */
  async requestMagicLink(email) {
    try {
      const response = await apiClient.post('/api/auth/magic-link/request', {
        email,
        clientId: config.oauth.clientId,
        redirectUri: config.oauth.redirectUri,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify magic link token
   * @param {string} token - Magic link token from URL
   */
  async verifyMagicLink(token) {
    try {
      const response = await apiClient.post('/api/auth/magic-link/verify', {
        token,
        clientId: config.oauth.clientId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Exchange authorization code for tokens (OAuth2 flow)
   * @param {string} code - Authorization code
   */
  async exchangeCodeForToken(code) {
    try {
      const response = await apiClient.post('/api/auth/token', {
        grant_type: 'authorization_code',
        code,
        client_id: config.oauth.clientId,
        redirect_uri: config.oauth.redirectUri,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await apiClient.post('/api/auth/refresh', {
        refreshToken,
        clientId: config.oauth.clientId,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const token = tokenService.getAccessToken();
      if (token) {
        await apiClient.post('/api/auth/logout', {
          token,
        });
      }
    } catch (error) {
      // Don't throw on logout errors
      console.error('Logout error:', error);
    } finally {
      tokenService.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile() {
    try {
      const response = await apiClient.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic GET request
   */
  async get(url, config = {}) {
    try {
      const response = await apiClient.get(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post(url, data, config = {}) {
    try {
      const response = await apiClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put(url, data, config = {}) {
    try {
      const response = await apiClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete(url, config = {}) {
    try {
      const response = await apiClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Error in request setup
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new ApiService();
