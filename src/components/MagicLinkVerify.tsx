/**
 * Magic Link Verification Component
 * Handles the callback from magic link emails and verifies the token
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Verify.css';

type VerifyStatus = 'verifying' | 'success' | 'error';

const MagicLinkVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useAuth();
  const [status, setStatus] = useState<VerifyStatus>('verifying');
  const [message, setMessage] = useState<string>('Verifying your magic link...');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');
      const code = searchParams.get('code');

      // Check for token or code in URL
      if (!token && !code) {
        setStatus('error');
        setMessage('Invalid or missing authentication token');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        const authToken = token || code || '';
        const result = await verifyMagicLink(authToken);

        if (result.success) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          setStatus('error');
          setMessage(
            result.error || 'Failed to verify magic link. The link may have expired.'
          );
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    verify();
  }, [searchParams, verifyMagicLink, navigate]);

  return (
    <div className="verify-container">
      <div className="verify-card">
        {status === 'verifying' && (
          <>
            <div className="verify-spinner-large"></div>
            <h2>Verifying...</h2>
            <p className="verify-message">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="verify-icon success-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2>Success!</h2>
            <p className="verify-message">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="verify-icon error-icon">
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2>Verification Failed</h2>
            <p className="verify-message">{message}</p>
            <button className="verify-button" onClick={() => navigate('/login')}>
              Request New Link
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MagicLinkVerify;
