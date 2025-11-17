/**
 * Magic Link Request Form Component
 * Allows users to request a magic link for passwordless authentication
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Form.css';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

const MagicLinkForm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const { requestMagicLink, getLatestMagicLink } = useAuth();

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
      const result = await requestMagicLink(email);

      if (result.success) {
        setStatus('success');

        // Get the generated magic link for demo
        const magicLink = getLatestMagicLink();

        if (magicLink) {
          setMessage(
            `Magic link sent! For this demo, click the link below:\n${magicLink.link}`
          );
        } else {
          setMessage(
            'Magic link sent! Please check your email and click the link to sign in. The link will expire in 15 minutes.'
          );
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

  const magicLink = status === 'success' ? getLatestMagicLink() : null;

  return (
    <div className="magic-link-form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Sign In</h1>
          <p className="form-subtitle">
            Enter your email to receive a magic link for instant, secure access
          </p>
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
          <h3>Why Magic Links?</h3>
          <ul>
            <li>
              <strong>More Secure:</strong> No password to forget or get stolen
            </li>
            <li>
              <strong>Faster Login:</strong> One click to authenticate
            </li>
            <li>
              <strong>Works Everywhere:</strong> Access from any device with email
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MagicLinkForm;
