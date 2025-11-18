/**
 * Chat application type definitions
 */

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  userCount: number;
  createdAt: number;
}

export interface ChatUser {
  id: string;
  username: string;
  roomIds: string[];
  connectedAt: number;
}

export interface RoomMember {
  userId: string;
  username: string;
  joinedAt: number;
}

// WebSocket message types for chat
export type ChatMessageType =
  | 'JOIN_ROOM'
  | 'LEAVE_ROOM'
  | 'SEND_MESSAGE'
  | 'ROOM_MESSAGE'
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'ROOM_LIST'
  | 'ROOM_MEMBERS'
  | 'ERROR';

export interface ChatWebSocketMessage {
  type: ChatMessageType;
  payload: any;
  timestamp?: number;
}

export interface JoinRoomPayload {
  roomId: string;
  username: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface SendMessagePayload {
  roomId: string;
  message: string;
}

export interface RoomMessagePayload {
  roomId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export interface UserJoinedPayload {
  roomId: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface UserLeftPayload {
  roomId: string;
  userId: string;
  username: string;
  timestamp: number;
}

export interface RoomListPayload {
  rooms: ChatRoom[];
}

export interface RoomMembersPayload {
  roomId: string;
  members: RoomMember[];
}
