/**
 * Loading Page Component
 * Displays a loading state while waiting for WebSocket updates
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "../contexts/FormContext";
import "../styles/Loading.css";

const Loading: React.FC = () => {
  const navigate = useNavigate();
  const { wsStatus, wsConnected, outcome, outcomeData } = useForm();

  // Handle WebSocket outcome updates
  useEffect(() => {
    if (outcome === "success") {
      // Navigate to success page
      console.log("Registration successful!", outcomeData);
      navigate("/success");
    } else if (outcome === "fail") {
      // Navigate to fail page
      console.log("Registration failed:", outcomeData);
      navigate("/fail");
    } else if (outcome === "mfa_needed") {
      // Navigate to MFA page (websocket stays open)
      console.log("MFA required:", outcomeData);
      navigate("/mfa");
    }
  }, [outcome, outcomeData, navigate]);

  const getWsStatusColor = () => {
    switch (wsStatus) {
      case "connected":
        return "#48bb78";
      case "connecting":
        return "#ed8936";
      case "error":
        return "#f56565";
      default:
        return "#a0aec0";
    }
  };

  const getWsStatusText = () => {
    switch (wsStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Error";
      case "closed":
        return "Closed";
      default:
        return "Disconnected";
    }
  };

  return (
    <div className="loading-container">
      <div className="loading-card">
        <div className="loading-content">
          {/* Loading Spinner */}
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner"></div>
          </div>

          {/* Loading Message */}
          <h1 className="loading-title">Processing Your Request</h1>
          <p className="loading-subtitle">
            Please wait while we verify your credentials and set up your
            account...
          </p>

          {/* WebSocket Status Indicator */}
          <div className="loading-ws-status">
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
              {outcome === "mfa_needed" && (
                <div>
                  <strong>🔐 MFA Required</strong>
                  <p>
                    Multi-factor authentication is needed. Please check your
                    device or email for the verification code.
                  </p>
                </div>
              )}
              {outcome === "success" && (
                <div>
                  <strong>✅ Success!</strong>
                  <p>Your registration was successful. Welcome to Jobstreet!</p>
                  {outcomeData?.redirectUrl && (
                    <p>Redirecting you to {outcomeData.redirectUrl}...</p>
                  )}
                </div>
              )}
              {outcome === "fail" && (
                <div>
                  <strong>❌ Registration Failed</strong>
                  <p>
                    {outcomeData?.message ||
                      "Something went wrong. Please try again."}
                  </p>
                  {outcomeData?.reason && <p>Reason: {outcomeData.reason}</p>}
                  <button
                    className="back-button"
                    onClick={() => navigate("/register")}
                  >
                    Back to Form
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Loading Steps */}
          {!outcome && (
            <div className="loading-steps">
              <div className="step-item">
                <div className="step-icon">✓</div>
                <span>Form submitted successfully</span>
              </div>
              <div className="step-item active">
                <div className="step-icon">
                  <div className="step-spinner"></div>
                </div>
                <span>Verifying credentials with Jobstreet</span>
              </div>
              <div className="step-item pending">
                <div className="step-icon">○</div>
                <span>Finalizing registration</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Loading;
