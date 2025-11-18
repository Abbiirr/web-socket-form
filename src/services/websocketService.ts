/**
 * WebSocket Service - Fixed for browser authentication
 * Passes auth via query parameters since browsers can't send custom headers
 */

import config from '../config/env';
import tokenService from './tokenService';
import type {
  WebSocketStatus,
  WebSocketMessage
} from '../types/websocket.types';

type MessageHandler = (message: WebSocketMessage) => void;
type StatusChangeHandler = (status: WebSocketStatus) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private status: WebSocketStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusChangeHandler> = new Set();
  private url: string = config.websocket.url;
  private shouldReconnect = true;

  /**
   * Build WebSocket URL with auth params (browsers can't send headers)
   * Mimics Python client auth but via query parameters
   */
  private buildAuthenticatedUrl(baseUrl: string, verificationId?: string): string {
    const token = tokenService.getAccessToken();
    const subject = tokenService.getSubject();

    const url = new URL(baseUrl.startsWith('ws://') || baseUrl.startsWith('wss://')
      ? baseUrl
      : `ws://${baseUrl}`);

    // Use subject as client ID (required by Java server)
    const clientId = subject || `client-${Date.now()}`;
    url.searchParams.set('client', clientId);

    // Add auth token (since we can't send Authorization header)
    if (token) {
      url.searchParams.set('token', token);
    }

    // Add subject (equivalent to X-Subject header)
    if (subject) {
      url.searchParams.set('subject', subject);
    }

    // Add verification ID if provided
    if (verificationId) {
      url.searchParams.set('verificationId', verificationId);
    }

    return url.toString();
  }

  /**
   * Connect to WebSocket server
   */
  connect(customUrl?: string, verificationId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.status === 'connected') {
          console.warn('WebSocket already connected');
          resolve();
          return;
        }

        const baseUrl = customUrl || this.url;
        const wsUrl = this.buildAuthenticatedUrl(baseUrl, verificationId);

        console.group('🔌 WebSocket Connection Initiated');
        console.log('URL:', wsUrl.replace(/token=[^&]+/, 'token=***'));
        console.log('Has Token:', !!tokenService.getAccessToken());
        console.log('Subject:', tokenService.getSubject());
        console.groupEnd();

        this.setStatus('connecting');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket Connected');
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onerror = (event) => {
          console.error('❌ WebSocket Error:', event);
          this.setStatus('error');
          reject(event);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket Closed:', event.code, event.reason);
          this.setStatus('closed');

          if (this.shouldReconnect && event.code !== 1000) {
            this.scheduleReconnect(verificationId);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as WebSocketMessage;
            console.log('📨 Message:', message);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        this.setStatus('error');
        reject(error);
      }
    });
  }

  /**
   * Connect with status check
   */
  async connectWithStatusCheck(
    integrationId: string,
    statusCheckFn: (id: string) => Promise<any>,
    wsUrl?: string,
    maxAttempts: number = 10,
    retryDelay: number = 30000
  ): Promise<boolean> {
    console.log('🔄 Starting connection with status check for:', integrationId);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const statusResponse = await statusCheckFn(integrationId);
        const status = statusResponse?.data?.status;

        console.log(`Attempt ${attempt}: Status = ${status}`);

        if (status === 'SUCCESS') {
          try {
            await this.connect(wsUrl, integrationId);
            console.log('✅ Connected successfully');
            return true;
          } catch (wsError) {
            console.error('WebSocket connection failed:', wsError);
          }
        } else if (status === 'FAILED' || status === 'ERROR') {
          console.error('Integration failed');
          return false;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    return false;
  }

  private scheduleReconnect(verificationId?: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.connect(undefined, verificationId).catch(console.error);
    }, delay);
  }

  disconnect(): void {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Cleanup all resources and reset state
   */
  cleanup(): void {
    // Disconnect WebSocket
    this.disconnect();

    // Clear all handlers
    this.messageHandlers.clear();
    this.statusHandlers.clear();

    // Reset reconnect attempts
    this.reconnectAttempts = 0;
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('Cannot send - not connected');
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    this.messageHandlers.forEach(handler => handler(message));
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  getStatus(): WebSocketStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  private setStatus(newStatus: WebSocketStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusHandlers.forEach(handler => handler(newStatus));
    }
  }
}

export default new WebSocketService();