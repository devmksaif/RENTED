import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Verification.css';

const IdVerification = () => {
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleIdFrontUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      setIdFront(file);
      setError('');
    }
  };

  const handleIdBackUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should not exceed 5MB');
        return;
      }
      setIdBack(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!idFront || !idBack) {
      setError('Please upload both sides of your ID');
      return;
    }
    
    setLoading(true);
    
    // In a real implementation, you would upload these files to your server
    // For now, we'll simulate a successful upload
    setTimeout(() => {
      setLoading(false);
      navigate('/verify/selfie');
    }, 1500);
  };

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-header">
          <h1>ID Verification</h1>
          <p>Step 1 of 3: Upload your identification document</p>
        </div>
        
        <div className="verification-progress">
          <div className="progress-step active">1</div>
          <div className="progress-line"></div>
          <div className="progress-step">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>
        
        <form onSubmit={handleSubmit} className="verification-form">
          <div className="upload-section">
            <div className="upload-box">
              <h3>Front of ID</h3>
              <div className={`upload-area ${idFront ? 'has-file' : ''}`}>
                {idFront ? (
                  <div className="file-preview">
                    <img src={URL.createObjectURL(idFront)} alt="ID Front" />
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setIdFront(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📄</div>
                    <p>Drag and drop or click to upload</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleIdFrontUpload} 
                      className="file-input"
                    />
                  </>
                )}
              </div>
            </div>
            
            <div className="upload-box">
              <h3>Back of ID</h3>
              <div className={`upload-area ${idBack ? 'has-file' : ''}`}>
                {idBack ? (
                  <div className="file-preview">
                    <img src={URL.createObjectURL(idBack)} alt="ID Back" />
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setIdBack(null)}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📄</div>
                    <p>Drag and drop or click to upload</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleIdBackUpload} 
                      className="file-input"
                    />
                  </>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="verification-tips">
            <h3>Tips for a successful verification:</h3>
            <ul>
              <li>Make sure your ID is valid and not expired</li>
              <li>Ensure all four corners of your ID are visible</li>
              <li>Make sure the image is clear and not blurry</li>
              <li>Acceptable ID types: Driver's License, Passport, National ID</li>
            </ul>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading || !idFront || !idBack}
            >
              {loading ? 'Uploading...' : 'Continue to Next Step'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdVerification;