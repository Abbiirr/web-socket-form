/**
 * Token Service
 * Handles secure storage and management of OAuth2 tokens
 * Implements best practices for token security
 */

import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

class TokenService {
  /**
   * Store authentication tokens securely
   */
  setTokens({ accessToken, refreshToken, expiresIn }) {
    if (!accessToken) {
      console.error('Access token is required');
      return;
    }

    try {
      // Store tokens
      localStorage.setItem(TOKEN_KEY, accessToken);

      if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }

      // Calculate and store expiry time
      if (expiresIn) {
        const expiryTime = Date.now() + (expiresIn * 1000);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  }

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Clear all tokens
   */
  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
  }

  /**
   * Check if token is expired
   */
  isTokenExpired() {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Add 60 second buffer for expiration check
      return decoded.exp < (currentTime + 60);
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  }

  /**
   * Get token expiry time
   */
  getTokenExpiry() {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Decode token payload
   */
  decodeToken(token) {
    try {
      return jwtDecode(token || this.getAccessToken());
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    return token && !this.isTokenExpired();
  }

  /**
   * Get user info from token
   */
  getUserInfo() {
    const token = this.getAccessToken();
    if (!token) return null;

    const decoded = this.decodeToken(token);
    if (!decoded) return null;

    return {
      email: decoded.email || decoded.sub,
      userId: decoded.sub || decoded.user_id,
      roles: decoded.roles || [],
      ...decoded,
    };
  }
}

export default new TokenService();
