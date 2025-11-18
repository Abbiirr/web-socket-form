/**
 * Fail Page Component
 * Displays when registration fails
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import '../styles/Result.css';

const Fail: React.FC = () => {
  const navigate = useNavigate();
  const { outcomeData, disconnectWebSocket } = useForm();

  // Disconnect WebSocket when component mounts
  useEffect(() => {
    disconnectWebSocket();
    console.log('WebSocket disconnected after failure');
  }, [disconnectWebSocket]);

  const handleRetry = () => {
    navigate('/register');
  };

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-content">
          {/* Fail Icon */}
          <div className="result-icon fail-icon">
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
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Fail Message */}
          <h1 className="result-title fail-title">Registration Failed</h1>
          <p className="result-subtitle">
            We encountered an issue while processing your registration.
          </p>

          {/* Error Details */}
          {outcomeData && (
            <div className="result-details error-details">
              {outcomeData.message && (
                <p className="detail-text">{outcomeData.message}</p>
              )}
              {outcomeData.reason && (
                <p className="detail-text">
                  <strong>Reason:</strong> {outcomeData.reason}
                </p>
              )}
            </div>
          )}

          {/* Common Issues */}
          <div className="help-section">
            <h3>Common Issues:</h3>
            <ul>
              <li>Invalid credentials - Please check your username and password</li>
              <li>Account already exists with this email</li>
              <li>Network connection issues</li>
              <li>Server temporarily unavailable</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="primary-button" onClick={handleRetry}>
              Try Again
            </button>
            <button
              className="secondary-button"
              onClick={() => navigate('/welcome')}
            >
              Go to Welcome
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fail;
