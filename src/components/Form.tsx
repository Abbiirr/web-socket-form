/**
 * Form Component
 * Simple form that submits data to API and establishes WebSocket connection
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useForm } from '../contexts/FormContext';
import '../styles/Form.css';

interface FormData {
  name: string;
  username: string;
  password: string;
  teamName: string;
  teamId: string;
}

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    password: '',
    teamName: '',
    teamId: '',
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const { loading, error, wsStatus, wsConnected, submitForm } = useForm();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      const result = await submitForm(formData);

      if (result.success) {
        setSubmitStatus('success');
        setStatusMessage('Form submitted successfully!');

        if (wsConnected) {
          setStatusMessage('Form submitted! WebSocket connected - listening for updates...');
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
        setStatusMessage(result.error || 'Failed to submit form. Please try again.');
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
          <h1>Submit Form</h1>
          <p className="form-subtitle">
            Fill in the details below and submit
          </p>

          {/* WebSocket Status Indicator */}
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
        </div>

        <form onSubmit={handleSubmit} className="main-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="username"
              name="username"
              className="form-input"
              placeholder="your.email@company.com"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Your password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamName" className="form-label">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              className="form-input"
              placeholder="REVO GLOBAL SDN. BHD."
              value={formData.teamName}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="teamId" className="form-label">
              Team ID
            </label>
            <input
              type="text"
              id="teamId"
              name="teamId"
              className="form-input"
              placeholder="62541561"
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
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </form>

        <div className="form-footer">
          <div className="info-box">
            <h3>How It Works</h3>
            <ol className="steps-list">
              <li>Fill in your JobStreet employer credentials</li>
              <li>Submit → API call to <code>/api/v1/common/private/integration/verify</code></li>
              <li>On success → Wait 30 seconds</li>
              <li>WebSocket connection to <code>/ws/register</code> (3 retries with 30s delay)</li>
              <li>Listen for real-time updates from server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
