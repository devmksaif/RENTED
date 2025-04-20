import React from 'react';
import { Link } from 'react-router-dom';
import './Verification.css';

const VerificationConfirmation = () => {
  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>Verification Submitted</h1>
          <p>Thank you for completing the verification process</p>
        </div>
        
        <div className="confirmation-content">
          <div className="success-icon">✓</div>
          <h2>Your verification is under review</h2>
          <p>
            We've received your verification documents and they are now being reviewed by our team.
            This process typically takes 24-48 hours to complete.
          </p>
          
          <div className="verification-details">
            <h3>What happens next?</h3>
            <ul>
              <li>Our team will review your submitted documents</li>
              <li>You'll receive an email notification once the review is complete</li>
              <li>If approved, your account will be marked as verified</li>
              <li>If we need additional information, we'll contact you via email</li>
            </ul>
          </div>
          
          <div className="form-actions">
            <Link to="/" className="btn btn-primary">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationConfirmation;