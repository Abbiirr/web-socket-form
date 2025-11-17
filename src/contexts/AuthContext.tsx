/**
 * Authentication Context with WebSocket Support
 * Provides authentication state and methods throughout the app
 * Integrates real API calls and WebSocket connections
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import realApiService from '../services/realApiService';
import mockAuthService from '../services/mockAuthService';
import websocketService from '../services/websocketService';
import tokenService from '../services/tokenService';
import type { UserInfo, AuthResponse } from '../types/auth.types';
import type { WebSocketStatus, WebSocketMessage } from '../types/websocket.types';

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;
  wsStatus: WebSocketStatus;
  wsConnected: boolean;
  submitForm: (data: any) => Promise<AuthResponse>;
  requestMagicLink: (email: string) => Promise<AuthResponse>;
  verifyMagicLink: (token: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: () => boolean;
  connectWebSocket: (url?: string) => Promise<void>;
  disconnectWebSocket: () => void;
  sendWebSocketMessage: (message: WebSocketMessage) => void;
  // For demo/testing with mock service
  getLatestMagicLink: () => { email: string; token: string; link: string } | null;
  useMockApi: boolean;
  setUseMockApi: (useMock: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [useMockApi, setUseMockApi] = useState<boolean>(true); // Default to mock for testing

  /**
   * Initialize auth state and WebSocket listeners on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (tokenService.isAuthenticated()) {
          const userInfo = tokenService.getUserInfo();
          setUser(userInfo);

          // Optionally fetch full user profile
          if (userInfo && !useMockApi) {
            try {
              const profile = await realApiService.getUserProfile();
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

    // Setup WebSocket status listener
    const unsubscribeStatus = websocketService.onStatusChange((status) => {
      setWsStatus(status);
      setWsConnected(status === 'connected');
    });

    // Setup WebSocket message listener
    const unsubscribeMessages = websocketService.onMessage(handleWebSocketMessage);

    initAuth();

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      websocketService.cleanup();
    };
  }, [useMockApi]);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Auth context received WebSocket message:', message);

    switch (message.type) {
      case 'AUTH_SUCCESS':
        if (message.payload?.token) {
          tokenService.setTokens({
            accessToken: message.payload.token,
            refreshToken: message.payload.refreshToken,
            expiresIn: message.payload.expiresIn || 3600,
          });
          const userInfo = tokenService.getUserInfo();
          setUser(userInfo);
          setError(null);
        }
        break;

      case 'AUTH_FAILED':
        setError(message.payload?.message || 'Authentication failed');
        tokenService.clearTokens();
        setUser(null);
        break;

      case 'MAGIC_LINK_SENT':
        console.log('Magic link sent via WebSocket');
        break;

      case 'SESSION_CREATED':
        console.log('Session created:', message.payload);
        break;

      case 'REDIRECT':
        if (message.payload?.url) {
          const delay = message.payload.delay || 0;
          setTimeout(() => {
            window.location.href = message.payload.url;
          }, delay);
        }
        break;

      case 'UPDATE_STATUS':
        console.log('Status update:', message.payload?.status);
        break;

      case 'ERROR':
        setError(message.payload?.message || 'An error occurred');
        break;

      default:
        console.log('Unhandled WebSocket message type:', message.type);
    }
  }, []);

  /**
   * Submit form (main API entry point)
   * On success, establishes WebSocket connection
   */
  const submitForm = useCallback(async (data: any): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      // If using real API, call submitForm
      let response;
      if (useMockApi) {
        // Mock form submission
        response = await mockAuthService.requestMagicLink({
          email: data.email,
          clientId: 'magic-link-client',
          redirectUri: `${window.location.origin}/auth/callback`,
        });
      } else {
        response = await realApiService.submitForm(data);
      }

      // On successful API call, connect WebSocket
      if (response) {
        try {
          await connectWebSocket();
          console.log('WebSocket connected after successful form submission');
        } catch (wsError) {
          console.error('WebSocket connection failed:', wsError);
          // Don't fail the whole request if WebSocket fails
        }
      }

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Form submission failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [useMockApi]);

  /**
   * Request magic link
   */
  const requestMagicLink = useCallback(async (email: string): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const response = useMockApi
        ? await mockAuthService.requestMagicLink({
            email,
            clientId: 'magic-link-client',
            redirectUri: `${window.location.origin}/auth/callback`,
          })
        : await realApiService.requestMagicLink(email);

      // Connect WebSocket on success
      if (response && !useMockApi) {
        try {
          await connectWebSocket();
        } catch (wsError) {
          console.warn('WebSocket connection failed:', wsError);
        }
      }

      setLoading(false);
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [useMockApi]);

  /**
   * Verify magic link token
   */
  const verifyMagicLink = useCallback(async (token: string): Promise<AuthResponse> => {
    setError(null);
    setLoading(true);

    try {
      const apiService = useMockApi ? mockAuthService : realApiService;
      const response = await apiService.verifyMagicLink(token);

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
  }, [useMockApi]);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const apiService = useMockApi ? mockAuthService : realApiService;
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      disconnectWebSocket();
      tokenService.clearTokens();
      setUser(null);
      setLoading(false);
    }
  }, [useMockApi]);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    if (useMockApi) return;

    try {
      const profile = await realApiService.getUserProfile();
      const userInfo = tokenService.getUserInfo();
      setUser({ ...userInfo, ...profile });
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [useMockApi]);

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback((): boolean => {
    return tokenService.isAuthenticated();
  }, []);

  /**
   * Connect to WebSocket
   */
  const connectWebSocket = useCallback(async (url?: string): Promise<void> => {
    try {
      await websocketService.connect(url);
      console.log('WebSocket connected successfully');
    } catch (err) {
      console.error('Failed to connect WebSocket:', err);
      throw err;
    }
  }, []);

  /**
   * Disconnect from WebSocket
   */
  const disconnectWebSocket = useCallback(() => {
    websocketService.disconnect();
  }, []);

  /**
   * Send message via WebSocket
   */
  const sendWebSocketMessage = useCallback((message: WebSocketMessage) => {
    try {
      websocketService.send(message);
    } catch (err) {
      console.error('Failed to send WebSocket message:', err);
      throw err;
    }
  }, []);

  /**
   * Get latest magic link (for demo with mock service)
   */
  const getLatestMagicLink = useCallback(() => {
    return mockAuthService.getLatestMagicLink();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    error,
    wsStatus,
    wsConnected,
    submitForm,
    requestMagicLink,
    verifyMagicLink,
    logout,
    refreshUser,
    isAuthenticated,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage,
    getLatestMagicLink,
    useMockApi,
    setUseMockApi,
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
