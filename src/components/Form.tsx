/**
 * Form Component
 * Simple form that submits data to API and establishes WebSocket connection
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useForm } from '../contexts/FormContext';
import '../styles/Form.css';

interface FormData {
  [key: string]: string;
}

const Form: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    message: '',
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
          email: '',
          name: '',
          message: '',
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
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

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
            <label htmlFor="message" className="form-label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              className="form-input form-textarea"
              placeholder="Your message"
              value={formData.message}
              onChange={handleInputChange}
              disabled={loading}
              rows={4}
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
              <li>Fill in the form fields</li>
              <li>Submit → API call to <code>/api/submit</code></li>
              <li>On success → WebSocket connection established</li>
              <li>Listen for real-time updates from server</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;
