/**
 * Real API Service
 * Handles all HTTP requests to actual backend API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import config from '../config/env';
import tokenService from './tokenService';

class RealApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
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

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = tokenService.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              tokenService.setTokens({
                accessToken: response.accessToken || response.access_token,
                refreshToken: response.refreshToken || response.refresh_token,
                expiresIn: response.expiresIn || response.expires_in,
              });

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${response.accessToken || response.access_token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            tokenService.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Submit form data
   * This is the main entry point for your form submission
   */
  async submitForm(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/submit', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify integration
   * Calls the verify endpoint after form submission
   */
  async verifyIntegration(data: any): Promise<any> {
    try {
      const response = await this.client.post('/api/v1/common/private/integration/verify', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Request magic link
   */
  async requestMagicLink(email: string): Promise<any> {
    try {
      const response = await this.client.post('/api/auth/magic-link/request', {
        email,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string): Promise<any> {
    try {
      const response = await this.client.post('/api/auth/magic-link/verify', {
        token,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const response = await this.client.post('/api/auth/refresh', {
        refreshToken,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      const token = tokenService.getAccessToken();
      if (token) {
        await this.client.post('/api/auth/logout', { token });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenService.clearTokens();
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    try {
      const response = await this.client.get('/api/user/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message ||
                       error.response.data?.error ||
                       `Request failed with status ${error.response.status}`;
        return new Error(message);
      } else if (error.request) {
        // Request made but no response
        return new Error('No response from server. Please check your connection.');
      }
    }
    // Generic error
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export default new RealApiService();
