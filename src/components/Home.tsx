/**
 * Home/Landing Page Component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated()) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Magic Link Authentication
          </h1>
          <p className="hero-subtitle">
            Secure, passwordless authentication powered by OAuth2
          </p>
          <p className="hero-description">
            Experience the future of authentication with magic links. No passwords to
            remember, no complex setup. Just enter your email and click the link.
          </p>
          <button onClick={handleGetStarted} className="cta-button">
            Get Started
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
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
            <h3>Secure by Default</h3>
            <p>
              Built on OAuth2 standards with JWT tokens, ensuring enterprise-grade
              security for your applications.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
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
            <h3>Lightning Fast</h3>
            <p>
              One-click authentication with no password typing. Get your users logged
              in faster than ever.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
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
            <h3>User Friendly</h3>
            <p>
              No passwords to remember or reset. Users simply click a link in their
              email to sign in.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
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
            <h3>Modern Stack</h3>
            <p>
              Built with React 18, TypeScript, and follows best practices for
              production applications.
            </p>
          </div>
        </div>
      </div>

      <div className="tech-section">
        <h2>Built with Modern Technologies</h2>
        <div className="tech-list">
          <div className="tech-item">React 18</div>
          <div className="tech-item">TypeScript</div>
          <div className="tech-item">OAuth2</div>
          <div className="tech-item">JWT</div>
          <div className="tech-item">React Router</div>
          <div className="tech-item">Vite</div>
        </div>
      </div>
    </div>
  );
};

export default Home;
