/**
 * Multi-room Chat WebSocket Service
 * Handles multiple chat rooms and real-time messaging
 */

import type {
  ChatWebSocketMessage,
  JoinRoomPayload,
  LeaveRoomPayload,
  SendMessagePayload,
} from '../types/chat.types';

type MessageHandler = (message: ChatWebSocketMessage) => void;
type StatusChangeHandler = (status: ConnectionStatus) => void;

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusChangeHandler> = new Set();
  private shouldReconnect = true;
  private userId: string = '';
  private username: string = '';

  /**
   * Connect to WebSocket server
   */
  connect(wsUrl: string, username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.status === 'connected') {
          console.warn('Already connected to chat server');
          resolve();
          return;
        }

        this.username = username;
        this.userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        console.log('🔌 Connecting to chat server:', wsUrl);
        console.log('👤 Username:', username);
        console.log('🆔 User ID:', this.userId);

        this.setStatus('connecting');
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ Connected to chat server');
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
          this.setStatus('disconnected');

          if (this.shouldReconnect && event.code !== 1000) {
            this.scheduleReconnect(wsUrl);
          }
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as ChatWebSocketMessage;
            console.log('📨 Received:', message);
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

  private scheduleReconnect(wsUrl: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    this.reconnectAttempts++;

    console.log(`🔄 Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(wsUrl, this.username).catch(console.error);
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
   * Join a chat room
   */
  joinRoom(roomId: string): void {
    const payload: JoinRoomPayload = {
      roomId,
      username: this.username,
    };

    this.send({
      type: 'JOIN_ROOM',
      payload,
      timestamp: Date.now(),
    });
  }

  /**
   * Leave a chat room
   */
  leaveRoom(roomId: string): void {
    const payload: LeaveRoomPayload = {
      roomId,
    };

    this.send({
      type: 'LEAVE_ROOM',
      payload,
      timestamp: Date.now(),
    });
  }

  /**
   * Send a message to a room
   */
  sendMessage(roomId: string, message: string): void {
    const payload: SendMessagePayload = {
      roomId,
      message,
    };

    this.send({
      type: 'SEND_MESSAGE',
      payload,
      timestamp: Date.now(),
    });
  }

  /**
   * Request list of available rooms
   */
  requestRoomList(): void {
    this.send({
      type: 'ROOM_LIST',
      payload: {},
      timestamp: Date.now(),
    });
  }

  /**
   * Request list of members in a room
   */
  requestRoomMembers(roomId: string): void {
    this.send({
      type: 'ROOM_MEMBERS',
      payload: { roomId },
      timestamp: Date.now(),
    });
  }

  private send(message: ChatWebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('📤 Sending:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('Cannot send - not connected');
    }
  }

  private handleMessage(message: ChatWebSocketMessage): void {
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

  getStatus(): ConnectionStatus {
    return this.status;
  }

  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  getUserId(): string {
    return this.userId;
  }

  getUsername(): string {
    return this.username;
  }

  private setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.statusHandlers.forEach(handler => handler(newStatus));
    }
  }
}

export default new ChatWebSocketService();
