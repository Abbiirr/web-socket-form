/**
 * Success Page Component
 * Displays when registration is successful
 */

import React, { useEffect } from 'react';
import { useForm } from '../contexts/FormContext';
import '../styles/Result.css';

const Success: React.FC = () => {
  const { outcomeData, disconnectWebSocket } = useForm();

  // Disconnect WebSocket when component mounts
  useEffect(() => {
    disconnectWebSocket();
    console.log('WebSocket disconnected after success');
  }, [disconnectWebSocket]);

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-content">
          {/* Success Icon */}
          <div className="result-icon success-icon">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="result-title">Registration Successful!</h1>
          <p className="result-subtitle">
            Your Jobstreet account has been created successfully. Welcome aboard!
          </p>

          {/* Outcome Data */}
          {outcomeData && (
            <div className="result-details">
              {outcomeData.message && (
                <p className="detail-text">{outcomeData.message}</p>
              )}
              {outcomeData.redirectUrl && (
                <p className="detail-text">
                  You will be redirected to {outcomeData.redirectUrl} shortly...
                </p>
              )}
            </div>
          )}

          {/* Success Checkmark Animation */}
          <div className="success-animation">
            <div className="checkmark-circle">
              <div className="checkmark"></div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>Check your email for verification</li>
              <li>Complete your profile setup</li>
              <li>Start exploring job opportunities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;
