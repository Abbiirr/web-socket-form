/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * Implements OAuth2 best practices with automatic token refresh
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import tokenService from '../services/tokenService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Initialize auth state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenService.isAuthenticated()) {
          const userInfo = tokenService.getUserInfo();
          setUser(userInfo);

          // Optionally fetch full user profile
          try {
            const profile = await apiService.getUserProfile();
            setUser({ ...userInfo, ...profile });
          } catch (err) {
            console.warn('Could not fetch user profile:', err);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        tokenService.clearTokens();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Request magic link
   */
  const requestMagicLink = useCallback(async (email) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.requestMagicLink(email);
      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Verify magic link token
   */
  const verifyMagicLink = useCallback(async (token) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.verifyMagicLink(token);

      // Store tokens
      tokenService.setTokens({
        accessToken: response.accessToken || response.access_token,
        refreshToken: response.refreshToken || response.refresh_token,
        expiresIn: response.expiresIn || response.expires_in,
      });

      // Set user from token
      const userInfo = tokenService.getUserInfo();
      setUser(userInfo);

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Login with email and password (traditional OAuth2)
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);

    try {
      const response = await apiService.post('/api/auth/login', {
        email,
        password,
      });

      tokenService.setTokens({
        accessToken: response.accessToken || response.access_token,
        refreshToken: response.refreshToken || response.refresh_token,
        expiresIn: response.expiresIn || response.expires_in,
      });

      const userInfo = tokenService.getUserInfo();
      setUser(userInfo);

      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      tokenService.clearTokens();
      setUser(null);
      setLoading(false);
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    try {
      const profile = await apiService.getUserProfile();
      const userInfo = tokenService.getUserInfo();
      setUser({ ...userInfo, ...profile });
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return tokenService.isAuthenticated();
  }, []);

  const value = {
    user,
    loading,
    error,
    requestMagicLink,
    verifyMagicLink,
    login,
    logout,
    refreshUser,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
