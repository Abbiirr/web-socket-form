/**
 * ChatApp Component
 * Main component for multi-room chat application
 */

import React, { useState, useEffect } from 'react';
import ChatRoom from './ChatRoom';
import RoomList from './RoomList';
import chatWebSocketService from '../services/chatWebSocketService';
import type {
  ChatMessage,
  ChatRoom as ChatRoomType,
  ChatWebSocketMessage,
  RoomMessagePayload,
  UserJoinedPayload,
  UserLeftPayload,
  RoomListPayload,
  RoomMembersPayload,
} from '../types/chat.types';
import type { ConnectionStatus } from '../services/chatWebSocketService';

const DEFAULT_ROOMS: ChatRoomType[] = [
  {
    id: 'general',
    name: 'General',
    description: 'General discussion',
    userCount: 0,
    createdAt: Date.now(),
  },
  {
    id: 'tech',
    name: 'Technology',
    description: 'Tech talk and programming',
    userCount: 0,
    createdAt: Date.now(),
  },
  {
    id: 'random',
    name: 'Random',
    description: 'Off-topic chat',
    userCount: 0,
    createdAt: Date.now(),
  },
];

const ChatApp: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080/chat');
  const [availableRooms, setAvailableRooms] = useState<ChatRoomType[]>(DEFAULT_ROOMS);
  const [joinedRoomIds, setJoinedRoomIds] = useState<string[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});
  const [memberCountByRoom, setMemberCountByRoom] = useState<Record<string, number>>({});

  useEffect(() => {
    const unsubscribe = chatWebSocketService.onStatusChange((status) => {
      setConnectionStatus(status);
      console.log('Connection status:', status);
    });

    return () => {
      unsubscribe();
      chatWebSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    if (connectionStatus !== 'connected') return;

    const unsubscribe = chatWebSocketService.onMessage((message: ChatWebSocketMessage) => {
      console.log('Received message:', message);

      switch (message.type) {
        case 'ROOM_MESSAGE': {
          const payload = message.payload as RoomMessagePayload;
          const chatMessage: ChatMessage = {
            id: `${payload.timestamp}-${payload.userId}`,
            roomId: payload.roomId,
            userId: payload.userId,
            username: payload.username,
            message: payload.message,
            timestamp: payload.timestamp,
          };

          setMessagesByRoom((prev) => ({
            ...prev,
            [payload.roomId]: [...(prev[payload.roomId] || []), chatMessage],
          }));
          break;
        }

        case 'USER_JOINED': {
          const payload = message.payload as UserJoinedPayload;
          const systemMessage: ChatMessage = {
            id: `system-${payload.timestamp}`,
            roomId: payload.roomId,
            userId: 'system',
            username: 'System',
            message: `${payload.username} joined the room`,
            timestamp: payload.timestamp,
          };

          setMessagesByRoom((prev) => ({
            ...prev,
            [payload.roomId]: [...(prev[payload.roomId] || []), systemMessage],
          }));

          setMemberCountByRoom((prev) => ({
            ...prev,
            [payload.roomId]: (prev[payload.roomId] || 0) + 1,
          }));
          break;
        }

        case 'USER_LEFT': {
          const payload = message.payload as UserLeftPayload;
          const systemMessage: ChatMessage = {
            id: `system-${payload.timestamp}`,
            roomId: payload.roomId,
            userId: 'system',
            username: 'System',
            message: `${payload.username} left the room`,
            timestamp: payload.timestamp,
          };

          setMessagesByRoom((prev) => ({
            ...prev,
            [payload.roomId]: [...(prev[payload.roomId] || []), systemMessage],
          }));

          setMemberCountByRoom((prev) => ({
            ...prev,
            [payload.roomId]: Math.max(0, (prev[payload.roomId] || 0) - 1),
          }));
          break;
        }

        case 'ROOM_LIST': {
          const payload = message.payload as RoomListPayload;
          setAvailableRooms(payload.rooms);
          break;
        }

        case 'ROOM_MEMBERS': {
          const payload = message.payload as RoomMembersPayload;
          setMemberCountByRoom((prev) => ({
            ...prev,
            [payload.roomId]: payload.members.length,
          }));
          break;
        }

        case 'ERROR': {
          console.error('Server error:', message.payload);
          alert(`Error: ${message.payload.message || 'Unknown error'}`);
          break;
        }
      }
    });

    return unsubscribe;
  }, [connectionStatus]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) {
      alert('Please enter a username');
      return;
    }

    try {
      await chatWebSocketService.connect(wsUrl, usernameInput);
      setUsername(usernameInput);
    } catch (error) {
      console.error('Failed to connect:', error);
      alert('Failed to connect to chat server. Please check the URL and try again.');
    }
  };

  const handleDisconnect = () => {
    chatWebSocketService.disconnect();
    setUsername('');
    setJoinedRoomIds([]);
    setActiveRoomId(null);
    setMessagesByRoom({});
    setMemberCountByRoom({});
  };

  const handleJoinRoom = (roomId: string) => {
    if (!joinedRoomIds.includes(roomId)) {
      chatWebSocketService.joinRoom(roomId);
      setJoinedRoomIds((prev) => [...prev, roomId]);
      setActiveRoomId(roomId);
    } else {
      setActiveRoomId(roomId);
    }
  };

  const handleLeaveRoom = (roomId: string) => {
    chatWebSocketService.leaveRoom(roomId);
    setJoinedRoomIds((prev) => prev.filter((id) => id !== roomId));

    if (activeRoomId === roomId) {
      const remainingRooms = joinedRoomIds.filter((id) => id !== roomId);
      setActiveRoomId(remainingRooms.length > 0 ? remainingRooms[0] : null);
    }

    setMessagesByRoom((prev) => {
      const updated = { ...prev };
      delete updated[roomId];
      return updated;
    });
  };

  const handleSendMessage = (roomId: string, message: string) => {
    chatWebSocketService.sendMessage(roomId, message);
  };

  const handleCreateRoom = (name: string, description?: string) => {
    const newRoom: ChatRoomType = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      description,
      userCount: 0,
      createdAt: Date.now(),
    };

    setAvailableRooms((prev) => [...prev, newRoom]);
  };

  if (connectionStatus === 'disconnected' || connectionStatus === 'error') {
    return (
      <div className="chat-app">
        <div className="connection-screen">
          <h1>Multi-Room Chat</h1>
          <p className="subtitle">Test your WebSocket server with multiple chat rooms</p>

          <form onSubmit={handleConnect} className="connection-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter your username"
                className="username-input"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="wsUrl">WebSocket URL</label>
              <input
                id="wsUrl"
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                placeholder="ws://localhost:8080/chat"
                className="ws-url-input"
              />
            </div>

            <button type="submit" className="connect-button" disabled={!usernameInput.trim()}>
              Connect
            </button>

            {connectionStatus === 'error' && (
              <div className="error-message">
                Failed to connect. Please check your server and try again.
              </div>
            )}
          </form>

          <div className="info-section">
            <h3>About this app</h3>
            <p>
              This multi-room chat application helps you test your WebSocket server's capabilities:
            </p>
            <ul>
              <li>Join multiple chat rooms simultaneously</li>
              <li>Real-time messaging across rooms</li>
              <li>See active users in each room</li>
              <li>Test server load and performance</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'connecting') {
    return (
      <div className="chat-app">
        <div className="connecting-screen">
          <h2>Connecting...</h2>
          <p>Establishing connection to chat server</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <div className="chat-header">
        <div className="user-info">
          <h2>Multi-Room Chat</h2>
          <p>Logged in as: <strong>{username}</strong></p>
        </div>
        <button onClick={handleDisconnect} className="disconnect-button">
          Disconnect
        </button>
      </div>

      <div className="chat-container">
        <aside className="sidebar">
          <RoomList
            availableRooms={availableRooms}
            joinedRoomIds={joinedRoomIds}
            onJoinRoom={handleJoinRoom}
            onCreateRoom={handleCreateRoom}
          />

          {joinedRoomIds.length > 0 && (
            <div className="joined-rooms">
              <h4>Active Rooms</h4>
              <div className="room-tabs">
                {joinedRoomIds.map((roomId) => {
                  const room = availableRooms.find((r) => r.id === roomId);
                  return (
                    <button
                      key={roomId}
                      onClick={() => setActiveRoomId(roomId)}
                      className={`room-tab ${activeRoomId === roomId ? 'active' : ''}`}
                    >
                      {room?.name || roomId}
                      <span className="unread-badge">
                        {messagesByRoom[roomId]?.length || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <main className="main-content">
          {activeRoomId ? (
            <ChatRoom
              roomId={activeRoomId}
              roomName={availableRooms.find((r) => r.id === activeRoomId)?.name || activeRoomId}
              messages={messagesByRoom[activeRoomId] || []}
              onSendMessage={handleSendMessage}
              onLeaveRoom={handleLeaveRoom}
              currentUserId={chatWebSocketService.getUserId()}
              memberCount={memberCountByRoom[activeRoomId] || 0}
            />
          ) : (
            <div className="no-room-selected">
              <h3>Welcome to Multi-Room Chat!</h3>
              <p>Select a room from the list to start chatting</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ChatApp;
