import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Verification.css';
import { updateUserStatusToPending, getUserProfile } from '../../services/api';

const VerificationConfirmation = () => {
    const [isUpdating, setIsUpdating] = useState(true);
    const [updateError, setUpdateError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateStatus = async () => {
          try {
            setIsUpdating(true);
            const userData = await getUserProfile();
            
            // Only update if status is 'still'
            if (userData && userData.verificationStatus === 'still') {
              await updateUserStatusToPending(userData._id);
              
              // Fetch updated user data
              const updatedUser = await getUserProfile();
              
              // Update localStorage with new verification status
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              localStorage.setItem('user', JSON.stringify({
                ...storedUser,
                verificationStatus: updatedUser.verificationStatus
              }));
              
            } else if (userData && userData.verificationStatus === 'verified') {
              // If already verified, redirect to home
              navigate('/');
            }
          } catch (error) {
            console.error('Error updating user status:', error);
            setUpdateError('Failed to update verification status. Please try again later.');
          } finally {
            setIsUpdating(false);
          }
        };
        
        updateStatus();
    }, [navigate]);

    return (
      <div className="verification-container">
        <div className="verification-card">
          <div className="verification-header">
            <h1>Verification Submitted</h1>
            <p>Thank you for completing the verification process</p>
          </div>
          
          <div className="confirmation-content">
            {updateError ? (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>{updateError}</h3>
                <button 
                  className="btn-primary" 
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
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
              </>
            )}
            
            <div className="form-actions">
              <Link to="/" className="btn-primary">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
};

export default VerificationConfirmation;