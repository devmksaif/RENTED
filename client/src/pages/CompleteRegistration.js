import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Import necessary components and services from your project
import { registerUser, completeGoogleRegistration } from '../services/api'; // Import the new API function
import '../styles/Auth.css'; // Reuse existing auth styles
import '../styles/Register.css'; // Reuse existing register styles

// Import Leaflet components and necessary fixes/providers
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';

// Fix Leaflet default icon issue (copying from Register.js)
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

// Reusable Map components (copying from Register.js)
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

function DraggableMarker({ position, onMarkerDrag, radius }) {
  const markerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const eventHandlers = {
    dragstart() { setIsDragging(true); },
    dragend() {
      setIsDragging(false);
      const marker = markerRef.current;
      if (marker) { onMarkerDrag([marker.getLatLng().lat, marker.getLatLng().lng]); }
    }
  };
  return (
    <>
      <Marker draggable={true} eventHandlers={eventHandlers} position={position} ref={markerRef} opacity={isDragging ? 0.7 : 1}>
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

function SetViewOnChange({ coords }) {
  const map = useMap();
  useEffect(() => { if (coords) { map.setView(coords, map.getZoom()); } }, [coords, map]);
  return null;
}

function CompleteRegistration() {
  const navigate = useNavigate();
  const location = useLocation();
  const googleUserData = location.state?.googleUserData; // Get user data passed from Login

  const [formData, setFormData] = useState({
    // Pre-fill name and email from Google data
    name: googleUserData?.name || '',
    email: googleUserData?.email || '',
    // Password is not needed for Google sign-in
    phone: '',
    address: '',
    accountType: 'both', // Default account type
    meetingArea: {
      name: '',
      latitude: null,
      longitude: null,
      radius: 1000 // Default radius in meters
    },
    firebaseUid: googleUserData?.uid || '' // Store Firebase UID
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geocodeError, setGeocodeError] = useState('');
  const [position, setPosition] = useState(null); // State for map marker position
  const [locationName, setLocationName] = useState('');
  const [radius, setRadius] = useState(1000); // State for meeting area radius
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-render of map
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Ensure we have Google user data, otherwise redirect back to login
  useEffect(() => {
    if (!googleUserData || !googleUserData.uid) {
      setError('Missing Google user data. Please try logging in again.');
      // Redirect back to login after a short delay
      const timer = setTimeout(() => navigate('/login'), 3000);
      return () => clearTimeout(timer);
    } else {
      // Try to get the user's location on component mount (copying from Register.js)
      setIsLoading(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const initialPos = [latitude, longitude];
            setPosition(initialPos);
            reverseGeocode(initialPos);
            setIsLoading(false);
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Default location (New York) as fallback
            const fallbackPos = [40.7128, -74.0060];
            setPosition(fallbackPos);
            reverseGeocode(fallbackPos);
            setIsLoading(false);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        // Default location if geolocation not supported
        const fallbackPos = [40.7128, -74.0060];
        setPosition(fallbackPos);
        reverseGeocode(fallbackPos);
        setIsLoading(false);
      }
    }
  }, [googleUserData, navigate]); // Depend on googleUserData and navigate

  // Reverse geocoding function (copying from Register.js)
  const reverseGeocode = async (coords) => {
    try {
      setGeocodeError('');
      const [lat, lng] = coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      if (!response.ok) { throw new Error(`Geocoding failed with status: ${response.status}`); }
      const data = await response.json();
      const name = data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setLocationName(name);
      updateMeetingArea(lat, lng, name, radius); // Use current radius state
    } catch (error) {
      console.error("Error with reverse geocoding:", error);
      setGeocodeError('Could not retrieve location name. Please select manually.');
      const fallbackName = `Location at ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      setLocationName(fallbackName);
      updateMeetingArea(coords[0], coords[1], fallbackName, radius);
    }
  };

  // Handler for map click events (copying from Register.js, simplified animation)
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    const newPosition = [lat, lng];
    setPosition(newPosition);
    reverseGeocode(newPosition);
  };

  // Handler for marker drag events (copying from Register.js)
  const handleMarkerDrag = async (newPosition) => {
    setPosition(newPosition);
    await reverseGeocode(newPosition);
  };

  // Handler for search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handler for location search (copying from Register.js)
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
    } finally { setIsSearching(false); }
  };

  // Handler for search result click (copying from Register.js)
  const handleSearchResultClick = (result) => {
    const { x, y, label } = result;
    const latlng = [y, x];
    setPosition(latlng);
    setLocationName(label);
    updateMeetingArea(y, x, label, radius); // Use current radius state
    setSearchResults([]);
    setSearchQuery(label);
  };

  // Handler for radius change (copying from Register.js)
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setRadius(newRadius);
    if (position) { updateMeetingArea(position[0], position[1], locationName, newRadius); }
  };

  // Helper function to update meeting area (copying from Register.js, adapted)
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

  const handleAccountTypeChange = (type) => {
    setFormData(prev => ({ ...prev, accountType: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.meetingArea.latitude || !formData.meetingArea.longitude) {
      setError('Please select a meeting location');
      return;
    }

    setIsLoading(true);

    try {
      
      
      // Call the new backend API to complete Google registration
      const response = await completeGoogleRegistration({
        firebaseUid: formData.firebaseUid,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        name: formData.name, // Use name from form data
        email: formData.email, // Use email from form data
        accountType: formData.accountType,
        meetingArea: formData.meetingArea.name ? formData.meetingArea : undefined,
      });

      console.log('Google registration completion response:', response);
      
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      // Assuming your backend returns a user object similar to the existing login
      localStorage.setItem('user', JSON.stringify(response)); // Store the user object from backend response

      // Redirect to home page after successful completion
      navigate('/');

    } catch (error) {
      console.error('Google registration completion error:', error);
      // Handle errors from backend API call
      setError(error.response?.data?.message || 'Failed to complete registration. Please try again.');
    } finally { setIsLoading(false); }
  };

  // Map styles (copying from Register.js)
  const mapStyles = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .leaflet-container { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; transition: all 0.3s ease; }
    .geocoder-input:focus { outline: none; box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5) !important; }
    .popup-hint { font-size: 12px; color: #666; margin-top: 5px; font-style: italic; }
    .radius-selector input[type="range"] { -webkit-appearance: none; appearance: none; background: linear-gradient(to right, #4CAF50, #8BC34A); height: 8px; border-radius: 5px; outline: none; margin: 10px 0; }
    .radius-selector input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #4CAF50; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: all 0.2s ease; }
    .radius-selector input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.1); }
    .radius-selector input[type="range"]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #4CAF50; cursor: pointer; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: all 0.2s ease; }
    .radius-selector input[type="range"]::-moz-range-thumb:hover { transform: scale(1.1); }
    .radius-labels { display: flex; justify-content: space-between; font-size: 0.9em; color: #555; }
    .map-loading { display: flex; justify-content: center; align-items: center; height: 400px; font-size: 1.2em; color: #555; }
    .map-loading .fa-spinner { margin-right: 10px; }
  `; // Combine map related styles

  if (!googleUserData) {
    // Render a loading or error state while redirecting
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <h2>Completing Registration...</h2>
            {error && <div className="auth-error">{error}</div>}
            {!error && <i className="fas fa-spinner fa-spin"></i>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <style>{mapStyles}</style>
      <div className="auth-container">
        <div className="auth-card">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-header">
              <h2>Complete Your Account Setup</h2>
              <p>Please provide a few more details to finish setting up your account.</p>
            </div>

            {error && <div className="auth-error">{error}</div>}

            {/* Name and Email - pre-filled and read-only */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" value={formData.name} readOnly disabled />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" value={formData.email} readOnly disabled />
            </div>

            {/* Account Type Selection */}
            <div className="form-group">
              <label>Account Type</label>
              <div className="account-type-options">
                <div className={`account-type-option ${formData.accountType === 'renter' ? 'selected' : ''}`} onClick={() => handleAccountTypeChange('renter')}>
                  <i className="fas fa-hand-holding-usd"></i>&nbsp;
                  <div className="account-type-label">Renter : &nbsp;</div>
                  <div className="account-type-desc">I want to rent items from others</div>
                </div>
                <div className={`account-type-option ${formData.accountType === 'rentee' ? 'selected' : ''}`} onClick={() => handleAccountTypeChange('rentee')}>
                  <i className="fas fa-store"></i>&nbsp;
                  <div className="account-type-label">Rentee : &nbsp;</div>
                  <div className="account-type-desc">I want to rent out my items</div>
                </div>
                <div className={`account-type-option ${formData.accountType === 'both' ? 'selected' : ''}`} onClick={() => handleAccountTypeChange('both')}>
                  <i className="fas fa-exchange-alt"></i>&nbsp;
                  <div className="account-type-label">Both : &nbsp;</div>
                  <div className="account-type-desc">I want to do both</div>
                </div>
              </div>
            </div>

            {/* Meeting Location Section */}
            <div className="location-selection-container">
              <p className="location-instruction">
                <i className="fas fa-info-circle"></i> Select a location where you'd prefer to meet for item exchanges.
              </p>
              {/* Location Search Input */}
              <div className="location-search-container">
                <div className="location-search-input-group">
                  <i className="fas fa-search search-icon"></i>
                  <input type="text" className="location-search-input-order" placeholder="Search for a location or address" value={searchQuery} onChange={handleSearchInputChange} />
                  <button type="button" className="location-search-button-order" onClick={handleLocationSearch} disabled={isSearching || searchQuery.length < 3} title="Search for this location">
                    {isSearching ? (<i className="fas fa-spinner fa-spin"></i>) : (<i className="fas fa-arrow-right"></i>)}
                  </button>
                </div>
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="location-search-results">
                    {searchResults.map((result, index) => (
                      <div key={index} className="location-search-result-item" onClick={() => handleSearchResultClick(result)}>
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

              {geocodeError && (<div className="geocode-error"><i className="fas fa-exclamation-triangle"></i> {geocodeError}</div>)}

              <div className="location-details">
                <div className="location-name">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>{locationName || 'No location selected yet'}</span>
                </div>
                {position && (<div className="location-coordinates"><i className="fas fa-compass"></i><span>{position[0].toFixed(6)}, {position[1].toFixed(6)}</span></div>)}
              </div>

              <div className="radius-selector">
                <label htmlFor="radius"><i className="fas fa-circle-notch"></i> Meeting Area Radius: {radius / 1000} km</label>
                <input type="range" id="radius" min="500" max="5000" step="500" value={radius} onChange={handleRadiusChange} />
                <div className="radius-labels"><span>0.5 km</span><span>5 km</span></div>
              </div>

              {/* Map Container */}
              <div className="map-container">
                {position ? (
                  <MapContainer key={mapKey} center={position} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '8px' }} whenCreated={() => setMapLoaded(true)}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <DraggableMarker position={position} onMarkerDrag={handleMarkerDrag} radius={radius} />
                    <SetViewOnChange coords={position} />
                  </MapContainer>
                ) : isLoading ? (
                  <div className="map-loading"><i className="fas fa-spinner fa-spin"></i> Loading map...</div>
                ) : (
                   <div className="map-loading">Could not load map. Please refresh or try again.</div>
                )}
              </div>
            </div>

            <div className="form-navigation">
              <button type="submit" className="auth-button" disabled={isLoading || !position}>
                {isLoading ? (<><i className="fas fa-spinner fa-spin"></i> Completing Setup...</>) : (<>Complete Setup <i className="fas fa-check"></i></>)}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            {/* No "Already have an account?" link here as this is for Google users */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteRegistration; 