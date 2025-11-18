/**
 * ChatRoom Component
 * Displays messages for a specific room and allows sending new messages
 */

import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat.types';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  messages: ChatMessage[];
  onSendMessage: (roomId: string, message: string) => void;
  onLeaveRoom: (roomId: string) => void;
  currentUserId: string;
  memberCount?: number;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  roomId,
  roomName,
  messages,
  onSendMessage,
  onLeaveRoom,
  currentUserId,
  memberCount = 0,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(roomId, messageInput);
      setMessageInput('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="chat-room">
      <div className="chat-room-header">
        <div className="room-info">
          <h3>{roomName}</h3>
          <span className="member-count">{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
        </div>
        <button
          onClick={() => onLeaveRoom(roomId)}
          className="leave-button"
        >
          Leave Room
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.userId === currentUserId ? 'own-message' : 'other-message'}`}
            >
              <div className="message-header">
                <span className="username">{msg.username}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
          autoFocus
        />
        <button type="submit" className="send-button" disabled={!messageInput.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
