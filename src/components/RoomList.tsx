/**
 * RoomList Component
 * Displays available chat rooms and allows joining them
 */

import React, { useState } from 'react';
import type { ChatRoom } from '../types/chat.types';

interface RoomListProps {
  availableRooms: ChatRoom[];
  joinedRoomIds: string[];
  onJoinRoom: (roomId: string) => void;
  onCreateRoom?: (name: string, description?: string) => void;
}

const RoomList: React.FC<RoomListProps> = ({
  availableRooms,
  joinedRoomIds,
  onJoinRoom,
  onCreateRoom,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.trim() && onCreateRoom) {
      onCreateRoom(newRoomName, newRoomDescription);
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="room-list">
      <div className="room-list-header">
        <h3>Available Rooms</h3>
        {onCreateRoom && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-room-toggle"
          >
            {showCreateForm ? 'Cancel' : '+ New Room'}
          </button>
        )}
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateRoom} className="create-room-form">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            className="room-name-input"
            autoFocus
          />
          <input
            type="text"
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
            placeholder="Description (optional)"
            className="room-description-input"
          />
          <button type="submit" className="create-room-button" disabled={!newRoomName.trim()}>
            Create Room
          </button>
        </form>
      )}

      <div className="rooms-container">
        {availableRooms.length === 0 ? (
          <div className="no-rooms">No rooms available</div>
        ) : (
          availableRooms.map((room) => {
            const isJoined = joinedRoomIds.includes(room.id);
            return (
              <div key={room.id} className={`room-item ${isJoined ? 'joined' : ''}`}>
                <div className="room-item-info">
                  <h4>{room.name}</h4>
                  {room.description && (
                    <p className="room-description">{room.description}</p>
                  )}
                  <div className="room-meta">
                    <span className="user-count">{room.userCount} user{room.userCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <button
                  onClick={() => onJoinRoom(room.id)}
                  disabled={isJoined}
                  className="join-button"
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RoomList;
