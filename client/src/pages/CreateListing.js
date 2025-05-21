import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing } from '../services/api';
import '../styles/CreateListing.css';
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

// Custom GeoCoder component
function GeocoderControl({ onLocationSelect }) {
  const map = useMap();
  const provider = new OpenStreetMapProvider();
  
  useEffect(() => {
    // Create a search control manually
    const searchControl = L.Control.extend({
      options: {
        position: 'topleft'
      },
      onAdd: function() {
        const container = L.DomUtil.create('div', 'leaflet-control leaflet-control-geocoder');
        const input = L.DomUtil.create('input', 'geocoder-input', container);
        input.setAttribute('type', 'text');
        input.setAttribute('placeholder', 'Search for a location');
        input.style.cssText = 'width: 280px; height: 40px; padding: 0 12px; border-radius: 8px; border: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15);';
        
        L.DomEvent.addListener(input, 'keydown', async function(e) {
          if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            
            const query = e.target.value;
            if (query.length < 3) return;
            
            try {
              const results = await provider.search({ query });
              if (results && results.length > 0) {
                const { x, y, label } = results[0];
                const latlng = [y, x];
                map.setView(latlng, 15);
                onLocationSelect(latlng, label);
              }
            } catch (error) {
              console.error("Geocoding error:", error);
            }
          }
        });
        
        return container;
      }
    });
    
    map.addControl(new searchControl());
    
    return () => {
      // Cleanup if needed
    };
  }, [map, provider, onLocationSelect]);
  
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

// Marker with drag handler
function DraggableMarker({ position, onMarkerDrag }) {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const latlng = marker.getLatLng();
        onMarkerDrag([latlng.lat, latlng.lng]);
      }
    }
  };

  return (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <div>Item Location</div>
        <div>{position[0].toFixed(4)}, {position[1].toFixed(4)}</div>
      </Popup>
    </Marker>
  );
}

// Inside the CreateListing component
function CreateListing() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: [],
    price: '',
    location: '',
    image: '',
    availability: 'Available',
    latitude: null,
    longitude: null,
    searchRadius: 20  // Default search radius in kilometers
  });
  
  // Map state
  const [position, setPosition] = useState([40.7128, -74.0060]); // Default to New York
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-render of map
  const [userRole, setUserRole] = useState(''); // To check if user is a renter
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [popularLocations, setPopularLocations] = useState([
    // Tunisia States
    { name: 'Tunis', coords: [36.8065, 10.1815] },
    { name: 'Sfax', coords: [34.7406, 10.7603] },
    { name: 'Sousse', coords: [35.8245, 10.6346] },
    { name: 'Kairouan', coords: [35.6781, 10.0969] },
    { name: 'Bizerte', coords: [37.2746, 9.8627] },
    { name: 'Gabès', coords: [33.8881, 10.0986] },
    { name: 'Ariana', coords: [36.8625, 10.1956] },
    { name: 'Gafsa', coords: [34.4311, 8.7757] },
    { name: 'Monastir', coords: [35.7780, 10.8262] },
    { name: 'Ben Arous', coords: [36.7533, 10.2282] },
    { name: 'Kasserine', coords: [35.1722, 8.8304] },
    { name: 'Médenine', coords: [33.3399, 10.4917] },
    { name: 'Nabeul', coords: [36.4513, 10.7357] },
    { name: 'Tataouine', coords: [32.9210, 10.4509] },
    { name: 'Béja', coords: [36.7256, 9.1817] },
    { name: 'Jendouba', coords: [36.5011, 8.7757] },
    { name: 'Mahdia', coords: [35.5047, 11.0622] },
    { name: 'Kef', coords: [36.1675, 8.7096] },
    { name: 'Siliana', coords: [36.0844, 9.3708] },
    { name: 'Zaghouan', coords: [36.4028, 10.1433] },
    { name: 'Kébili', coords: [33.7050, 8.9690] },
    { name: 'Sidi Bouzid', coords: [35.0382, 9.4850] },
    { name: 'Tozeur', coords: [33.9197, 8.1335] },
    { name: 'Manouba', coords: [36.8081, 10.0957] },
    // Original locations

  ]); 
// Add these new state variables
const [searchQuery, setSearchQuery] = useState('');
const [isSearching, setIsSearching] = useState(false);
const [searchResults, setSearchResults] = useState([]);

// Define available categories
const availableCategories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Vehicles',
  'Tools & Equipment',
  'Toys & Games',
  'Other'
];

// Add this new function for handling search input changes
const handleSearchInputChange = (e) => {
  setSearchQuery(e.target.value);
};

// Add this new function for location search
const handleLocationSearch = async () => {
  if (searchQuery.length < 3) {
    setError('Please enter at least 3 characters to search');
    return;
  }
  
  setIsSearching(true);
  setSearchResults([]);
  
  try {
    const provider = new OpenStreetMapProvider();
    const results = await provider.search({ query: searchQuery });
    setSearchResults(results.slice(0, 5)); // Limit to top 5 results
  } catch (error) {
    console.error("Search error:", error);
    setError('Error searching for location. Please try again.');
  } finally {
    setIsSearching(false);
  }
};

// Add this new function for handling search result selection
const handleSearchResultClick = (result) => {
  const { x, y, label } = result;
  const latlng = [y, x];
  setPosition(latlng);
  setLocationName(label);
  updateLocation(y, x, label);
  setSearchResults([]);
  setSearchQuery(label);
  
  // Update map view
  const map = document.querySelector('.leaflet-container')?._leaflet_map;
  if (map) {
    map.setView(latlng, 15);
  }
};

  // Check user role on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.accountType || '');
    
    // Redirect if not a renter
    if (user.accountType !== 'renter' && user.accountType !== 'both') {
      setError('Only renters can create listings');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
    
    // Try to get user's location
    getUserLocation();
  }, [navigate]);

  // Get user's location
  const getUserLocation = () => {
    setIsLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          updateLocation(latitude, longitude);
          setIsLocationLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default location (New York) as fallback
          setIsLocationLoading(false);
          setUseCurrentLocation(false);
        }
      );
    } else {
      setIsLocationLoading(false);
      setUseCurrentLocation(false);
    }
  };

  // Reverse geocoding function
  const reverseGeocode = async (coords) => {
    try {
      const [lat, lng] = coords;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setLocationName(data.display_name);
        updateLocation(lat, lng, data.display_name);
      } else {
        const fallbackName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        setLocationName(fallbackName);
        updateLocation(lat, lng, fallbackName);
      }
    } catch (error) {
      console.error("Error with reverse geocoding:", error);
      const fallbackName = `Location at ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
      setLocationName(fallbackName);
      updateLocation(coords[0], coords[1], fallbackName);
    }
  };

  // Handler for map click events
  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    await reverseGeocode([lat, lng]);
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
    updateLocation(coords[0], coords[1], label);
  };
  
  // Set location to one of the popular locations
  const setPopularLocation = (coords, name) => {
    setPosition(coords);
    setLocationName(name);
    updateLocation(coords[0], coords[1], name);
  };
  
  // Helper function to update location
  const updateLocation = (lat, lng, locationName = '') => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: locationName || prev.location || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
  };

  // Handler for category selection/deselection
  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const currentCategories = Array.isArray(prev.category) ? prev.category : [];
      if (currentCategories.includes(category)) {
        // Remove category if already selected
        return { ...prev, category: currentCategories.filter(cat => cat !== category) };
      } else {
        // Add category if not selected
        return { ...prev, category: [...currentCategories, category] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'searchRadius') {
      const radius = parseFloat(value) || 20;
      setFormData({
        ...formData,
        searchRadius: radius
      });
    } else {
      setFormData({
        ...formData,
        [name]: name === 'price' ? parseFloat(value) || '' : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      setError('Please select a location on the map');
      setIsLoading(false);
      return;
    }
    
    // Validate price
    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price');
      setIsLoading(false);
      return;
    }

    try {
      await createListing(formData);
      navigate('/listings');
    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error.response?.data?.message || 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If user is not a renter, show error message
  if (userRole && userRole !== 'renter' && userRole !== 'both') {
    return (
      <div className="create-listing-container">
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          <span>Only renters can create listings. Redirecting to home page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="create-listing-container">
      <div className="create-listing-header">
        <h1>Create New Listing</h1>
        <p>Rent out your items and start earning</p>
      </div>

      {error && (
        <div className="error-alert">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      <form className="create-listing-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your item in detail"
            rows="4"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          
          {/* Display Selected Categories as Tags */}
          {formData.category.length > 0 && (
            <div className="selected-categories-tags">
              {formData.category.map(cat => (
                <div key={cat} className="category-tag">
                  <span>{cat}</span>
                  <button type="button" onClick={() => handleCategoryToggle(cat)}>
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Display Available Categories to Select */}
          <div className="available-categories-list">
            <h4>Select Categories:</h4>
            <div className="categories-grid">
              {availableCategories.map(cat => (
                // Render only if not already selected
                !formData.category.includes(cat) && (
                  <button
                    key={cat}
                    type="button"
                    className="available-category-item"
                    onClick={() => handleCategoryToggle(cat)}
                  >
                    {cat}
                  </button>
                )
              ))}
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="price">Price per day ($)</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group location-group">
          <label>Item Location</label>
          
          {/* Location Controls */}
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i>
            <span  >{isLocationLoading ? 'Getting your location...' : (locationName || 'Set your item location on the map')}</span>
          </div>
          
          {/* Add new location search input */}
          <div className="location-search-container">
            <div className="location-search-input-group">
             
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
          
          <div className="location-controls">
            <button 
              type="button"
              className={`location-btn ${useCurrentLocation ? 'active' : ''}`}
              onClick={() => {
                setUseCurrentLocation(true);
                getUserLocation();
              }}
            >
              <i className="fas fa-location-arrow"></i> Use My Current Location
            </button>
            
            <button 
              type="button" 
              className={`location-btn ${!useCurrentLocation ? 'active' : ''}`}
              onClick={() => setUseCurrentLocation(false)}
            >
              <i className="fas fa-map-marked-alt"></i> Choose Another Location
            </button>
          </div>
          
          {/* Popular Locations */}
          {!useCurrentLocation && (
            <div className="popular-locations">
              <h4>Popular Locations</h4>
              <div className="locations-grid">
                {popularLocations.map((loc, index) => (
                  <button
                    key={index}
                    type="button"
                    className="popular-location-btn"
                    onClick={() => setPopularLocation(loc.coords, loc.name)}
                  >
                    <i className="fas fa-map-pin"></i> {loc.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
         
         
          <small className="map-instructions">
            <i className="fas fa-info-circle"></i> Use the search box or drag the marker to set your item's location. The circle shows the search visibility radius.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="availability">Availability</label>
          <select
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
          >
            <option value="Available">Available</option>
            <option value="Unavailable">Unavailable</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
          <small>Provide a URL to an image of your item. Leave blank for a placeholder image.</small>
        </div>

        <div className="payment-notice" style={{marginBottom: '20px'}}>
          <i className="fas fa-handshake"></i>
          <div>
            <p>All payments will be made hand-to-hand when the rentee collects the item.</p>
            <p>You'll need to validate any booking requests before they become active.</p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/listings')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Creating...
              </>
            ) : (
              'Create Listing'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


export default CreateListing;