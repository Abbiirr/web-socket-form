/**
 * Dashboard Component
 * Main protected area after successful authentication
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2>Welcome back!</h2>
          <p className="user-email">{user?.email}</p>
          <p className="success-message">
            You have successfully authenticated using a magic link.
          </p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3>Secure Authentication</h3>
            <p>
              Your session is protected with OAuth2 tokens and follows industry best
              practices for security.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3>Passwordless Login</h3>
            <p>
              No passwords to remember or manage. Magic links provide a seamless,
              secure authentication experience.
            </p>
          </div>

          <div className="info-card">
            <div className="info-icon">
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
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
            </div>
            <h3>Modern Tech Stack</h3>
            <p>
              Built with React, TypeScript, and follows OAuth2 standards for
              production-ready authentication.
            </p>
          </div>
        </div>

        <div className="user-info-card">
          <h3>Session Information</h3>
          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">User ID:</span>
              <span className="detail-value">{user?.userId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roles:</span>
              <span className="detail-value">
                {user?.roles?.join(', ') || 'User'}
              </span>
            </div>
          </div>
        </div>

        <div className="demo-note">
          <h4>Demo Application</h4>
          <p>
            This is a frontend-only demonstration of magic link authentication with
            OAuth2 best practices. In a production environment:
          </p>
          <ul>
            <li>Magic links would be sent via email service (SendGrid, AWS SES, etc.)</li>
            <li>Tokens would be generated and validated on a secure backend</li>
            <li>Sessions would be managed with HTTP-only cookies</li>
            <li>CSRF protection would be implemented</li>
            <li>Rate limiting would prevent abuse</li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
