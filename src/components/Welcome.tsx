/**
 * Welcome Component
 * Landing page for Jobstreet Registration
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate('/register');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-header">
          <div className="logo-section">
            <h1 className="brand-title">Jobstreet</h1>
            <p className="brand-subtitle">Register for Revo</p>
          </div>
        </div>

        <div className="welcome-content">
          <div className="welcome-icon">
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>

          <h2>Welcome to Jobstreet</h2>
          <p className="welcome-message">
            Start your career journey with Revo. Create your account to access thousands of job opportunities.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Access to exclusive job listings</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Personalized job recommendations</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Easy application process</span>
            </div>
          </div>
        </div>

        <div className="welcome-footer">
          <button onClick={handleProceed} className="proceed-button">
            Proceed to Registration
            <svg
              className="arrow-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
