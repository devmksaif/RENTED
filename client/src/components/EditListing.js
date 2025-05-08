import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getListing, updateListing } from '../services/api';
import '../styles/CreateListing.css'; // Reuse the same styles
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

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    image: '',
    availability: 'Available',
    latitude: null,
    longitude: null,
    searchRadius: 20
  });
  
  // Map state
  const [position, setPosition] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [locationName, setLocationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'success' or 'error'
  const [modalMessage, setModalMessage] = useState('');
  
  // Fetch listing data on component mount
  useEffect(() => {
    const fetchListingData = async () => {
      try {
        setIsLoading(true);
        const data = await getListing(id);
        
        // Update form data with listing data
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          price: data.price || '',
          location: data.location || '',
          image: data.image || '',
          availability: data.availability || 'Available',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          searchRadius: data.searchRadius || 20
        });
        
        // Set map position if coordinates are available
        if (data.latitude && data.longitude) {
          setPosition([data.latitude, data.longitude]);
          setLocationName(data.location || '');
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching listing:', error);
        showErrorModal('Failed to load listing data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchListingData();
  }, [id]);
  
  // Helper function to show error modal
  const showErrorModal = (message) => {
    setModalType('error');
    setModalMessage(message);
    setShowModal(true);
  };
  
  // Helper function to show success modal
  const showSuccessModal = (message) => {
    setModalType('success');
    setModalMessage(message);
    setShowModal(true);
  };
  
  // Close modal handler
  const handleCloseModal = () => {
    setShowModal(false);
    
    // If it was a success modal, navigate after closing
    if (modalType === 'success') {
      navigate('/listings');
    }
  };
  
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleLocationSearch = async () => {
    if (searchQuery.length < 3) {
      showErrorModal('Please enter at least 3 characters to search');
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
      showErrorModal('Error searching for location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearchResultClick = (result) => {
    const { x, y, label } = result;
    const latlng = [y, x];
    setPosition(latlng);
    setLocationName(label);
    updateLocation(y, x, label);
    setSearchResults([]);
    setSearchQuery(label);
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
  
  // Helper function to update location
  const updateLocation = (lat, lng, locationName = '') => {
    setFormData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: locationName || prev.location || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
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
    setIsSaving(true);
    setError(null);
    
    // Validate coordinates
    if (!formData.latitude || !formData.longitude) {
      showErrorModal('Please select a location on the map');
      setIsSaving(false);
      return;
    }
    
    // Validate price
    if (!formData.price || formData.price <= 0) {
      showErrorModal('Please enter a valid price');
      setIsSaving(false);
      return;
    }
    
    try {
      await updateListing(id, formData);
      showSuccessModal('Listing updated successfully!');
      // Note: Navigation now happens after modal is closed
    } catch (error) {
      console.error('Error updating listing:', error);
      showErrorModal(error.response?.data?.message || 'Failed to update listing. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="create-listing-container">
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading listing data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="create-listing-container">
      <div className="create-listing-header">
        <h1>Edit Listing</h1>
        <p>Update your listing information</p>
      </div>
      
      {/* Modal Component */}
      {showModal && (
        <div className="modal-overlay">
          <div className={`modal-container ${modalType}-modal`}>
            <div className="modal-header">
              <h3>{modalType === 'success' ? 'Success!' : 'Error'}</h3>
              <button 
                className="modal-close-button"
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">
                {modalType === 'success' ? (
                  <i className="fas fa-check-circle"></i>
                ) : (
                  <i className="fas fa-exclamation-circle"></i>
                )}
              </div>
              <p>{modalMessage}</p>
            </div>
            <div className="modal-footer">
              <button 
                className="modal-button"
                onClick={handleCloseModal}
              >
                {modalType === 'success' ? 'Continue' : 'Close'}
              </button>
            </div>
          </div>
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
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Vehicles">Vehicles</option>
              <option value="Tools & Equipment">Tools & Equipment</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Other">Other</option>
            </select>
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
        </div>
        
        <div className="form-group location-group">
          <label>Item Location</label>
          
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i>
            <span>{locationName || 'Set your item location on the map'}</span>
          </div>
          
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
          
          {position && (
            <div className="map-container" style={{ height: '400px', marginTop: '20px' }}>
              <MapContainer 
                key={mapKey}
                center={position} 
                zoom={13} 
                style={{ height: '100%', width: '100%', borderRadius: '8px' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <DraggableMarker 
                  position={position} 
                  onMarkerDrag={handleMarkerDrag} 
                />
                
                <MapClickHandler onMapClick={handleMapClick} />
                
                <Circle 
                  center={position}
                  radius={formData.searchRadius * 1000}
                  pathOptions={{
                    fillColor: '#4CAF50',
                    fillOpacity: 0.1,
                    color: '#4CAF50',
                    weight: 1
                  }}
                />
              </MapContainer>
            </div>
          )}
          
          <small className="map-instructions">
            <i className="fas fa-info-circle"></i> Use the search box or drag the marker to set your item's location. The circle shows the search visibility radius.
          </small>
        </div>
        
        <div className="form-row">
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
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditListing;