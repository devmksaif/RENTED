import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import '../styles/Auth.css';
import '../styles/Register.css';
// Import React Leaflet
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Custom GeoCoder component with improved search experience
function GeocoderControl({ onLocationSelect }) {
  const map = useMap();
  const provider = new OpenStreetMapProvider();
  
  // Remove the search control from the map completely
  // We'll implement a separate search outside the map
  
  return null;
}

// Map click handler component
function MapClickHandler({ onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    map.on('click', onMapClick);
    
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);
  
  return null;
}

// Marker with enhanced drag handler
function DraggableMarker({ position, onMarkerDrag, radius }) {
  const markerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const eventHandlers = {
    dragstart() {
      setIsDragging(true);
    },
    dragend() {
      setIsDragging(false);
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onMarkerDrag([latlng.lat, latlng.lng]);
      }
    }
  };

  return (
    <>
      <Marker 
        draggable={true}
        eventHandlers={eventHandlers}
        position={position}
        ref={markerRef}
        opacity={isDragging ? 0.7 : 1}
      >
        <Popup>
          <div>Meeting Location</div>
          <div>{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
          <div className="popup-hint">Drag marker to adjust location</div>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={radius || 1000}
        pathOptions={{
          fillColor: '#4CAF50',
          fillOpacity: 0.2,
          weight: 1,
          color: '#4CAF50',
          opacity: isDragging ? 0.8 : 0.5
        }}
      />
    </>
  );
}

// Map center component to keep map centered on marker
function SetViewOnChange({ coords }) {
  const map = useMap();
  
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  
  return null;
}

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    accountType: 'both',
    meetingArea: {
      name: '',
      latitude: null,
      longitude: null,
      radius: 1000 // Default radius in meters
    }
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [position, setPosition] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-render of map
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radius, setRadius] = useState(1000); // Default radius in meters
  const navigate = useNavigate();
  // Add missing state variables for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

// Add missing handler functions
const handleSearchInputChange = (e) => {
  setSearchQuery(e.target.value);
};

const handleLocationSearch = async () => {
  if (searchQuery.length < 3) return;
  
  setIsSearching(true);
  try {
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    setSearchResults(results.slice(0, 5)); // Limit to top 5 results
  } catch (error) {
    console.error("Search error:", error);
    setGeocodeError('Search failed. Please try again.');
  } finally {
    setIsSearching(false);
  }
};

const handleSearchResultClick = (result) => {
  const { x, y, label } = result;
  const latlng = [y, x];
  setPosition(latlng);
  setLocationName(label);
  updateMeetingArea(y, x, label, radius);
  setSearchResults([]);
  setSearchQuery(label);
};

  // Try to get the user's location on component mount
  useEffect(() => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          reverseGeocode([latitude, longitude]);
          setIsLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default location (New York) as fallback
          setPosition([40.7128, -74.0060]);
          reverseGeocode([40.7128, -74.0060]);
          setIsLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      // Default location if geolocation not supported
      setPosition([40.7128, -74.0060]);
      reverseGeocode([40.7128, -74.0060]);
      setIsLoading(false);
    }
  }, []);

  // Reverse geocoding function with improved error handling
  const reverseGeocode = async (coords) => {
    try {
      setGeocodeError('');
      const [lat, lng] = coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.display_name) {
        setLocationName(data.display_name);
        updateMeetingArea(lat, lng, data.display_name, radius);
      } else {
        const fallbackName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setLocationName(fallbackName);
        updateMeetingArea(lat, lng, fallbackName, radius);
      }
    } catch (error) {
      console.error("Error with reverse geocoding:", error);
      setGeocodeError('Could not retrieve location name. You can still continue.');
      const fallbackName = `Location at ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      setLocationName(fallbackName);
      updateMeetingArea(coords[0], coords[1], fallbackName, radius);
    }
  };

  // Handler for map click events with animation
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Animate marker movement
    const startPos = position;
    const endPos = [lat, lng];
    const frames = 10;
    const duration = 300; // ms
    
    for (let i = 1; i <= frames; i++) {
      setTimeout(() => {
        const progress = i / frames;
        const newLat = startPos[0] + (endPos[0] - startPos[0]) * progress;
        const newLng = startPos[1] + (endPos[1] - startPos[1]) * progress;
        setPosition([newLat, newLng]);
      }, (duration / frames) * i);
    }
    
    // Update final position and get location name
    setTimeout(() => {
      setPosition(endPos);
      reverseGeocode(endPos);
    }, duration);
  };

  // Handler for marker drag events
  const handleMarkerDrag = async (newPosition) => {
    setPosition(newPosition);
    await reverseGeocode(newPosition);
  };

  // Handler for location selected from search
  const handleLocationSelect = async (coords, label) => {
    setPosition(coords);
    setLocationName(label);
    updateMeetingArea(coords[0], coords[1], label, radius);
  };
  
  // Handler for radius change
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setRadius(newRadius);
    if (position) {
      updateMeetingArea(position[0], position[1], locationName, newRadius);
    }
  };
  
  // Helper function to update meeting area
  const updateMeetingArea = (lat, lng, name = '', rad = 1000) => {
    setFormData(prev => ({
      ...prev,
      meetingArea: {
        name: name || prev.meetingArea.name || `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng,
        radius: rad
      }
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    
    // Basic form validation
    if (id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setError('Please enter a valid email address');
      } else {
        setError('');
      }
    }
    
    if (id === 'confirmPassword') {
      if (value !== formData.password) {
        setError('Passwords do not match');
      } else {
        setError('');
      }
    }
    
    setFormData({
      ...formData,
      [id]: value
    });
  };

  const nextStep = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.name) {
        setError('Please enter your name');
        return;
      }
      if (!formData.email) {
        setError('Please enter your email');
        return;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      if (!formData.password) {
        setError('Please enter a password');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    // Clear any existing errors
    setError('');
    
    // Animate transition
    const formElement = document.querySelector('.auth-form');
    formElement.style.opacity = '0';
    formElement.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
      setCurrentStep(prevStep => prevStep + 1);
      
      // If moving to the map step, refresh the map
      if (currentStep === 2) {
        setMapKey(Date.now());
        setMapLoaded(false);
      }
      
      // Reset animation for next step
      formElement.style.opacity = '1';
      formElement.style.transform = 'translateY(0)';
    }, 300);
  };

  const prevStep = () => {
    // Animate transition
    const formElement = document.querySelector('.auth-form');
    formElement.style.opacity = '0';
    formElement.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      setCurrentStep(prevStep => prevStep - 1);
      
      // Reset animation for next step
      formElement.style.opacity = '1';
      formElement.style.transform = 'translateY(0)';
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Final validation before submission
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (!formData.meetingArea.latitude || !formData.meetingArea.longitude) {
      setError('Please select a meeting location');
      return;
    }
    
    setIsLoading(true);
  
    try {
      console.log('Attempting registration with:', { 
        name: formData.name,
        email: formData.email,
        password: '****',
        phone: formData.phone,
        accountType: formData.accountType,
        address: formData.address,
        meetingArea: formData.meetingArea
      });
      
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        accountType: formData.accountType,
        address: formData.address,
        meetingArea: formData.meetingArea.name ? formData.meetingArea : undefined
      });
      
      console.log('Registration response:', response);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        id: response._id,
        name: response.name,
        email: response.email,
        accountType: response.accountType,
        role: response.role || 'user',
        meetingAreas: response.meetingAreas || []
      }));
      
      // Show success animation before redirecting
      const formElement = document.querySelector('.auth-card');
      formElement.style.transition = 'all 0.5s ease';
      formElement.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.5)';
      formElement.style.transform = 'scale(1.03)';
      
      setTimeout(() => {
        // Redirect to home page after successful registration
        navigate('/');
      }, 800);
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

  // Render step 1 - Basic information
  const renderStep1 = () => (
    <>
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Step 1: Basic Information</p>
      </div>
      
      {error && <div className="auth-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a password (min. 6 characters)"
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          required
        />
      </div>
      
      <div className="form-navigation">
        <button 
          type="button" 
          className="auth-button"
          onClick={nextStep}
        >
          Next <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </>
  );
  
  // Render step 2 - Additional information
  const renderStep2 = () => (
    <>
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Step 2: Additional Information</p>
      </div>
      
      {error && <div className="auth-error">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="phone">Phone Number (Optional)</label>
        <input
          type="tel"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="address">Address (Optional)</label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your address"
        />
      </div>
      
      <div className="form-group">
        <label>Account Type</label>
        <div className="account-type-options">
          <div 
            className={`account-type-option ${formData.accountType === 'renter' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, accountType: 'renter'})}
          >
            <i className="fas fa-hand-holding-usd"></i>&nbsp;
            <div className="account-type-label">Renter : &nbsp;</div>
            <div className="account-type-desc">I want to rent items from others</div>
          </div>
          
          <div 
            className={`account-type-option ${formData.accountType === 'rentee' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, accountType: 'rentee'})}
          >
            <i className="fas fa-store"></i>&nbsp;
            <div className="account-type-label">Rentee : &nbsp;</div>
            <div className="account-type-desc">I want to rent out my items</div>
          </div>
          
          <div 
            className={`account-type-option ${formData.accountType === 'both' ? 'selected' : ''}`}
            onClick={() => setFormData({...formData, accountType: 'both'})}
          >
            <i className="fas fa-exchange-alt"></i>&nbsp;
            <div className="account-type-label">Both : &nbsp;</div>
            <div className="account-type-desc">I want to do both</div>
          </div>
        </div>
      </div>
      
      <div className="form-navigation">
        <button 
          type="button" 
          className="back-button"
          onClick={prevStep}
        >
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <button 
          type="button" 
          className="auth-button"
          onClick={nextStep}
        >
          Next <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </>
  );

  // Render step 3 - Meeting location with improved map
  const renderStep3 = () => (
    <>
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Step 3: Meeting Location</p>
      </div>
      
      {error && <div className="auth-error">{error}</div>}
      
      <div className="location-selection-container">
        <p className="location-instruction">
          <i className="fas fa-info-circle"></i> Select a location where you'd prefer to meet for item exchanges. This helps us find items near you.
        </p>
        
        {/* Enhanced separate location search input */}
        <div className="location-search-container">
          <div className="location-search-input-group">
            <i className="fas fa-search search-icon"></i>
            <input
              type="text"
              className="location-search-input"
              placeholder="Search for a location or address"
              value={searchQuery}
              onChange={handleSearchInputChange}
            />
            <button 
              type="button" 
              className="location-search-button"
              onClick={handleLocationSearch}
              disabled={isSearching || searchQuery.length < 3}
              title="Search for this location"
            >
              {isSearching ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-arrow-right"></i>
              )}
            </button>
          </div>
          
          {/* Search results with animation */}
          {searchResults.length > 0 && (
            <div className="location-search-results">
              {searchResults.map((result, index) => (
                <div 
                  key={index} 
                  className="location-search-result-item"
                  onClick={() => handleSearchResultClick(result)}
                >
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{result.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="location-search-results">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="location-search-result-item"
                onClick={() => handleSearchResultClick(result)}
              >
                <i className="fas fa-map-marker-alt"></i>
                <span>{result.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ul className="location-options">
        <li><i className="fas fa-search"></i> Search for a location above</li>
        <li><i className="fas fa-mouse-pointer"></i> Click directly on the map</li>
        <li><i className="fas fa-arrows-alt"></i> Drag the marker to fine-tune</li>
      </ul>
      
      {geocodeError && (
        <div className="geocode-error">
          <i className="fas fa-exclamation-triangle"></i> {geocodeError}
        </div>
      )}
      
      <div className="location-details">
        <div className="location-name">
          <i className="fas fa-map-marker-alt"></i>
          <span>{locationName || 'No location selected yet'}</span>
        </div>
        
        {position && (
          <div className="location-coordinates">
            <i className="fas fa-compass"></i>
            <span>
              {position[0].toFixed(6)}, {position[1].toFixed(6)}
            </span>
          </div>
        )}
      </div>
      
      <div className="radius-selector">
        <label htmlFor="radius">
          <i className="fas fa-circle-notch"></i> Meeting Area Radius: {radius / 1000} km
        </label>
        <input
          type="range"
          id="radius"
          min="500"
          max="5000"
          step="500"
          value={radius}
          onChange={handleRadiusChange}
        />
        <div className="radius-labels">
          <span>0.5 km</span>
          <span>5 km</span>
        </div>
      </div>
      
      <div className="map-container">
        {position && (
          <MapContainer
            key={mapKey}
            center={position}
            zoom={13}
            style={{ height: '400px', width: '100%', borderRadius: '8px' }}
            whenCreated={() => setMapLoaded(true)}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            <DraggableMarker 
              position={position} 
              onMarkerDrag={handleMarkerDrag}
              radius={radius}
            />
            <SetViewOnChange coords={position} />
            <GeocoderControl onLocationSelect={handleLocationSelect} />
          </MapContainer>
        )}
        
        {isLoading && (
          <div className="map-loading">
            <i className="fas fa-spinner fa-spin"></i> Loading map...
          </div>
        )}
      </div>
   
    
    <div className="form-navigation">
      <button 
        type="button" 
        className="back-button"
        onClick={prevStep}
      >
        <i className="fas fa-arrow-left"></i> Back
      </button>
      <button 
        type="submit" 
        className="auth-button"
        disabled={isLoading || !position}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Creating Account...
          </>
        ) : (
          <>
            Create Account <i className="fas fa-check"></i>
          </>
        )}
      </button>
    </div>
  </>
);

  // Add this to your CSS or inline styles
  const mapStyles = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .leaflet-container {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      transition: all 0.3s ease;
    }
    
    .geocoder-input:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5) !important;
    }
    
    .popup-hint {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
      font-style: italic;
    }
    
    .radius-slider {
      -webkit-appearance: none;
      appearance: none;
      background: linear-gradient(to right, #4CAF50, #8BC34A);
    }
    
    .radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    
    .radius-slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
    }
    
    .radius-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #4CAF50;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      transition: all 0.2s ease;
    }
    
    .radius-slider::-moz-range-thumb:hover {
      transform: scale(1.1);
    }
  `;

  return (
    <div className="auth-page">
      <style>{mapStyles}</style>
      <div className="auth-container">
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </form>
          
          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Log In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
