/**
 * Registration Form Component
 * Jobstreet registration with name, email, password
 * Supports token-based authentication via URL query parameter
 */

import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from '../contexts/FormContext';
import tokenService from '../services/tokenService';
import '../styles/Form.css';

interface RegistrationData {
  name: string;
  username: string;
  password: string;
  teamName: string;
  teamId: string;
}

const RegisterForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<RegistrationData>({
    name: '',
    username: '',
    password: '',
    teamName: '',
    teamId: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { loading, error, wsStatus, wsConnected, outcome, outcomeData, submitForm } = useForm();

  // Extract and store bearer token from URL query parameter
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store the bearer token for authentication
      tokenService.setTokens({ accessToken: token });
      console.log('Bearer token extracted and stored from URL');
    }
  }, [searchParams]);

  // Handle WebSocket outcome updates
  useEffect(() => {
    if (outcome === 'mfa_needed') {
      setSubmitStatus('idle');
      setStatusMessage('Multi-factor authentication required. Please check your device.');
    } else if (outcome === 'success') {
      setSubmitStatus('success');
      setStatusMessage('Registration successful! Welcome to Jobstreet.');
    } else if (outcome === 'fail') {
      setSubmitStatus('error');
      setStatusMessage(outcomeData?.message || 'Registration failed. Please try again.');
    }
  }, [outcome, outcomeData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please enter your name');
      return false;
    }

    if (!formData.username.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please enter your email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.username)) {
      setSubmitStatus('error');
      setStatusMessage('Please enter a valid email address');
      return false;
    }

    if (!formData.password) {
      setSubmitStatus('error');
      setStatusMessage('Please enter a password');
      return false;
    }

    if (formData.password.length < 8) {
      setSubmitStatus('error');
      setStatusMessage('Password must be at least 8 characters');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitStatus('idle');
    setStatusMessage('');

    if (!validateForm()) {
      return;
    }

    try {
      const result = await submitForm(formData);

      if (result.success) {
        setSubmitStatus('success');
        setStatusMessage('Registration successful!');

        if (wsConnected) {
          setStatusMessage('Registration successful! Connected - waiting for server updates...');
        }

        // Reset form
        setFormData({
          name: '',
          username: '',
          password: '',
          teamName: '',
          teamId: '',
        });
      } else {
        setSubmitStatus('error');
        setStatusMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setSubmitStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    }
  };

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
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Create Your Account</h1>
          <p className="form-subtitle">
            Register for Jobstreet powered by Revo
          </p>

          {/* WebSocket Status Indicator */}
          <div className="ws-status-bar">
            <div className="ws-status-indicator">
              <div
                className="ws-status-dot"
                style={{ backgroundColor: getWsStatusColor() }}
              ></div>
              <span className="ws-status-text">
                Status: {getWsStatusText()}
              </span>
            </div>
          </div>

          {/* Outcome Display */}
          {outcome && (
            <div className={`outcome-box outcome-${outcome}`}>
              {outcome === 'mfa_needed' && (
                <div>
                  <strong>🔐 MFA Required</strong>
                  <p>Multi-factor authentication is needed. Please check your device or email for the verification code.</p>
                </div>
              )}
              {outcome === 'success' && (
                <div>
                  <strong>✅ Success!</strong>
                  <p>Your registration was successful. Welcome to Jobstreet!</p>
                  {outcomeData?.redirectUrl && (
                    <p>Redirecting you to {outcomeData.redirectUrl}...</p>
                  )}
                </div>
              )}
              {outcome === 'fail' && (
                <div>
                  <strong>❌ Registration Failed</strong>
                  <p>{outcomeData?.message || 'Something went wrong. Please try again.'}</p>
                  {outcomeData?.reason && <p>Reason: {outcomeData.reason}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="main-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="username"
              name="username"
              className="form-input"
              placeholder="you@example.com"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password *
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
                autoComplete="new-password"
                minLength={8}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <p className="form-hint">Use at least 8 characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="teamName" className="form-label">
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              className="form-input"
              placeholder="Your team name"
              value={formData.teamName}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamId" className="form-label">
              Team ID *
            </label>
            <input
              type="text"
              id="teamId"
              name="teamId"
              className="form-input"
              placeholder="Your team ID"
              value={formData.teamId}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          {(statusMessage || error) && (
            <div
              className={`form-message ${
                submitStatus === 'success'
                  ? 'message-success'
                  : 'message-error'
              }`}
              role="alert"
            >
              {statusMessage || error}
            </div>
          )}

          <button
            type="submit"
            className="form-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="form-footer">
          <p className="terms-text">
            By registering, you agree to Jobstreet's Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
