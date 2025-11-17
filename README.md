# Magic Link Authentication - React TypeScript App

A modern, production-ready React application demonstrating magic link authentication with OAuth2 best practices. This is a **pure frontend implementation** that simulates the entire authentication flow without requiring a backend server.

## Features

- **Passwordless Authentication**: Secure magic link-based authentication
- **OAuth2 Best Practices**: Implements industry-standard OAuth2 patterns
- **Pure Frontend**: No backend required - perfect for demos and prototyping
- **TypeScript**: Fully typed for better development experience
- **Modern React**: Built with React 18 and functional components
- **Responsive Design**: Beautiful UI that works on all devices
- **Protected Routes**: Route guards for authenticated content
- **Token Management**: Secure JWT token handling with automatic expiration
- **Local Storage Simulation**: Simulates user database and magic link storage

## Tech Stack

- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe code with excellent IDE support
- **Vite**: Lightning-fast build tool and dev server
- **React Router v6**: Modern routing with data loading
- **Axios**: Promise-based HTTP client (ready for backend integration)
- **jwt-decode**: JWT token decoding and validation
- **CSS3**: Modern styling with animations and gradients

## Project Structure

```
web-socket-form/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx    # Protected dashboard page
│   │   ├── Home.tsx         # Landing page
│   │   ├── MagicLinkForm.tsx       # Login form
│   │   ├── MagicLinkVerify.tsx     # Token verification
│   │   └── ProtectedRoute.tsx      # Route guard
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── services/            # Business logic
│   │   ├── mockAuthService.ts      # Mock auth API
│   │   └── tokenService.ts         # Token management
│   ├── types/               # TypeScript types
│   │   ├── auth.types.ts    # Auth interfaces
│   │   └── api.types.ts     # API interfaces
│   ├── styles/              # CSS stylesheets
│   │   ├── Dashboard.css
│   │   ├── Form.css
│   │   ├── Home.css
│   │   ├── Verify.css
│   │   └── index.css
│   ├── config/              # Configuration
│   │   └── env.ts           # Environment variables
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── vite-env.d.ts        # Vite type definitions
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Clone or navigate to the repository**:
   ```bash
   cd web-socket-form
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
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

## How It Works

### Authentication Flow

1. **Request Magic Link**:
   - User enters their email address
   - System generates a unique token and stores it in localStorage
   - In production, this would send an email with the magic link
   - For demo purposes, the link is displayed on screen

2. **Click Magic Link**:
   - User clicks the link (format: `/auth/callback?token=xxx`)
   - System verifies the token from localStorage
   - If valid, generates JWT access and refresh tokens
   - Stores tokens securely and redirects to dashboard

3. **Access Protected Content**:
   - Protected routes check for valid JWT token
   - Token is automatically attached to API requests
   - Expired tokens trigger re-authentication

4. **Logout**:
   - Clears all tokens from storage
   - Redirects to login page

### OAuth2 Implementation

This app implements OAuth2 patterns including:

- **Authorization Code Flow**: Simulated with magic link tokens
- **JWT Tokens**: Access tokens with expiration
- **Refresh Tokens**: Long-lived tokens for token renewal
- **Token Storage**: Secure localStorage with expiration tracking
- **Protected Resources**: Route guards and API authentication

## Configuration

Environment variables are configured in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_TIMEOUT=30000
VITE_OAUTH_CLIENT_ID=magic-link-client
VITE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback
VITE_MAGIC_LINK_EXPIRY=900000
```

## Integrating with a Real Backend

To connect this app to a real backend:

1. **Replace Mock Service**:
   - Update `src/services/mockAuthService.ts` with real API calls
   - Or modify `AuthContext.tsx` to use a different service

2. **Update API Endpoints**:
   - Configure `VITE_API_BASE_URL` in `.env`
   - Ensure backend implements these endpoints:
     - `POST /api/auth/magic-link/request` - Request magic link
     - `POST /api/auth/magic-link/verify` - Verify token
     - `POST /api/auth/refresh` - Refresh access token
     - `POST /api/auth/logout` - Logout
     - `GET /api/user/profile` - Get user profile

3. **Backend Requirements**:
   - Generate and send magic link emails
   - Validate magic link tokens
   - Issue JWT access and refresh tokens
   - Implement token refresh endpoint
   - Handle CORS for your frontend domain

## Security Considerations

### Current Implementation (Frontend Only)

- Tokens are stored in localStorage (acceptable for demos)
- Magic links are displayed on screen (for testing)
- No CSRF protection (frontend only)
- No rate limiting (frontend only)

### Production Recommendations

1. **Use HTTP-only Cookies**: Store tokens in HTTP-only cookies to prevent XSS
2. **Implement CSRF Protection**: Use CSRF tokens for state-changing requests
3. **Add Rate Limiting**: Prevent abuse of magic link generation
4. **Use Secure Email Service**: SendGrid, AWS SES, or similar
5. **Short Token Expiry**: Keep access tokens short-lived (15-60 minutes)
6. **Secure Backend**: Never trust client-side validation
7. **HTTPS Only**: Always use HTTPS in production
8. **Content Security Policy**: Implement CSP headers

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Modern mobile browsers

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

## Acknowledgments

- Built with React and TypeScript
- Inspired by modern authentication best practices
- Follows OAuth2 and OpenID Connect standards

---

**Note**: This is a demonstration project showing frontend implementation of magic link authentication. For production use, always implement proper backend security measures.
