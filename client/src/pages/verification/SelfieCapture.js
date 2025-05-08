import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import '../../styles/Verification.css';

const SelfieCapture = () => {
  const [selfieImage, setSelfieImage] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setSelfieImage(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setSelfieImage(null);
  };

  const handleCameraError = () => {
    setCameraError(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selfieImage) {
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real app, you would send this to your backend
      // const response = await uploadSelfie(selfieImage);
      
      // For now, we'll just simulate a successful upload
      setTimeout(() => {
        setLoading(false);
        navigate('/verify/processing');
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      alert('Failed to upload selfie. Please try again.');
    }
  };

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>Take a Selfie</h1>
          <p>Step 2 of 3: We need to verify that you match your ID</p>
        </div>
        
        <div className="verification-progress">
          <div className="progress-step completed">1</div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>
        
        <form className="verification-form" onSubmit={handleSubmit}>
          <div className="verification-tips">
            <h3>Tips for a successful selfie:</h3>
            <ul>
              <li>Make sure your face is clearly visible</li>
              <li>Remove sunglasses or any face coverings</li>
              <li>Ensure you're in a well-lit environment</li>
              <li>Look directly at the camera</li>
            </ul>
          </div>
          
          <div className="selfie-capture-area">
            {cameraError ? (
              <div className="camera-error">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>Camera access denied</h3>
                <p>Please allow camera access to continue with verification</p>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : selfieImage ? (
              <div className="selfie-preview">
                <img src={selfieImage} alt="Selfie" />
              </div>
            ) : (
              <div className="webcam-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  onUserMediaError={handleCameraError}
                  mirrored={true}
                  className="webcam"
                />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            {selfieImage ? (
              <>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={retake}
                >
                  Retake Photo
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Uploading...
                    </>
                  ) : (
                    'Continue to Next Step'
                  )}
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="btn-primary capture-btn"
                onClick={capture}
              >
                <i className="fas fa-camera"></i>
                Take Photo
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfieCapture;