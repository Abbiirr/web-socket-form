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

        // DETAILED CONNECTION LOGGING
        console.group('🔌 WebSocket Connection Initiated');
        console.log('URL:', wsUrl);
        console.log('Protocol:', wsUrl.startsWith('wss://') ? 'Secure WebSocket (WSS)' : 'WebSocket (WS)');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Default URL:', this.url);
        console.log('Custom URL:', customUrl || 'Not provided');
        console.groupEnd();

        this.setStatus('connecting');

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = (event) => {
          // DETAILED CONNECTION SUCCESS LOGGING
          console.group('✅ WebSocket Connection Established');
          console.log('URL:', wsUrl);
          console.log('ReadyState:', this.ws?.readyState, '(1 = OPEN)');
          console.log('Protocol:', this.ws?.protocol || 'No protocol specified');
          console.log('Extensions:', this.ws?.extensions || 'No extensions');
          console.log('BufferedAmount:', this.ws?.bufferedAmount);
          console.log('Event:', event);
          console.log('Timestamp:', new Date().toISOString());
          console.groupEnd();

          this.setStatus('connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);

            // DETAILED MESSAGE RECEIVED LOGGING
            console.group('📩 WebSocket Message Received');
            console.log('Raw Data:', event.data);
            console.log('Parsed Message:', message);
            console.log('Message Type:', message.type);
            console.log('Payload:', message.payload);
            console.log('Full Payload JSON:', JSON.stringify(message.payload, null, 2));
            console.log('Timestamp:', message.timestamp || 'Not provided');
            console.log('Event Origin:', event.origin || 'N/A');
            console.log('Event LastEventId:', event.lastEventId || 'N/A');
            console.log('Received At:', new Date().toISOString());
            console.groupEnd();

            this.notifyMessageHandlers(message);
          } catch (error) {
            console.group('❌ Failed to parse WebSocket message');
            console.error('Error:', error);
            console.log('Raw Event Data:', event.data);
            console.log('Event:', event);
            console.groupEnd();
          }
        };

        this.ws.onerror = (error) => {
          // DETAILED ERROR LOGGING
          console.group('❌ WebSocket Error');
          console.error('Error Event:', error);
          console.log('URL:', wsUrl);
          console.log('ReadyState:', this.ws?.readyState);
          console.log('ReadyState Meaning:', this.getReadyStateName(this.ws?.readyState));
          console.log('Timestamp:', new Date().toISOString());
          console.groupEnd();

          this.setStatus('error');
          reject(error);
        };

        this.ws.onclose = (event) => {
          // DETAILED CLOSE EVENT LOGGING
          console.group('🔌 WebSocket Connection Closed');
          console.log('URL:', wsUrl);
          console.log('Close Code:', event.code);
          console.log('Close Reason:', event.reason || 'No reason provided');
          console.log('Was Clean Close:', event.wasClean);
          console.log('Event:', event);
          console.log('Timestamp:', new Date().toISOString());
          console.log('Will Reconnect:', this.shouldReconnect && this.reconnectAttempts < config.websocket.maxReconnectAttempts);
          console.groupEnd();

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
  async connectWithRetry(customUrl?: string, maxAttempts: number = 10, retryDelay: number = 30000): Promise<boolean> {
    console.group('🔄 WebSocket Retry Connection Started');
    console.log('URL:', customUrl || this.url);
    console.log('Max Attempts:', maxAttempts);
    console.log('Retry Delay:', retryDelay, 'ms');
    console.groupEnd();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.group(`🔄 WebSocket Connection Attempt ${attempt}/${maxAttempts}`);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();

        await this.connect(customUrl);

        console.group('✅ WebSocket Retry Connection Successful');
        console.log('Attempt:', attempt);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
        return true;
      } catch (error) {
        console.group(`❌ WebSocket Connection Attempt ${attempt} Failed`);
        console.error('Error:', error);
        console.log('Remaining Attempts:', maxAttempts - attempt);
        console.groupEnd();

        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${retryDelay / 1000} seconds before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.group('❌ WebSocket Retry Connection Failed');
    console.error(`Failed to connect after ${maxAttempts} attempts`);
    console.log('URL:', customUrl || this.url);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
    return false;
  }

  /**
   * Connect to WebSocket with status check and retry logic
   * Checks integration status API before each connection attempt
   * Only attempts WebSocket connection if status is SUCCESS
   */
  async connectWithStatusCheck(
    integrationId: string,
    statusCheckFn: (id: string) => Promise<any>,
    wsUrl?: string,
    maxAttempts: number = 10,
    retryDelay: number = 30000
  ): Promise<boolean> {
    console.group('🔄 WebSocket Connection with Status Check Started');
    console.log('Integration ID:', integrationId);
    console.log('WebSocket URL:', wsUrl || this.url);
    console.log('Max Attempts:', maxAttempts);
    console.log('Retry Delay:', retryDelay, 'ms');
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.group(`🔄 Attempt ${attempt}/${maxAttempts} - Checking Status API`);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();

        // Check status API
        const statusResponse = await statusCheckFn(integrationId);
        const status = statusResponse?.data?.status;

        console.group('📋 Status Check Result');
        console.log('Status:', status);
        console.log('Response:', statusResponse);
        console.log('Attempt:', attempt);
        console.groupEnd();

        if (status === 'SUCCESS') {
          console.group('✅ Status is SUCCESS - Attempting WebSocket Connection');
          console.log('Attempt:', attempt);
          console.log('Timestamp:', new Date().toISOString());
          console.groupEnd();

          try {
            await this.connect(wsUrl);

            console.group('✅ WebSocket Connection Successful');
            console.log('Attempt:', attempt);
            console.log('Integration ID:', integrationId);
            console.log('Timestamp:', new Date().toISOString());
            console.groupEnd();

            return true;
          } catch (wsError) {
            console.group('❌ WebSocket Connection Failed (Status was SUCCESS)');
            console.error('WebSocket Error:', wsError);
            console.log('Attempt:', attempt);
            console.log('Will retry status check on next attempt');
            console.groupEnd();
          }
        } else {
          console.group('⏸️ Status is not SUCCESS');
          console.log('Current Status:', status);
          console.log('Expected Status:', 'SUCCESS');
          console.log('Attempt:', attempt);
          console.log('Will retry after delay');
          console.groupEnd();
        }

        // Wait before next attempt
        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${retryDelay / 1000} seconds before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      } catch (error) {
        console.group(`❌ Attempt ${attempt} Failed`);
        console.error('Error:', error);
        console.log('Integration ID:', integrationId);
        console.log('Remaining Attempts:', maxAttempts - attempt);
        console.groupEnd();

        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${retryDelay / 1000} seconds before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    console.group('❌ Failed to Connect with Status Check');
    console.error(`Failed after ${maxAttempts} attempts`);
    console.log('Integration ID:', integrationId);
    console.log('WebSocket URL:', wsUrl || this.url);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

    return false;
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.group('🔌 Disconnecting WebSocket');
    console.log('URL:', this.url);
    console.log('Current Status:', this.status);
    console.log('ReadyState:', this.ws?.readyState);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();

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

    console.log('✅ WebSocket disconnected successfully');
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (!this.ws || this.status !== 'connected') {
      console.error('Cannot send message - WebSocket not connected. Status:', this.status);
      throw new Error('WebSocket not connected');
    }

    try {
      const messageString = JSON.stringify(message);

      // DETAILED MESSAGE SEND LOGGING
      console.group('📤 WebSocket Message Sending');
      console.log('Message Object:', message);
      console.log('Message Type:', message.type);
      console.log('Payload:', message.payload);
      console.log('Full Payload JSON:', JSON.stringify(message.payload, null, 2));
      console.log('Serialized Message:', messageString);
      console.log('Message Size (bytes):', new Blob([messageString]).size);
      console.log('Connection URL:', this.url);
      console.log('ReadyState:', this.ws.readyState, '(1 = OPEN)');
      console.log('BufferedAmount Before:', this.ws.bufferedAmount);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();

      this.ws.send(messageString);

      // Log after send
      console.log('✅ Message sent successfully. BufferedAmount After:', this.ws.bufferedAmount);
    } catch (error) {
      console.group('❌ Failed to send WebSocket message');
      console.error('Error:', error);
      console.log('Message:', message);
      console.log('Connection Status:', this.status);
      console.log('ReadyState:', this.ws?.readyState);
      console.groupEnd();
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

    console.group('⏱️ Scheduling WebSocket Reconnection');
    console.log('Attempt Number:', this.reconnectAttempts);
    console.log('Max Attempts:', config.websocket.maxReconnectAttempts);
    console.log('Delay:', delay, 'ms');
    console.log('Delay (seconds):', delay / 1000);
    console.log('URL:', this.url);
    console.log('Scheduled At:', new Date().toISOString());
    console.groupEnd();

    this.reconnectTimer = setTimeout(() => {
      console.group(`🔄 Executing Reconnection Attempt ${this.reconnectAttempts}/${config.websocket.maxReconnectAttempts}`);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();

      this.connect().catch((error) => {
        console.group('❌ Reconnection Failed');
        console.error('Error:', error);
        console.log('Attempt:', this.reconnectAttempts);
        console.log('Timestamp:', new Date().toISOString());
        console.groupEnd();
      });
    }, delay);
  }

  /**
   * Set connection status and notify handlers
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      const oldStatus = this.status;
      this.status = status;

      console.group('🔄 WebSocket Status Change');
      console.log('Previous Status:', oldStatus);
      console.log('New Status:', status);
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();

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

  /**
   * Get human-readable name for WebSocket ready state
   */
  private getReadyStateName(readyState?: number): string {
    if (readyState === undefined) return 'UNKNOWN';
    switch (readyState) {
      case 0: return 'CONNECTING';
      case 1: return 'OPEN';
      case 2: return 'CLOSING';
      case 3: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  }
}

export default new WebSocketService();
