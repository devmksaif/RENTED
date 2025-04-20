import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import './Verification.css';

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
    
    // In a real implementation, you would upload the selfie to your server
    // For now, we'll simulate a successful upload
    setTimeout(() => {
      setLoading(false);
      navigate('/verify/processing');
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfieImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>Selfie Verification</h1>
          <p>Step 2 of 3: Take a selfie for identity verification</p>
        </div>
        
        <div className="verification-progress">
          <div className="progress-step completed">1</div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>
        
        <div className="verification-form">
          <div className="selfie-section">
            {selfieImage ? (
              <div className="selfie-preview">
                <img src={selfieImage} alt="Selfie" />
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={retake}
                >
                  Retake Selfie
                </button>
              </div>
            ) : cameraError ? (
              <div className="camera-error">
                <div className="error-icon">❌</div>
                <h3>Camera access denied or not available</h3>
                <p>Please allow camera access or upload a selfie manually</p>
                <div className="manual-upload">
                  <label className="btn btn-secondary">
                    Upload Selfie
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="webcam-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "user"
                  }}
                  onUserMediaError={handleCameraError}
                  className="webcam"
                />
                <button 
                  type="button" 
                  className="capture-btn" 
                  onClick={capture}
                >
                  Take Selfie
                </button>
              </div>
            )}
          </div>
          
          <div className="verification-tips">
            <h3>Tips for a successful selfie verification:</h3>
            <ul>
              <li>Make sure your face is clearly visible</li>
              <li>Ensure good lighting conditions</li>
              <li>Remove sunglasses, hats, or other face coverings</li>
              <li>Look directly at the camera</li>
            </ul>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-primary" 
              disabled={loading || !selfieImage}
              onClick={handleSubmit}
            >
              {loading ? 'Uploading...' : 'Submit Verification'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfieCapture;