/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * Uses mock service for pure frontend demonstration
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import mockAuthService from '../services/mockAuthService';
import tokenService from '../services/tokenService';
import type { UserInfo, AuthResponse } from '../types/auth.types';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  requestMagicLink: (email: string) => Promise<AuthResponse>;
  verifyMagicLink: (token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
  getLatestMagicLink: () => { email: string; token: string; link: string } | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
          if (userInfo) {
            try {
              const profile = await mockAuthService.getUserProfile(userInfo.userId);
              setUser({ ...userInfo, ...profile });
            } catch (err) {
              console.warn('Could not fetch user profile:', err);
            }
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
  const requestMagicLink = useCallback(async (email: string): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const response = await mockAuthService.requestMagicLink({
        email,
        clientId: 'magic-link-client',
        redirectUri: `${window.location.origin}/auth/callback`,
      });

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Verify magic link token
   */
  const verifyMagicLink = useCallback(async (token: string): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const response = await mockAuthService.verifyMagicLink(token);

      // Store tokens
      tokenService.setTokens({
        accessToken: response.access_token || response.accessToken || '',
        refreshToken: response.refresh_token || response.refreshToken,
        expiresIn: response.expires_in || response.expiresIn,
      });

      // Set user from token
      const userInfo = tokenService.getUserInfo();
      setUser(userInfo);

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to verify magic link';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await mockAuthService.logout();
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
      const userInfo = tokenService.getUserInfo();
      if (userInfo) {
        const profile = await mockAuthService.getUserProfile(userInfo.userId);
        setUser({ ...userInfo, ...profile });
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    return tokenService.isAuthenticated();
  }, []);

  /**
   * Get latest magic link (for demo)
   */
  const getLatestMagicLink = useCallback(() => {
    return mockAuthService.getLatestMagicLink();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    requestMagicLink,
    verifyMagicLink,
    logout,
    refreshUser,
    isAuthenticated,
    getLatestMagicLink,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
