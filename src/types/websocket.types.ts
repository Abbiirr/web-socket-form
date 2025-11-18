/**
 * WebSocket related type definitions
 */

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'closed';

export interface WebSocketMessage {
  type?: string;
  payload?: any;
  timestamp?: number;
  status?: string;
  message?: string;
  [key: string]: any;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketEventHandlers {
  onOpen?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onClose?: (event: CloseEvent) => void;
}

// Common message types
export type MessageType =
  | 'AUTH_SUCCESS'
  | 'AUTH_FAILED'
  | 'REDIRECT'
  | 'UPDATE_STATUS'
  | 'ERROR'
  | 'PING'
  | 'PONG'
  | 'MAGIC_LINK_SENT'
  | 'MAGIC_LINK_VERIFIED'
  | 'SESSION_CREATED'
  | 'CUSTOM';

export interface AuthSuccessMessage extends WebSocketMessage {
  type: 'AUTH_SUCCESS';
  payload: {
    token: string;
    user?: any;
  };
}

export interface RedirectMessage extends WebSocketMessage {
  type: 'REDIRECT';
  payload: {
    url: string;
    delay?: number;
  };
}

export interface StatusUpdateMessage extends WebSocketMessage {
  type: 'UPDATE_STATUS';
  payload: {
    status: string;
    message?: string;
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'ERROR';
  payload: {
    code?: string;
    message: string;
  };
}
