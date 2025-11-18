/**
 * Form Context
 * Manages form submission and WebSocket connection
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import realApiService from '../services/realApiService';
import websocketService from '../services/websocketService';
import type { WebSocketStatus, WebSocketMessage } from '../types/websocket.types';

type OutcomeType = 'mfa_needed' | 'success' | 'fail' | null;

interface FormContextType {
  loading: boolean;
  error: string | null;
  wsStatus: WebSocketStatus;
  wsConnected: boolean;
  outcome: OutcomeType;
  outcomeData: any;
  submitForm: (data: any) => Promise<{ success: boolean; error?: string }>;
  connectWebSocket: (url?: string) => Promise<void>;
  disconnectWebSocket: () => void;
  sendWebSocketMessage: (message: WebSocketMessage) => void;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
  children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>('disconnected');
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<OutcomeType>(null);
  const [outcomeData, setOutcomeData] = useState<any>(null);

  /**
   * Initialize WebSocket listeners on mount
   */
  useEffect(() => {
    // Setup WebSocket status listener
    const unsubscribeStatus = websocketService.onStatusChange((status) => {
      setWsStatus(status);
      setWsConnected(status === 'connected');
    });

    // Setup WebSocket message listener
    const unsubscribeMessages = websocketService.onMessage(handleWebSocketMessage);

    // Cleanup on unmount
    return () => {
      unsubscribeStatus();
      unsubscribeMessages();
      websocketService.cleanup();
    };
  }, []);

  /**
   * Handle incoming WebSocket messages
   */
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    console.log('Form context received WebSocket message:', message);

    switch (message.type) {
      case 'mfa_needed':
        console.log('MFA required:', message.payload);
        setOutcome('mfa_needed');
        setOutcomeData(message.payload);
        setError(null);
        break;

      case 'success':
        console.log('Registration successful:', message.payload);
        setOutcome('success');
        setOutcomeData(message.payload);
        setError(null);
        break;

      case 'fail':
        console.log('Registration failed:', message.payload);
        setOutcome('fail');
        setOutcomeData(message.payload);
        setError(message.payload?.message || 'Registration failed');
        break;

      case 'UPDATE_STATUS':
        console.log('Status update:', message.payload?.status);
        break;

      case 'REDIRECT':
        if (message.payload?.url) {
          const delay = message.payload.delay || 0;
          setTimeout(() => {
            window.location.href = message.payload.url;
          }, delay);
        }
        break;

      case 'ERROR':
        setError(message.payload?.message || 'An error occurred');
        break;

      default:
        console.log('Unhandled WebSocket message type:', message.type);
    }
  }, []);

  /**
   * Submit form
   * On success, waits 30 seconds, then establishes WebSocket connection with retries
   */
  const submitForm = useCallback(async (data: any): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    setLoading(true);

    try {
      // Submit integration verification
      console.log('Submitting integration verification...');
      const response = await realApiService.verifyIntegration(data);

      // On successful API call
      if (response) {
        console.log('Integration verification successful, waiting 30 seconds...');

        // Wait 30 seconds before attempting WebSocket connection
        await new Promise(resolve => setTimeout(resolve, 30000));

        console.log('Attempting WebSocket connection with retries...');
        // Try to connect to WebSocket with 3 retries and 30-second delays
        const wsConnected = await websocketService.connectWithRetry(
          'ws://localhost:8080/ws/register',
          3,
          30000
        );

        if (!wsConnected) {
          const errorMessage = 'Failed to establish WebSocket connection after 3 attempts';
          setError(errorMessage);
          setLoading(false);
          return { success: false, error: errorMessage };
        }

        console.log('WebSocket connected successfully');
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Form submission failed';
      setError(errorMessage);
      setLoading(false);
      return { success: false, error: errorMessage };
    }
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

  const value: FormContextType = {
    loading,
    error,
    wsStatus,
    wsConnected,
    outcome,
    outcomeData,
    submitForm,
    connectWebSocket,
    disconnectWebSocket,
    sendWebSocketMessage,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

/**
 * Hook to use form context
 */
export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

export default FormContext;
