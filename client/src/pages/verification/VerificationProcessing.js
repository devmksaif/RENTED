import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Verification.css';

const VerificationProcessing = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate processing time before redirecting to confirmation
    const timer = setTimeout(() => {
      navigate('/verify/confirmation');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>Processing Your Verification</h1>
          <p>Step 3 of 3: We're processing your verification documents</p>
        </div>
        
        <div className="verification-progress">
          <div className="progress-step completed">1</div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">2</div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">3</div>
        </div>
        
        <div className="processing-content">
          <div className="processing-animation">
            <div className="spinner-large"></div>
          </div>
          <h2>Please wait while we process your information</h2>
          <p>This will only take a moment...</p>
        </div>
      </div>
    </div>
  );
};

export default VerificationProcessing;