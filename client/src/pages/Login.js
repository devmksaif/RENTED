import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, completeGoogleRegistration, loginUserGoogle, checkEmail } from '../services/api';
import '../styles/Auth.css';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from '../firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    try {
      // Add some basic validation
      if (!email || !password) {
        setError('Email and password are required');
        setIsLoading(false);
        return;
      }
      const data = { 
        email,
        password
      }
      const response = await loginUser(data);
      console.log('Login response:', response);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response._id,
        name: response.name,
        email: response.email,
        role: response.role || 'user', // Ensure role has a default value
        accountType: response.accountType,
        verificationStatus: response.verificationStatus,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        address: response.address,
        meetingAreas : response.meetingAreas,
        phone : response.phone
      }));
      
      // Redirect based on user role
      if (response.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message || 'Login failed. Please check your credentials.');
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response from server. Please try again later.');
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Login failed. Please try again.');
        console.error('Error message:', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      console.log('Initiating Google signInWithPopup...');
      const result = await signInWithPopup(auth, provider);
      // The signed-in user info.
      const user = result.user;
      console.log('Google login successful:', user);
      
      // Check if the user is new
      const isNewUser = await checkEmail(user.email)
      
      if (isNewUser.message == 'new') {
        // If it's a new user, navigate to the complete registration page
        console.log('New user detected. Navigating to complete registration.');
        // Pass only necessary serializable data
        const serializableUserData = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        };
        navigate('/complete-registration', { state: { googleUserData: serializableUserData } });
      } else {
        // If it's an existing user, proceed with normal login/redirection
        console.log('Existing user detected. Proceeding with normal login.');
        // Call the backend endpoint to log in the existing Google user and get a session token
        try {
          const response = await loginUserGoogle({
            firebaseUid: user.uid,
            
            email: user.email,
          
            // accountType and meetingArea are not needed for existing users here
            // The backend will retrieve these from the existing user document
          });

          console.log('Existing Google user login successful:', response);

          // Store token and user data from backend in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response));

          // Navigate to home page
          navigate('/');

        } catch (backendError) {
          console.error('Error logging in existing Google user on backend:', backendError);
          setError(`Login failed: ${backendError.response?.data?.message || backendError.message}`);
        }
      }

    } catch (error) {
      // Handle Errors here.
      // Note: auth/popup-closed-by-user and auth/cancelled-popup-request are common here
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData?.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error('Google login error:', errorCode, errorMessage, email, credential);
      // Check if the error is due to the user closing the popup
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        console.log('Google login popup was closed by the user.');
        // You might choose not to set an error message for this specific case
        // setError('Google login cancelled.');
      } else {
         setError(`Google login failed: ${errorMessage}`);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Login to RENTED</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>
          
          <div className="form-footer">
            
            <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="social-login">
          <button className="social-button google" onClick={handleGoogleLogin}>
            <i className="fab fa-google"></i>
            <span>Login with Google</span>
          </button>
          
        </div>
        
        <div className="auth-redirect">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;