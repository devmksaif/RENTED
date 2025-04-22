import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../styles/Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setIsLoading(true);
  
    try {
      console.log('Attempting registration with:', { 
        name: formData.name,
        email: formData.email,
        password: '****',
        phone: formData.phone,
        address: formData.address
      });
      
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address
      });
      
      console.log('Registration response:', response);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response._id,
        name: response.name,
        email: response.email,
        role: response.role || 'user' // Ensure role has a default value
      }));
      
      // Redirect to home page after successful registration
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      
      // More detailed error handling
      if (error.response) {
        setError(error.response.data.message || 'Registration failed. Please try again.');
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        setError('No response from server. Please try again later.');
        console.error('Error request:', error.request);
      } else {
        setError('Registration failed. Please try again.');
        console.error('Error message:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create an Account</h2>
          <p>Join RENTED to start renting items or listing your own!</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                placeholder="Create a password (min. 6 characters)"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone Number (Optional)</label>
            <div className="input-with-icon">
              <i className="fas fa-phone"></i>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="address">Address (Optional)</label>
            <div className="input-with-icon">
              <i className="fas fa-map-marker-alt"></i>
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button className="social-button google">
            <i className="fab fa-google"></i>
            <span>Register with Google</span>
          </button>
          <button className="social-button facebook">
            <i className="fab fa-facebook-f"></i>
            <span>Register with Facebook</span>
          </button>
        </div>
        
        <div className="auth-redirect">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;