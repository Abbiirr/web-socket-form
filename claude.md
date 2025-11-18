# Multi-Room Chat Application - WebSocket Server Tester

A comprehensive React-based multi-room chat application designed to test WebSocket server capabilities, concurrent connections, and real-time message broadcasting.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup & Installation](#setup--installation)
- [Usage Guide](#usage-guide)
- [WebSocket Protocol](#websocket-protocol)
- [Testing Your WebSocket Server](#testing-your-websocket-server)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)

---

## Overview

This application provides a full-featured chat interface that allows users to:
- Connect to any WebSocket server
- Join multiple chat rooms simultaneously
- Send and receive real-time messages
- Monitor connection status and user presence
- Test server performance under load

**Built with:**
- React 18 + TypeScript
- WebSocket API
- React Router for navigation
- Modern CSS with gradients and animations

---

## Features

### 🚀 Core Features

- **Multi-Room Support**: Join and participate in multiple chat rooms at once
- **Real-Time Messaging**: Instant message delivery via WebSocket connections
- **User Presence**: See when users join or leave rooms
- **Room Management**: Create custom rooms on-the-fly
- **Connection Monitoring**: Real-time connection status indicators
- **Message History**: Per-room message persistence during session
- **Auto-Scroll**: Automatic scrolling to latest messages
- **Responsive Design**: Works on desktop and mobile devices

### 🎨 UI/UX Features

- Beautiful gradient-based theme (purple to blue)
- Smooth animations and transitions
- Distinct message bubbles for own vs. other users
- Timestamp display for all messages
- Member count per room
- System notifications for user join/leave events
- Connection status indicator with colors
- Custom scrollbar styling

### ⚡ Performance Features

- Message deduplication to prevent duplicates
- Optimized re-renders with `useCallback` hooks
- Automatic reconnection with exponential backoff
- Efficient state management
- Lazy message loading

---

## Architecture

### Component Structure

```
src/
├── components/
│   ├── ChatApp.tsx          # Main orchestrator component
│   ├── ChatRoom.tsx          # Individual chat room view
│   └── RoomList.tsx          # Room selection and creation
├── services/
│   └── chatWebSocketService.ts  # WebSocket connection manager
├── types/
│   └── chat.types.ts         # TypeScript type definitions
└── styles/
    └── chat.css              # Application styling
```

### Data Flow

```
User Input → ChatApp → chatWebSocketService → WebSocket Server
                ↓                                      ↓
         State Update ← Message Handler ← WebSocket Message
                ↓
         ChatRoom / RoomList (Re-render)
```

### Key Components

#### 1. **ChatApp** (src/components/ChatApp.tsx:1)
Main component that manages:
- WebSocket connection lifecycle
- Room state (joined rooms, active room)
- Message routing and storage
- User session management

Key features:
- Message deduplication via `addMessageToRoom` helper
- Optimized handlers with `useCallback`
- Connection status tracking
- Automatic cleanup on unmount

#### 2. **ChatRoom** (src/components/ChatRoom.tsx:1)
Renders individual chat room interface:
- Message display with scrolling
- Message input and sending
- Leave room functionality
- Member count display

#### 3. **RoomList** (src/components/RoomList.tsx:1)
Manages room discovery and creation:
- Display available rooms
- Join/create room controls
- Visual indicators for joined rooms

#### 4. **chatWebSocketService** (src/services/chatWebSocketService.ts:1)
Singleton service handling:
- WebSocket connection management
- Message send/receive operations
- Reconnection logic
- Event subscriptions

---

## Setup & Installation

### Prerequisites

- Node.js 16+ and npm
- A WebSocket server (see [Server Implementation](#server-implementation) below)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd web-socket-form
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## Usage Guide

### Getting Started

1. **Open the application** in your browser (default: http://localhost:5173)

2. **Enter connection details:**
   - **Username**: Your display name in chat rooms
   - **WebSocket URL**: Your server URL (e.g., `ws://localhost:8080/chat`)

3. **Click "Connect"** to establish WebSocket connection

### Joining Rooms

1. Browse available rooms in the left sidebar
2. Click "Join" on any room to enter
3. The room will appear in your "Active Rooms" section
4. Click on active room tabs to switch between rooms

### Creating Rooms

1. Click "+ New Room" in the room list
2. Enter a room name (required)
3. Optionally add a description
4. Click "Create Room"

### Sending Messages

1. Select an active room from the tabs
2. Type your message in the input field at the bottom
3. Press Enter or click "Send"
4. Your message appears in real-time for all room members

### Leaving Rooms

- Click "Leave Room" button in the room header
- You'll be removed from the room and messages cleared
- If it was your active room, you'll switch to another joined room

### Disconnecting

- Click "Disconnect" in the top-right corner
- All rooms will be left and connection closed
- You'll return to the connection screen

---

## WebSocket Protocol

### Message Format

All messages are JSON with this structure:

```typescript
{
  type: string,          // Message type (see below)
  payload: any,          // Type-specific data
  timestamp?: number     // Optional timestamp
}
```

### Client → Server Messages

#### 1. JOIN_ROOM
```json
{
  "type": "JOIN_ROOM",
  "payload": {
    "roomId": "general",
    "username": "Alice"
  },
  "timestamp": 1699999999999
}
```

#### 2. LEAVE_ROOM
```json
{
  "type": "LEAVE_ROOM",
  "payload": {
    "roomId": "general"
  },
  "timestamp": 1699999999999
}
```

#### 3. SEND_MESSAGE
```json
{
  "type": "SEND_MESSAGE",
  "payload": {
    "roomId": "general",
    "message": "Hello, world!"
  },
  "timestamp": 1699999999999
}
```

#### 4. ROOM_LIST (Request)
```json
{
  "type": "ROOM_LIST",
  "payload": {},
  "timestamp": 1699999999999
}
```

#### 5. ROOM_MEMBERS (Request)
```json
{
  "type": "ROOM_MEMBERS",
  "payload": {
    "roomId": "general"
  },
  "timestamp": 1699999999999
}
```

### Server → Client Messages

#### 1. ROOM_MESSAGE
```json
{
  "type": "ROOM_MESSAGE",
  "payload": {
    "roomId": "general",
    "userId": "user-123",
    "username": "Alice",
    "message": "Hello, world!",
    "timestamp": 1699999999999
  }
}
```

#### 2. USER_JOINED
```json
{
  "type": "USER_JOINED",
  "payload": {
    "roomId": "general",
    "userId": "user-456",
    "username": "Bob",
    "timestamp": 1699999999999
  }
}
```

#### 3. USER_LEFT
```json
{
  "type": "USER_LEFT",
  "payload": {
    "roomId": "general",
    "userId": "user-456",
    "username": "Bob",
    "timestamp": 1699999999999
  }
}
```

#### 4. ROOM_LIST (Response)
```json
{
  "type": "ROOM_LIST",
  "payload": {
    "rooms": [
      {
        "id": "general",
        "name": "General",
        "description": "General discussion",
        "userCount": 5,
        "createdAt": 1699999999999
      }
    ]
  }
}
```

#### 5. ROOM_MEMBERS (Response)
```json
{
  "type": "ROOM_MEMBERS",
  "payload": {
    "roomId": "general",
    "members": [
      {
        "userId": "user-123",
        "username": "Alice",
        "joinedAt": 1699999999999
      }
    ]
  }
}
```

#### 6. ERROR
```json
{
  "type": "ERROR",
  "payload": {
    "code": "ROOM_NOT_FOUND",
    "message": "The requested room does not exist"
  }
}
```

---

## Testing Your WebSocket Server

### Test Scenarios

#### 1. **Basic Connectivity Test**
- Connect to your server
- Verify connection status shows "Connected"
- Check browser console for WebSocket open event

#### 2. **Single Room Test**
- Join one room
- Send a message
- Verify message appears in the chat
- Open another browser tab with different username
- Verify both users see each other's messages

#### 3. **Multi-Room Test**
- Join 2-3 different rooms
- Switch between rooms
- Send messages to each room
- Verify messages appear only in correct rooms

#### 4. **Concurrent Users Test**
- Open multiple browser tabs/windows
- Connect with different usernames
- Join the same room
- Send messages from different users
- Verify all users receive all messages

#### 5. **Load Test**
- Open 10+ browser tabs
- Connect all simultaneously
- Join multiple rooms from each tab
- Send messages rapidly
- Monitor server CPU/memory usage

#### 6. **Connection Resilience Test**
- Connect to server
- Stop/restart your WebSocket server
- Verify client shows "disconnected" status
- Restart server
- Verify automatic reconnection (if implemented)

#### 7. **Message Ordering Test**
- Send 10 messages rapidly
- Verify they appear in correct order
- Check timestamps are sequential

#### 8. **User Presence Test**
- Join a room
- Verify "USER_JOINED" message appears
- Leave the room
- Verify "USER_LEFT" message appears

### Performance Metrics to Monitor

- **Message Latency**: Time from send to receive
- **Connection Time**: Time to establish WebSocket connection
- **Reconnection Time**: Time to reconnect after disconnect
- **Memory Usage**: Browser memory with many rooms/messages
- **Server Load**: CPU/memory under concurrent connections

### Using Browser DevTools

1. **Network Tab**:
   - Filter by "WS" to see WebSocket connections
   - View all messages sent/received
   - Check connection handshake

2. **Console Tab**:
   - View detailed logging from the application
   - See connection status changes
   - Monitor message flow

3. **Performance Tab**:
   - Record session
   - Check for memory leaks
   - Analyze rendering performance

---

## Server Implementation

### Minimal Server Example (Node.js)

Here's a basic WebSocket server implementation to get started:

```javascript
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// Store rooms and connections
const rooms = new Map();

wss.on('connection', (ws) => {
  console.log('New connection');

  let userId = null;
  let username = null;
  const userRooms = new Set();

  ws.on('message', (data) => {
    const message = JSON.parse(data);

    switch (message.type) {
      case 'JOIN_ROOM':
        const { roomId, username: user } = message.payload;
        userId = userId || `user-${Date.now()}`;
        username = user;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }

        rooms.get(roomId).add(ws);
        userRooms.add(roomId);

        // Broadcast user joined
        broadcast(roomId, {
          type: 'USER_JOINED',
          payload: {
            roomId,
            userId,
            username,
            timestamp: Date.now()
          }
        });
        break;

      case 'SEND_MESSAGE':
        const { roomId: targetRoom, message: msg } = message.payload;

        // Broadcast message to room
        broadcast(targetRoom, {
          type: 'ROOM_MESSAGE',
          payload: {
            roomId: targetRoom,
            userId,
            username,
            message: msg,
            timestamp: Date.now()
          }
        });
        break;

      case 'LEAVE_ROOM':
        const { roomId: leaveRoom } = message.payload;

        if (rooms.has(leaveRoom)) {
          rooms.get(leaveRoom).delete(ws);
          userRooms.delete(leaveRoom);

          broadcast(leaveRoom, {
            type: 'USER_LEFT',
            payload: {
              roomId: leaveRoom,
              userId,
              username,
              timestamp: Date.now()
            }
          });
        }
        break;
    }
  });

  ws.on('close', () => {
    // Clean up user from all rooms
    userRooms.forEach(roomId => {
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(ws);

        broadcast(roomId, {
          type: 'USER_LEFT',
          payload: {
            roomId,
            userId,
            username,
            timestamp: Date.now()
          }
        });
      }
    });
  });

  function broadcast(roomId, message) {
    if (rooms.has(roomId)) {
      rooms.get(roomId).forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    }
  }
});

console.log('WebSocket server running on ws://localhost:8080');
```

### Server Requirements

Your WebSocket server should:

1. **Accept connections** on a WebSocket endpoint
2. **Parse JSON messages** from clients
3. **Handle message types**: JOIN_ROOM, LEAVE_ROOM, SEND_MESSAGE
4. **Broadcast messages** to all users in a room
5. **Track user presence** per room
6. **Send appropriate responses** for each message type
7. **Handle disconnections** gracefully

### Recommended Server Features

- **Authentication**: Validate users before allowing room access
- **Rate Limiting**: Prevent message spam
- **Message History**: Store and send recent messages on room join
- **Room Persistence**: Persist room data to database
- **User Presence**: Track active/idle status
- **Typing Indicators**: Show when users are typing
- **Read Receipts**: Track message read status
- **File Uploads**: Support image/file sharing

---

## Customization

### Adding New Room Types

Edit `src/components/ChatApp.tsx:22`:

```typescript
const DEFAULT_ROOMS: ChatRoomType[] = [
  {
    id: 'your-room-id',
    name: 'Your Room Name',
    description: 'Room description',
    userCount: 0,
    createdAt: Date.now(),
  },
  // ... more rooms
];
```

### Changing WebSocket URL Default

Edit `src/components/ChatApp.tsx:50`:

```typescript
const [wsUrl, setWsUrl] = useState('ws://your-server:port/path');
```

### Customizing Message Types

Add new message types in `src/types/chat.types.ts:33`:

```typescript
export type ChatMessageType =
  | 'JOIN_ROOM'
  | 'LEAVE_ROOM'
  | 'SEND_MESSAGE'
  | 'YOUR_NEW_TYPE'  // Add here
  // ... existing types
```

Then handle in `src/components/ChatApp.tsx` useEffect message handler.

### Styling Customization

Edit `src/styles/chat.css` to change:

- **Colors**: Update gradient colors, backgrounds, borders
- **Fonts**: Change font families and sizes
- **Spacing**: Adjust padding, margins, gaps
- **Animations**: Modify transitions and animations
- **Breakpoints**: Adjust responsive design breakpoints

Example - Change gradient theme:

```css
.chat-app {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Adding Features

#### 1. Typing Indicators

Add state in ChatApp:
```typescript
const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
```

Send typing events:
```typescript
chatWebSocketService.send({
  type: 'TYPING',
  payload: { roomId, username }
});
```

#### 2. Message Reactions

Extend ChatMessage type:
```typescript
export interface ChatMessage {
  // ... existing fields
  reactions?: { emoji: string; users: string[] }[];
}
```

#### 3. Private Messages

Add new component `PrivateChat.tsx` and handle `PRIVATE_MESSAGE` type.

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to WebSocket server

**Solutions**:
1. Verify server is running
2. Check WebSocket URL is correct (ws:// or wss://)
3. Ensure no firewall blocking the port
4. Check browser console for detailed error messages
5. Verify CORS settings if using different domains

### Messages Not Appearing

**Problem**: Messages sent but not visible

**Solutions**:
1. Check browser console for errors
2. Verify server is broadcasting to correct room
3. Ensure message format matches expected protocol
4. Check message deduplication isn't filtering valid messages
5. Verify you're viewing the correct room

### Connection Drops

**Problem**: Connection drops frequently

**Solutions**:
1. Check network stability
2. Verify server has proper keep-alive/ping-pong
3. Review server logs for errors
4. Increase server timeout settings
5. Check for server resource limits

### Performance Issues

**Problem**: App becomes slow with many messages

**Solutions**:
1. Implement message pagination
2. Limit messages stored per room (e.g., last 100)
3. Use React.memo for ChatRoom component
4. Implement virtual scrolling for large message lists
5. Clear old messages periodically

### Build Errors

**Problem**: TypeScript compilation errors

**Solutions**:
1. Run `npm install` to ensure all dependencies installed
2. Check `tsconfig.json` settings
3. Verify all imports are correct
4. Run `npm run type-check` to see specific errors

### UI Issues

**Problem**: Styling looks broken

**Solutions**:
1. Verify `chat.css` is imported in `main.tsx`
2. Check browser console for CSS loading errors
3. Clear browser cache
4. Verify no CSS conflicts with other stylesheets

---

## Advanced Topics

### Message Persistence

To persist messages across sessions, integrate with local storage or a backend API:

```typescript
// Save messages
useEffect(() => {
  localStorage.setItem('chat-messages', JSON.stringify(messagesByRoom));
}, [messagesByRoom]);

// Load messages
useEffect(() => {
  const saved = localStorage.getItem('chat-messages');
  if (saved) {
    setMessagesByRoom(JSON.parse(saved));
  }
}, []);
```

### Authentication

Add token-based authentication:

```typescript
// In chatWebSocketService.ts
connect(wsUrl: string, username: string, token: string): Promise<void> {
  const authenticatedUrl = `${wsUrl}?token=${token}`;
  this.ws = new WebSocket(authenticatedUrl);
  // ... rest of connection logic
}
```

### Encryption

For end-to-end encryption, use Web Crypto API:

```typescript
async function encryptMessage(message: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: crypto.getRandomValues(new Uint8Array(12)) },
    key,
    data
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
```

---

## Contributing

Feel free to extend this application for your needs. Some ideas:

- Voice/video chat support
- File sharing capabilities
- Emoji picker and reactions
- Message search functionality
- User profiles and avatars
- Room moderation tools
- Message threading
- Markdown support

---

## License

This project is part of a WebSocket testing suite. Use freely for testing and development purposes.

---

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console logs
3. Verify your server implementation matches the [WebSocket Protocol](#websocket-protocol)
4. Test with the minimal server example provided

---

**Happy Testing! 🚀**
