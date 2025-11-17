/**
 * Magic Link Request Form Component with WebSocket Support
 * Allows users to request a magic link for passwordless authentication
 * Shows WebSocket connection status and API mode toggle
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Form.css';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const MagicLinkForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const {
    submitForm,
    getLatestMagicLink,
    wsStatus,
    wsConnected,
    useMockApi,
    setUseMockApi
  } = useAuth();

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate email
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // Use submitForm which will handle both API call and WebSocket connection
      const result = await submitForm({ email });

      if (result.success) {
        setStatus('success');

        // Get the generated magic link for demo
        const magicLink = getLatestMagicLink();

        if (magicLink && useMockApi) {
          setMessage(
            `Magic link sent! For this demo, click the link below:\n${magicLink.link}`
          );
        } else {
          setMessage(
            'Magic link sent! Please check your email and click the link to sign in. The link will expire in 15 minutes.'
          );

          if (wsConnected) {
            setMessage(prev => prev + '\n\nWebSocket connected - listening for server updates...');
          }
        }
        setEmail('');
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to send magic link. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status !== 'idle') {
      setStatus('idle');
      setMessage('');
    }
  };

  const handleModeToggle = () => {
    setUseMockApi(!useMockApi);
    setStatus('idle');
    setMessage('');
  };

  const magicLink = status === 'success' && useMockApi ? getLatestMagicLink() : null;

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case 'connected':
        return '#48bb78';
      case 'connecting':
        return '#ed8936';
      case 'error':
        return '#f56565';
      default:
        return '#a0aec0';
    }
  };

  const getWsStatusText = () => {
    switch (wsStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      case 'closed':
        return 'Closed';
      default:
        return 'Disconnected';
    }
  };

  return (
    <div className="magic-link-form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Sign In</h1>
          <p className="form-subtitle">
            Enter your email to receive a magic link for instant, secure access
          </p>

          {/* API Mode Toggle */}
          <div className="api-mode-toggle">
            <button
              type="button"
              onClick={handleModeToggle}
              className={`mode-toggle-btn ${useMockApi ? 'mock' : 'real'}`}
            >
              <span className="mode-indicator"></span>
              {useMockApi ? 'Mock API (Demo Mode)' : 'Real API + WebSocket'}
            </button>
          </div>

          {/* WebSocket Status Indicator */}
          {!useMockApi && (
            <div className="ws-status-bar">
              <div className="ws-status-indicator">
                <div
                  className="ws-status-dot"
                  style={{ backgroundColor: getWsStatusColor() }}
                ></div>
                <span className="ws-status-text">
                  WebSocket: {getWsStatusText()}
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="magic-link-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`form-input ${status === 'error' ? 'input-error' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={handleEmailChange}
              disabled={status === 'loading'}
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          {message && (
            <div
              className={`form-message ${
                status === 'success'
                  ? 'message-success'
                  : status === 'error'
                  ? 'message-error'
                  : ''
              }`}
              role="alert"
            >
              {message.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          )}

          {magicLink && status === 'success' && (
            <div className="demo-link-container">
              <p className="demo-link-label">Demo Magic Link (click to authenticate):</p>
              <a
                href={magicLink.link}
                className="demo-link"
                onClick={() => {
                  setStatus('idle');
                  setMessage('');
                }}
              >
                {magicLink.link}
              </a>
              <p className="demo-hint">
                In production, this link would be sent to your email
              </p>
            </div>
          )}

          <button
            type="submit"
            className="form-button"
            disabled={status === 'loading' || !email}
          >
            {status === 'loading' ? (
              <>
                <span className="spinner"></span>
                Sending...
              </>
            ) : (
              'Send Magic Link'
            )}
          </button>
        </form>

        <div className="form-footer">
          <div className="security-info">
            <svg
              className="security-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <p>
              Secure, passwordless authentication. No passwords to remember or manage.
            </p>
          </div>
        </div>

        <div className="form-benefits">
          <h3>How It Works</h3>
          <ul>
            <li>
              <strong>1. Submit Form:</strong> Enter your email and submit
            </li>
            <li>
              <strong>2. API Call:</strong> {useMockApi ? 'Simulated API request' : 'Real API request to backend'}
            </li>
            <li>
              <strong>3. WebSocket:</strong> {useMockApi ? 'Not used in demo mode' : 'Connection established on success'}
            </li>
            <li>
              <strong>4. Server Updates:</strong> {useMockApi ? 'Simulated locally' : 'Received via WebSocket'}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkForm;
