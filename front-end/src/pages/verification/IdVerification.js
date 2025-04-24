import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Verification.css';

function IdVerification() {
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
      setError('Please upload both front and back images of your ID');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('idFront', idFront);
      formData.append('idBack', idBack);
      
      // In a real app, you would send this to your backend
      // const response = await uploadIdImages(formData);
      
      // For now, we'll just simulate a successful upload
      setTimeout(() => {
        setLoading(false);
        navigate('/verify/selfie');
      }, 1500);
      
    } catch (error) {
      setLoading(false);
      setError('Failed to upload ID images. Please try again.');
    }
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
        
        <form className="verification-form" onSubmit={handleSubmit}>
          <div className="verification-tips">
            <h3>Tips for a successful verification:</h3>
            <ul>
              <li>Use a valid government-issued ID (passport, driver's license, or national ID)</li>
              <li>Make sure the entire document is visible in the frame</li>
              <li>Ensure all text is clearly readable</li>
              <li>Upload images in JPG, PNG, or PDF format (max 5MB)</li>
            </ul>
          </div>
          
          <div className="upload-section">
            <div className="upload-box">
              <h3>Front of ID</h3>
              <div className="upload-area">
                {idFront ? (
                  <div className="preview-container">
                    <img 
                      src={URL.createObjectURL(idFront)} 
                      alt="ID Front" 
                      className="id-preview" 
                    />
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => setIdFront(null)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,application/pdf" 
                      onChange={handleIdFrontUpload} 
                      className="file-input"
                    />
                    <div className="upload-icon">
                      <i className="fas fa-upload"></i>
                    </div>
                    <span>Click to upload</span>
                  </label>
                )}
              </div>
            </div>
            
            <div className="upload-box">
              <h3>Back of ID</h3>
              <div className="upload-area">
                {idBack ? (
                  <div className="preview-container">
                    <img 
                      src={URL.createObjectURL(idBack)} 
                      alt="ID Back" 
                      className="id-preview" 
                    />
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => setIdBack(null)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input 
                      type="file" 
                      accept="image/jpeg,image/png,application/pdf" 
                      onChange={handleIdBackUpload} 
                      className="file-input"
                    />
                    <div className="upload-icon">
                      <i className="fas fa-upload"></i>
                    </div>
                    <span>Click to upload</span>
                  </label>
                )}
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading || !idFront || !idBack}
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default IdVerification;