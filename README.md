# Magic Link Authentication with WebSocket Support - React TypeScript App

A modern, production-ready React application demonstrating magic link authentication with OAuth2 best practices and **WebSocket integration**. Features both **mock** (pure frontend) and **real API** modes with WebSocket connections.

## Features

- ✨ **Passwordless Authentication**: Secure magic link-based authentication
- 🔐 **OAuth2 Best Practices**: Implements industry-standard OAuth2 patterns
- 🔌 **WebSocket Integration**: Real-time server communication after form submission
- 🎭 **Dual Mode**: Mock API (demo) or Real API + WebSocket
- 📘 **TypeScript**: Fully typed for better development experience
- ⚛️ **Modern React**: Built with React 18 and functional components
- 📱 **Responsive Design**: Beautiful UI that works on all devices
- 🛡️ **Protected Routes**: Route guards for authenticated content
- 🎫 **Token Management**: Secure JWT token handling with automatic expiration

## Tech Stack

- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe code with excellent IDE support
- **Vite**: Lightning-fast build tool and dev server
- **React Router v6**: Modern routing
- **Axios**: Promise-based HTTP client
- **WebSocket**: Native WebSocket API with reconnection logic
- **jwt-decode**: JWT token decoding and validation
- **CSS3**: Modern styling with animations

## Project Structure

```
web-socket-form/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Protected dashboard
│   │   ├── Home.tsx         # Landing page
│   │   ├── MagicLinkForm.tsx       # Login form with WS indicator
│   │   ├── MagicLinkVerify.tsx     # Token verification
│   │   └── ProtectedRoute.tsx      # Route guard
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Auth state + WebSocket integration
│   ├── services/            # Business logic
│   │   ├── mockAuthService.ts      # Mock auth API
│   │   ├── realApiService.ts       # Real HTTP API client
│   │   ├── websocketService.ts     # WebSocket manager
│   │   └── tokenService.ts         # Token management
│   ├── types/               # TypeScript types
│   │   ├── auth.types.ts    # Auth interfaces
│   │   ├── api.types.ts     # API interfaces
│   │   └── websocket.types.ts      # WebSocket interfaces
│   ├── styles/              # CSS stylesheets
│   ├── config/              # Configuration
│   │   └── env.ts           # Environment variables
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Navigate to the repository**:
   ```bash
   cd web-socket-form
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your API and WebSocket URLs
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Configuration

Environment variables in `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8080/ws

# OAuth2 Configuration
VITE_OAUTH_CLIENT_ID=magic-link-client
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Magic Link Configuration
VITE_MAGIC_LINK_EXPIRY=900000
```

## How It Works

### Dual Mode Architecture

The app supports two modes (toggle via button in the UI):

#### 1. Mock API Mode (Default - Pure Frontend)
- All authentication simulated in browser
- No backend required
- Perfect for demos and testing
- Magic links displayed on screen
- No WebSocket connection

#### 2. Real API + WebSocket Mode
- Makes actual HTTP requests to backend
- Establishes WebSocket connection on success
- Receives real-time updates from server
- Production-ready architecture

### Authentication Flow

#### Standard Flow (Mock Mode):
1. **Request Magic Link**:
   - User enters email
   - Token generated and stored in localStorage
   - Link displayed on screen (simulates email)

2. **Click Magic Link**:
   - Token verified from localStorage
   - JWT tokens generated and stored
   - Redirect to dashboard

#### Real API + WebSocket Flow:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FORM SUBMISSION                                          │
│    User enters email → submitForm() called                  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. HTTP API CALL                                            │
│    POST /api/submit                                         │
│    { email: "user@example.com" }                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API RESPONSE                                             │
│    { success: true, message: "Magic link sent" }            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. WEBSOCKET CONNECTION                                     │
│    ws://localhost:8080/ws                                   │
│    Status: connecting → connected                           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SERVER SENDS MESSAGES                                    │
│    { type: "MAGIC_LINK_SENT", payload: {...} }             │
│    { type: "UPDATE_STATUS", payload: {...} }               │
│    { type: "REDIRECT", payload: {url: "/dashboard"} }       │
└─────────────────────────────────────────────────────────────┘
```

### WebSocket Message Types

The app handles these WebSocket message types:

```typescript
// Authentication success with token
{
  type: "AUTH_SUCCESS",
  payload: {
    token: "jwt_token_here",
    refreshToken: "refresh_token",
    expiresIn: 3600
  }
}

// Authentication failed
{
  type: "AUTH_FAILED",
  payload: {
    message: "Invalid credentials"
  }
}

// Magic link sent confirmation
{
  type: "MAGIC_LINK_SENT",
  payload: {
    email: "user@example.com",
    expiresIn: 900
  }
}

// Status update
{
  type: "UPDATE_STATUS",
  payload: {
    status: "processing",
    message: "Verifying email..."
  }
}

// Redirect instruction
{
  type: "REDIRECT",
  payload: {
    url: "/dashboard",
    delay: 1000  // optional delay in ms
  }
}

// Error message
{
  type: "ERROR",
  payload: {
    code: "INVALID_TOKEN",
    message: "Token has expired"
  }
}
```

### WebSocket Service Features

- **Automatic Reconnection**: Reconnects on disconnect with exponential backoff
- **Max Reconnect Attempts**: Configurable (default: 5)
- **Reconnect Interval**: 3 seconds between attempts
- **Status Tracking**: disconnected → connecting → connected → error/closed
- **Message Handlers**: Subscribe to WebSocket messages
- **Cleanup**: Proper cleanup on unmount

### API Service Features

- **Axios-based**: Professional HTTP client
- **Token Interceptors**: Automatically adds JWT to requests
- **Auto Token Refresh**: Refreshes expired tokens automatically
- **Error Handling**: Comprehensive error messages
- **TypeScript**: Fully typed requests and responses

## Integrating with Your Backend

### 1. Update Environment Variables

```env
VITE_API_BASE_URL=https://your-api.com
VITE_WS_URL=wss://your-api.com/ws
```

### 2. Implement Backend Endpoints

Your backend should implement:

#### HTTP Endpoints:
- `POST /api/submit` - Main form submission endpoint
- `POST /api/auth/magic-link/request` - Request magic link
- `POST /api/auth/magic-link/verify` - Verify magic link token
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/user/profile` - Get user profile

#### WebSocket Endpoint:
- `ws://your-api.com/ws` - WebSocket connection

### 3. WebSocket Server Implementation

Your WebSocket server should:

```javascript
// Example Node.js WebSocket server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    payload: { message: 'WebSocket connected' }
  }));

  // Handle messages from client
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Received:', data);

    // Process based on message type
    switch (data.type) {
      case 'PING':
        ws.send(JSON.stringify({ type: 'PONG' }));
        break;
      // Handle other message types
    }
  });

  // Send updates to client
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'MAGIC_LINK_SENT',
      payload: { email: 'user@example.com' }
    }));
  }, 1000);
});
```

### 4. Toggle to Real API Mode

In the app UI:
1. Click the "Mock API (Demo Mode)" button
2. It will switch to "Real API + WebSocket"
3. The app will now make real HTTP calls and WebSocket connections

## Security Considerations

### Current Implementation

**Mock Mode:**
- Tokens stored in localStorage (acceptable for demos)
- Magic links displayed on screen
- No backend required

**Real API Mode:**
- HTTP-only recommended for production
- CSRF protection recommended
- Rate limiting on backend
- HTTPS/WSS in production

### Production Recommendations

1. **Use HTTP-only Cookies**: Store tokens in HTTP-only cookies
2. **Implement CSRF Protection**: Use CSRF tokens
3. **Add Rate Limiting**: Prevent abuse
4. **Secure WebSocket**: Use WSS (WebSocket Secure) in production
5. **Validate Messages**: Validate all WebSocket messages on server
6. **Authentication**: Authenticate WebSocket connections
7. **HTTPS Only**: Always use HTTPS in production
8. **Content Security Policy**: Implement CSP headers

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## WebSocket API Reference

### Connecting to WebSocket

```typescript
import websocketService from './services/websocketService';

// Connect
await websocketService.connect('ws://localhost:8080/ws');

// Subscribe to messages
const unsubscribe = websocketService.onMessage((message) => {
  console.log('Received:', message);
});

// Send message
websocketService.send({
  type: 'PING',
  payload: {}
});

// Disconnect
websocketService.disconnect();

// Cleanup
unsubscribe();
```

### Using with Auth Context

```typescript
const {
  wsStatus,        // Current WebSocket status
  wsConnected,     // Boolean: is connected
  connectWebSocket,    // Function to connect
  disconnectWebSocket, // Function to disconnect
  sendWebSocketMessage // Function to send message
} = useAuth();

// Connect
await connectWebSocket();

// Send message
sendWebSocketMessage({
  type: 'CUSTOM',
  payload: { data: 'hello' }
});
```

## Troubleshooting

### WebSocket Connection Failed

1. Check backend is running
2. Verify `VITE_WS_URL` in `.env`
3. Check browser console for errors
4. Ensure backend WebSocket server is on correct path

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Type check
npm run type-check

# Build
npm run build
```

### CORS Issues

Configure your backend to allow requests from your frontend origin:

```javascript
// Express example
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers
- WebSocket support required

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

- Built with React, TypeScript, and WebSocket
- Inspired by modern authentication best practices
- Follows OAuth2 and OpenID Connect standards

---

**Note**: This demonstrates both mock (frontend-only) and real (backend + WebSocket) implementations. For production, use Real API mode with proper backend security.
