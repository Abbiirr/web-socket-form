# Form Submission with WebSocket - React TypeScript App

A simple, focused React application for form submission with real-time WebSocket communication. When a user submits a form, it makes an API call and establishes a WebSocket connection to receive server updates.

## Features

- 📝 **Simple Form**: Clean form interface for data submission
- 🔌 **WebSocket Integration**: Automatic WebSocket connection after successful API call
- 🎯 **Single Purpose**: Focused on form submission only
- 📘 **TypeScript**: Fully typed for better development experience
- ⚛️ **React 18**: Modern React with hooks
- 🎨 **Responsive Design**: Works on all devices
- 🔄 **Auto-reconnect**: WebSocket reconnects automatically on disconnect

## Tech Stack

- **React 18**: Latest React with hooks
- **TypeScript**: Type-safe code
- **Vite**: Lightning-fast build tool
- **React Router v6**: Client-side routing
- **Axios**: HTTP client for API calls
- **WebSocket**: Native WebSocket with reconnection logic
- **CSS3**: Modern styling

## Project Structure

```
web-socket-form/
├── src/
│   ├── components/
│   │   └── Form.tsx                 # Main form component
│   ├── contexts/
│   │   └── FormContext.tsx          # Form state + WebSocket management
│   ├── services/
│   │   ├── realApiService.ts        # HTTP API client
│   │   ├── websocketService.ts      # WebSocket manager
│   │   └── tokenService.ts          # Token storage/management
│   ├── types/
│   │   └── websocket.types.ts       # WebSocket TypeScript types
│   ├── styles/
│   │   ├── Form.css                 # Form styles
│   │   └── index.css                # Global styles
│   ├── config/
│   │   └── env.ts                   # Environment config
│   ├── App.tsx                      # Main app with routing
│   └── main.tsx                     # Entry point
├── .env                             # Environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API server (for form submission)
- WebSocket server (for real-time updates)

### Installation

1. **Navigate to project**:
   ```bash
   cd web-socket-form
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   # Edit .env file
   VITE_API_BASE_URL=http://localhost:8080
   VITE_WS_URL=ws://localhost:8080/ws
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   Navigate to `http://localhost:3000` → redirects to `/form`

### Build for Production

```bash
npm run build
```

Built files in `dist/` directory.

## Configuration

Environment variables in `.env`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8080/ws
```

## How It Works

### Form Submission Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER FILLS FORM                                          │
│    - Email, Name, Message fields                            │
│    - Click "Submit Form" button                             │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. HTTP API CALL                                            │
│    POST /api/submit                                         │
│    { email, name, message }                                 │
│    (Token auto-added from localStorage if exists)           │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API RESPONSE                                             │
│    { success: true, ... }                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. WEBSOCKET CONNECTION                                     │
│    ws://localhost:8080/ws                                   │
│    Status: disconnected → connecting → connected            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. LISTEN FOR SERVER MESSAGES                               │
│    Real-time updates from server via WebSocket              │
│    { type: "UPDATE_STATUS", payload: {...} }                │
│    { type: "REDIRECT", payload: {url: "/success"} }         │
└─────────────────────────────────────────────────────────────┘
```

### WebSocket Message Types

The app handles these message types from the server:

```typescript
// Status update
{
  type: "UPDATE_STATUS",
  payload: {
    status: "processing",
    message: "Processing your form..."
  }
}

// Redirect instruction
{
  type: "REDIRECT",
  payload: {
    url: "/success",
    delay: 1000  // optional delay in ms
  }
}

// Error message
{
  type: "ERROR",
  payload: {
    message: "An error occurred"
  }
}
```

### WebSocket Service Features

- **Automatic Reconnection**: Reconnects on disconnect with exponential backoff
- **Max Reconnect Attempts**: 5 attempts (configurable)
- **Reconnect Interval**: 3 seconds between attempts
- **Status Tracking**: `disconnected` → `connecting` → `connected` → `error`/`closed`
- **Message Handlers**: Subscribe to incoming messages
- **Auto Cleanup**: Proper cleanup on component unmount

## Backend Requirements

Your backend needs to implement:

### HTTP Endpoint

```
POST /api/submit
Content-Type: application/json
Authorization: Bearer <token>  (if token exists in localStorage)

Request Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "message": "Hello world"
}

Response:
{
  "success": true,
  "id": "12345",
  "message": "Form submitted successfully"
}
```

### WebSocket Endpoint

```
WebSocket: ws://your-server.com/ws

Messages from server:
{
  "type": "UPDATE_STATUS",
  "payload": { "status": "processing", "message": "..." }
}

{
  "type": "REDIRECT",
  "payload": { "url": "/success", "delay": 1000 }
}

{
  "type": "ERROR",
  "payload": { "message": "Error message" }
}
```

## Example Backend (Node.js)

```javascript
const express = require('express');
const WebSocket = require('ws');
const app = express();

app.use(express.json());

// Form submission endpoint
app.post('/api/submit', (req, res) => {
  const { email, name, message } = req.body;

  // Process form data
  console.log('Form submitted:', { email, name, message });

  res.json({
    success: true,
    id: Date.now().toString(),
    message: 'Form submitted successfully'
  });
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8080, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send status update
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'UPDATE_STATUS',
      payload: { status: 'processing', message: 'Processing your form...' }
    }));
  }, 1000);

  // Send redirect after processing
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'REDIRECT',
      payload: { url: '/success', delay: 500 }
    }));
  }, 3000);
});

app.listen(8080, () => console.log('Server running on port 8080'));
```

## API Service Usage

```typescript
import realApiService from './services/realApiService';

// Submit form
const result = await realApiService.submitForm({
  email: 'user@example.com',
  name: 'John Doe',
  message: 'Hello'
});

// Make GET request
const data = await realApiService.get('/api/endpoint');

// Make POST request
const response = await realApiService.post('/api/endpoint', { data });
```

## WebSocket Service Usage

```typescript
import websocketService from './services/websocketService';

// Connect
await websocketService.connect('ws://localhost:8080/ws');

// Subscribe to messages
const unsubscribe = websocketService.onMessage((message) => {
  console.log('Received:', message);
});

// Send message to server
websocketService.send({
  type: 'PING',
  payload: {}
});

// Disconnect
websocketService.disconnect();

// Cleanup
unsubscribe();
```

## Token Handling

If a token exists in `localStorage` under the key `'auth_token'`, it will be automatically attached to all API requests as a Bearer token:

```
Authorization: Bearer <token>
```

You can set a token from another application:

```javascript
// In another app or page
localStorage.setItem('auth_token', 'your-jwt-token-here');

// Then navigate to this form app
window.location.href = 'http://localhost:3000/form';
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Customizing the Form

Edit `src/components/Form.tsx` to add/remove fields:

```typescript
const [formData, setFormData] = useState({
  email: '',
  name: '',
  message: '',
  // Add more fields here
  customField: '',
});
```

## Styling

- Main styles: `src/styles/Form.css`
- Global styles: `src/styles/index.css`
- Modify gradient background, colors, etc. in CSS files

## Security Notes

- Tokens stored in `localStorage` (consider HTTP-only cookies for production)
- CORS must be configured on backend for your frontend origin
- Use HTTPS/WSS in production
- Validate all form inputs on backend
- Implement rate limiting on backend

## Troubleshooting

### WebSocket Won't Connect

1. Check backend is running
2. Verify `VITE_WS_URL` in `.env`
3. Check browser console for errors
4. Ensure WebSocket path matches server

### Form Submission Fails

1. Check API endpoint is correct
2. Verify CORS headers on backend
3. Check network tab in browser DevTools
4. Ensure backend is running

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

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers
- WebSocket support required

## License

MIT

## Contributing

Feel free to submit issues and pull requests!

---

**Simple. Focused. Just a form with WebSocket.**
