/**
 * WebSocket Service
 * Manages WebSocket connections with automatic reconnection
 */

import config from '../config/env';
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
   * Connect to WebSocket server
   */
  connect(customUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.status === 'connected') {
          console.warn('WebSocket already connected');
          resolve();
          return;
        }

        const wsUrl = customUrl || this.url;
        this.setStatus('connecting');

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (_event) => {
          console.log('WebSocket connected');
          this.setStatus('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            this.notifyMessageHandlers(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.setStatus('error');
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.setStatus('closed');
          this.ws = null;

          // Attempt reconnection if needed
          if (this.shouldReconnect && this.reconnectAttempts < config.websocket.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        this.setStatus('error');
        reject(error);
      }
    });
  }

  /**
   * Connect to WebSocket with retry logic
   * Attempts to connect up to maxAttempts times with specified delay between attempts
   */
  async connectWithRetry(customUrl?: string, maxAttempts: number = 3, retryDelay: number = 30000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`WebSocket connection attempt ${attempt}/${maxAttempts}`);
        await this.connect(customUrl);
        console.log('WebSocket connected successfully');
        return true;
      } catch (error) {
        console.error(`WebSocket connection attempt ${attempt} failed:`, error);

        if (attempt < maxAttempts) {
          console.log(`Waiting ${retryDelay / 1000} seconds before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.error(`Failed to connect to WebSocket after ${maxAttempts} attempts`);
    return false;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || this.status !== 'connected') {
      throw new Error('WebSocket not connected');
    }

    try {
      this.ws.send(JSON.stringify(message));
      console.log('WebSocket message sent:', message);
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
      throw error;
    }
  }

  /**
   * Subscribe to WebSocket messages
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(handler: StatusChangeHandler): () => void {
    this.statusHandlers.add(handler);
    // Return unsubscribe function
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /**
   * Get current connection status
   */
  getStatus(): WebSocketStatus {
    return this.status;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.status === 'connected' && this.ws !== null;
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = config.websocket.reconnectInterval * this.reconnectAttempts;

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${config.websocket.maxReconnectAttempts})`);
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Set connection status and notify handlers
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.notifyStatusHandlers(status);
    }
  }

  /**
   * Notify all message handlers
   */
  private notifyMessageHandlers(message: WebSocketMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });
  }

  /**
   * Notify all status handlers
   */
  private notifyStatusHandlers(status: WebSocketStatus): void {
    this.statusHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error('Status handler error:', error);
      }
    });
  }

  /**
   * Clean up and reset
   */
  cleanup(): void {
    this.disconnect();
    this.messageHandlers.clear();
    this.statusHandlers.clear();
    this.reconnectAttempts = 0;
  }
}

export default new WebSocketService();
