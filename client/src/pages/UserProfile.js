import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getUserProfile, updateUserProfile, updateUserMeetingArea } from '../services/api';
import '../styles/UserProfile.css';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';


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
          <div>Your Location</div>
          <div>{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
          <div className="popup-hint">Drag marker to adjust location</div>
        </Popup>
      </Marker>
      <Circle
        center={position}
        radius={radius || 100}
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

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    latitude: null,
    longitude: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [mapPosition, setMapPosition] = useState([36.8065, 10.1815]); // Default to Tunis
  const [addressFromMap, setAddressFromMap] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-render of map
  const [mapLoaded, setMapLoaded] = useState(false);
  const [radius, setRadius] = useState(100); // Default radius in meters
  const [searchResults, setSearchResults] = useState([]);
  const [geocodeError, setGeocodeError] = useState('');
  const [meetingAreas, setMeetingAreas] = useState([]);
  const [selectedMeetingArea, setSelectedMeetingArea] = useState(null);
  const [meetingAreaAction, setMeetingAreaAction] = useState('add'); // 'add', 'update', 'delete'
  const mapRef = useRef(null);
  const provider = useRef(new OpenStreetMapProvider());
  
  // Rename this function to avoid the recursive call
  const handleUpdateMeetingArea = async (meetingAreaData) => {
    try {
      setIsUpdating(true);
      const response = await updateUserMeetingArea(meetingAreaData);
      
      // Update local state with the response data
      if (response.meetingAreas) {
        setMeetingAreas(response.meetingAreas);
      }
      
      setSuccessMessage('Meeting area updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      return response;
    } catch (error) {
      console.error('Error updating meeting area:', error);
      setError('Failed to update meeting area. Please try again.');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };
  
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await getUserProfile();
      setUser(userData);
      setProfile(userData); // Store profile data separately
      
      // Set meeting areas if available
      if (userData.meetingAreas && userData.meetingAreas.length > 0) {
        setMeetingAreas(userData.meetingAreas);
        
        // Find default meeting area
        const defaultArea = userData.meetingAreas.find(area => area.isDefault);
        if (defaultArea) {
          setMapPosition([defaultArea.latitude, defaultArea.longitude]);
        }
      }
      
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        latitude: userData.latitude || null,
        longitude: userData.longitude || null
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        setAddressFromMap(data.display_name);
        setFormData(prev => ({
          ...prev,
          address: data.display_name,
          latitude: lat,
          longitude: lng
        }));
      } else {
        const fallbackName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setAddressFromMap(fallbackName);
        setFormData(prev => ({
          ...prev,
          address: fallbackName,
          latitude: lat,
          longitude: lng
        }));
      }
    } catch (error) {
      console.error("Error with reverse geocoding:", error);
      setGeocodeError('Could not retrieve location name. You can still continue.');
      const fallbackName = `Location at ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      setAddressFromMap(fallbackName);
      setFormData(prev => ({
        ...prev,
        address: fallbackName,
        latitude: coords[0],
        longitude: coords[1]
      }));
    }
  };

  // Handler for map click events with animation
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    
    // Animate marker movement
    const startPos = mapPosition;
    const endPos = [lat, lng];
    const frames = 10;
    const duration = 300; // ms
    
    for (let i = 1; i <= frames; i++) {
      setTimeout(() => {
        const progress = i / frames;
        const newLat = startPos[0] + (endPos[0] - startPos[0]) * progress;
        const newLng = startPos[1] + (endPos[1] - startPos[1]) * progress;
        setMapPosition([newLat, newLng]);
      }, (duration / frames) * i);
    }
    
    // Update final position and get location name
    setTimeout(() => {
      setMapPosition(endPos);
      reverseGeocode(endPos);
    }, duration);
  };

  // Handler for marker drag events
  const handleMarkerDrag = async (newPosition) => {
    setMapPosition(newPosition);
    await reverseGeocode(newPosition);
  };

  // Handler for location selected from search
  const handleLocationSelect = async (coords, label) => {
    setMapPosition(coords);
    setAddressFromMap(label);
    setFormData(prev => ({
      ...prev,
      address: label,
      latitude: coords[0],
      longitude: coords[1]
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setLocationSearchQuery(e.target.value);
    setSearchError('');
  };

  // Handle location search
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    
    if (locationSearchQuery.trim().length < 3) {
      setSearchError('Please enter at least 3 characters');
      return;
    }
    
    setIsSearching(true);
    setSearchError('');
    
    try {
      const results = await provider.current.search({ query: locationSearchQuery });
      
      if (results && results.length > 0) {
        setSearchResults(results.slice(0, 5)); // Limit to top 5 results
      } else {
        setSearchError('No results found for this location');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      setSearchError('Failed to search for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    const { x, y, label } = result;
    const latlng = [y, x];
    setMapPosition(latlng);
    setAddressFromMap(label);
    setFormData(prev => ({
      ...prev,
      address: label,
      latitude: y,
      longitude: x
    }));
    setSearchResults([]);
    setLocationSearchQuery(label);
    
    // If map is not visible, show it
    if (!showMap) {
      setShowMap(true);
    }
    
    // If map is rendered, set its view
    if (mapRef.current) {
      mapRef.current.setView(latlng, 15);
    }
  };
  
  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap) {
      // Force map to re-render when showing
      setMapKey(Date.now());
    }
  };
  
  // Handle radius change
  const handleRadiusChange = (e) => {
    const newRadius = parseInt(e.target.value, 10);
    setRadius(newRadius);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Validate form data here if needed
      if (activeTab === 'security' && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setIsUpdating(false);
          return;
        }
        
        if (!formData.currentPassword) {
          setError('Current password is required');
          setIsUpdating(false);
          return;
        }
      }
      
      // Call the API to update the profile
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      
      if (activeTab === 'security' && formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const updatedUser = await updateUserProfile(updateData);
      setUser(updatedUser);
      setProfile(updatedUser);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddMeetingArea = async () => {
    if (!formData.address || !formData.latitude || !formData.longitude) {
      setError('Please select a location on the map first');
      return;
    }
    
    try {
      await updateUserMeetingArea({
        action: 'add',
        area: {
          name: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          isDefault: meetingAreas.length === 0 // Make default if it's the first one
        }
      });
      
      // Reset form and map
      setShowMap(false);
      setAddressFromMap('');
    } catch (error) {
      console.error('Error adding meeting area:', error);
    }
  };

  

  const handleDeleteMeetingArea = async (areaId) => {
    if (window.confirm('Are you sure you want to delete this meeting area?')) {
      try {
        await updateUserMeetingArea({
          action: 'delete',
          areaId
        });
        
        setSelectedMeetingArea(null);
      } catch (error) {
        console.error('Error deleting meeting area:', error);
      }
    }
  };

  const handleSetDefaultMeetingArea = async (areaId) => {
    try {
      setIsUpdating(true);
      const response = await updateUserMeetingArea({
        action: 'set-default',
        areaId
      });
      
      // Update local state with the response data
      if (response.meetingAreas) {
        setMeetingAreas(response.meetingAreas);
        
        // Find the new default meeting area
        const defaultArea = response.meetingAreas.find(area => area.isDefault);
        if (defaultArea) {
          // Update user profile with the default meeting area
          setUser(prevUser => ({
            ...prevUser,
            defaultMeetingArea: defaultArea
          }));
          
          // Update profile state
          setProfile(prevProfile => ({
            ...prevProfile,
            defaultMeetingArea: defaultArea
          }));
          
          // Update form data with the default meeting area
          setFormData(prevForm => ({
            ...prevForm,
            address: defaultArea.name,
            latitude: defaultArea.latitude,
            longitude: defaultArea.longitude
          }));
          
          // Update localStorage
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userData.defaultMeetingArea = defaultArea;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
      
      setSuccessMessage('Default meeting area updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error setting default meeting area:', error);
      setError('Failed to set default meeting area. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const selectMeetingArea = (area) => {
    setSelectedMeetingArea(area);
    setMapPosition([area.latitude, area.longitude]);
    setAddressFromMap(area.name);
    setMeetingAreaAction('update');
    setShowMap(true);
    setMapKey(Date.now()); // Force map to re-render
  };

  // Render meeting areas tab
  const renderMeetingAreasTab = () => (
    <>
      <div className="meeting-areas-header">
        <h3>Your Meeting Areas</h3>
        <p>These are locations where you prefer to meet for item handovers</p>
      </div>
      
      {meetingAreas.length > 0 ? (
        <div className="meeting-areas-list">
          {meetingAreas.map((area) => (
            <div key={area._id} className={`meeting-area-item ${area.isDefault ? 'default' : ''}`}>
              <div className="meeting-area-info">
                <div className="meeting-area-name">
                  {area.name}
                  {area.isDefault && <span className="default-badge">Default</span>}
                </div>
                <div className="meeting-area-coords">
                  {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                </div>
              </div>
              <div className="meeting-area-actions">
                <button 
                  className="edit-button" 
                  onClick={() => selectMeetingArea(area)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                {!area.isDefault && (
                  <>
                    <button 
                      className="default-button" 
                      onClick={() => handleSetDefaultMeetingArea(area._id)}
                    >
                      <i className="fas fa-star"></i>
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteMeetingArea(area._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-meeting-areas">
          <p>You haven't added any meeting areas yet.</p>
        </div>
      )}
      
      <div className="add-meeting-area">
        <button 
          className="add-area-button"
          onClick={() => {
            setSelectedMeetingArea(null);
            setMeetingAreaAction('add');
            setShowMap(true);
            setMapKey(Date.now());
          }}
        >
          <i className="fas fa-plus"></i> Add New Meeting Area
        </button>
      </div>
      
      {showMap && (
        <div className="map-section">
          <div className="map-header">
            <h4>{meetingAreaAction === 'add' ? 'Add New Meeting Area' : 'Update Meeting Area'}</h4>
            <button className="close-map" onClick={() => setShowMap(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="location-search">
            <form onSubmit={handleLocationSearch}>
              <input
                type="text"
                placeholder="Search for a location..."
                value={locationSearchQuery}
                onChange={handleSearchInputChange}
              />
              <button type="submit" disabled={isSearching}>
                {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              </button>
            </form>
            {searchError && <div className="search-error">{searchError}</div>}
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(result)}
                  >
                    {result.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="map-container">
            <MapContainer 
              key={mapKey}
              center={mapPosition} 
              zoom={14} 
              style={{ height: '400px', width: '100%' }}
              whenCreated={mapInstance => {
                mapRef.current = mapInstance;
                setMapLoaded(true);
              }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker 
                position={mapPosition} 
                onMarkerDrag={handleMarkerDrag} 
                radius={radius}
              />
              <MapClickHandler onMapClick={handleMapClick} />
              <SetViewOnChange coords={mapPosition} />
            </MapContainer>
          </div>
          
          <div className="selected-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{addressFromMap || 'No location selected'}</span>
          </div>
          
          <div className="map-actions">
            <button 
              className="cancel-button"
              onClick={() => setShowMap(false)}
            >
              Cancel
            </button>
            <button 
              className="save-button"
              onClick={meetingAreaAction === 'add' ? handleAddMeetingArea : handleUpdateMeetingArea}
              disabled={isUpdating || !addressFromMap}
            >
              {isUpdating ? 'Saving...' : (meetingAreaAction === 'add' ? 'Add Location' : 'Update Location')}
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i>
          <span>Profile</span>
        </button>
        <button 
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-lock"></i>
          <span>Security</span>
        </button>
        <button 
          className={`profile-tab ${activeTab === 'meeting-areas' ? 'active' : ''}`}
          onClick={() => setActiveTab('meeting-areas')}
        >
          <i className="fas fa-map-marker-alt"></i>
          <span>Meeting Areas</span>
        </button>
      </div>
      
      <div className="profile-content">
        {error && <div className="profile-error">{error}</div>}
        {successMessage && <div className="profile-success">{successMessage}</div>}
        
        {activeTab === 'meeting-areas' ? (
          renderMeetingAreasTab()
        ) : (
          <form className="profile-form" onSubmit={handleSubmit}>
            {activeTab === 'profile' && (
              <>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                  />
                  <small>Email cannot be changed</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <div className="address-input-container">
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                    <button 
                      type="button" 
                      className="map-toggle-button"
                      onClick={toggleMap}
                    >
                      <i className={`fas fa-${showMap ? 'times' : 'map-marker-alt'}`}></i>
                      {showMap ? 'Hide Map' : 'Use Map'}
                    </button>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <small className="location-coordinates">
                      Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </small>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="locationSearch">Search Location</label>
                  <div className="address-input-container">
                    <input
                      type="text"
                      id="locationSearch"
                      value={locationSearchQuery}
                      onChange={handleSearchInputChange}
                      placeholder="Enter a location or address"
                      className="location-search-input-holder "
                    />
                    
                    <button 
                      type="button" 
                      className="location-search-button-holder"
                      onClick={handleLocationSearch}
                      disabled={isSearching || locationSearchQuery.trim().length < 3}
                    >
                      {isSearching ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-search"></i>
                      )}
                      <span>{isSearching ? 'Searching...' : 'Search'}</span>
                    </button>
                  </div>
                  
                  {searchError && (
                    <small className="search-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {searchError}
                    </small>
                  )}
                  
                  {searchResults.length > 0 && (
                    <div className="search-results-container">
                      {searchResults.map((result, index) => (
                        <div 
                          key={index} 
                          className="search-result-item"
                          onClick={() => handleSearchResultClick(result)}
                        >
                          <i className="fas fa-map-marker-alt"></i>
                          <span>{result.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {geocodeError && (
                    <small className="search-error">
                      <i className="fas fa-exclamation-circle"></i>
                      {geocodeError}
                    </small>
                  )}
                  
                  {addressFromMap && !searchError && !geocodeError && (
                    <small className="search-result">
                      <i className="fas fa-check-circle"></i> Found: {addressFromMap}
                    </small>
                  )}
                </div>
                
                {showMap && (
                  <div className="map-container">
                    <div className="map-instructions">
                      <i className="fas fa-info-circle"></i>
                      <span>Click on the map to set your location or drag the marker</span>
                    </div>
                    
                    <div className="radius-control">
                      <label htmlFor="radiusSlider">Location Radius: {radius}m</label>
                      <input
                        type="range"
                        id="radiusSlider"
                        min="50"
                        max="500"
                        step="50"
                        value={radius}
                        onChange={handleRadiusChange}
                      />
                    </div>
                    
                    <MapContainer 
                      key={mapKey}
                      center={mapPosition} 
                      zoom={13} 
                      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
                      whenCreated={mapInstance => {
                        mapRef.current = mapInstance;
                        setMapLoaded(true);
                      }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <DraggableMarker 
                        position={mapPosition} 
                        onMarkerDrag={handleMarkerDrag}
                        radius={radius}
                      />
                      <GeocoderControl onLocationSelect={handleLocationSelect} />
                      <MapClickHandler onMapClick={handleMapClick} />
                      <SetViewOnChange coords={mapPosition} />
                    </MapContainer>
                    
                    {addressFromMap && (
                      <div className="selected-address">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{addressFromMap}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            
            {activeTab === 'security' && (
              <>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength="6"
                  />
                  <small>Password must be at least 6 characters long</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            
            <button 
              type="submit" 
              className="profile-button"
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UserProfile;