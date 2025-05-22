import React, { useState, useEffect, useRef } from 'react';
import ProductCard from "./ProductCard"
import "../styles/ProductList.css"
import { getNearbyProducts } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a custom icon for search location
const SearchLocationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Create a custom icon for products
const ProductIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when location changes
function RecenterMap({ position }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

// Component for product markers
function ProductMarkers({ products, handleProductClick }) {
  return (
    <>
      {products.map(product => (
        <Marker 
          key={product._id} 
          position={[product.latitude, product.longitude]}
          icon={ProductIcon}
          eventHandlers={{
            click: () => handleProductClick(product._id)
          }}
        >
          <Popup>
            <div className="map-popup">
              <h3>{product.title}</h3>
              <p>${product.price}/day</p>
              <p>{product.location}</p>
              <button 
                className="view-details-btn"
                onClick={() => window.location.href = `/product/${product._id}`}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

// Custom component to fit bounds around all products
function FitBoundsToMarkers({ searchLocation, products }) {
  const map = useMap();
  
  useEffect(() => {
    if (!searchLocation || !products.length) return;
    
    try {
      const bounds = L.latLngBounds([
        [searchLocation.latitude, searchLocation.longitude],
        ...products.filter(p => p.latitude && p.longitude)
          .map(p => [p.latitude, p.longitude])
      ]);
      
      // Only adjust bounds if we have products
      if (bounds.isValid() && products.length > 0) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 14,
          animate: true
        });
      }
    } catch (error) {
      console.error("Error setting map bounds:", error);
    }
  }, [map, searchLocation, products]);
  
  return null;
}

// Default coordinates for NYC as fallback
const DEFAULT_COORDINATES = {
  latitude: 40.7128,
  longitude: -74.0060,
  label: "New York City"
};

function ProductList({ products, onAddToCart, filterLocation, filterRadius }) {
  console.log('ProductList received products:', products);
  const [searchLocation, setSearchLocation] = useState(null);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // Default 10km radius
  const [showMap, setShowMap] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now());
  const [mapZoom, setMapZoom] = useState(13);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  
  // Update when filter location changes (for map display)
  useEffect(() => {
    if (filterLocation && filterLocation.latitude && filterLocation.longitude) {
      setSearchLocation({
        latitude: filterLocation.latitude,
        longitude: filterLocation.longitude,
        label: filterLocation.label || 'Search location'
      });
      
      // Keep search query for input, but it doesn't control filtering here anymore
      if (filterLocation.label) {
         setLocationSearchQuery(filterLocation.label);
      }
    } else {
       setSearchLocation(null);
       setLocationSearchQuery('');
    }
    
    // Update radius if provided from filter
    if (filterRadius) {
      setSearchRadius(Number(filterRadius));
    }
  }, [filterLocation, filterRadius]);
  
  // Handle radius change - This should ideally trigger a filter change in App.js now
  const handleRadiusChange = (e) => {
     const newRadius = Number(e.target.value);
     setSearchRadius(newRadius);
     // This should likely call a prop function like onRadiusFilterChange
     // For now, just updating local state and map circle
  };
  
  // Toggle map view
  const toggleMapView = () => {
    setShowMap(!showMap);
    // Force map to re-render when showing
    if (!showMap) {
      setMapKey(Date.now());
    }
  };
  
  // Handle product click on map
  const handleProductClick = (productId) => {
    setSelectedProduct(productId); // Keep for highlighting maybe
  };
  
  // Handle location search - This should trigger a location filter change in App.js
  const handleLocationSearch = (e) => {
    e.preventDefault();
    
    if (!locationSearchQuery.trim()) return;
   
    // This part now needs to call onLocationSelect from App.js
    // In a real app, you would geocode locationSearchQuery first
    
    // Simulate geocoding and call the prop function
    // Assuming onLocationSelect exists and updates filterLocation in App.js
    // And assuming App.js's applyFilters handles the geospatial filtering
    const simulatedGeocodedLocation = { 
       label: locationSearchQuery,
       latitude: DEFAULT_COORDINATES.latitude, // Using default as before
       longitude: DEFAULT_COORDINATES.longitude
    };
    
    // Call the prop function to update filter in App.js
    // onLocationSelect(simulatedGeocodedLocation);
    // Need to handle the search query as a filter in App.js as well, or rely on geocoded coords

    // For now, let's just update searchLocation state locally for map display
    // The actual filtering is expected to happen in App.js via filterLocation prop
     setSearchLocation(simulatedGeocodedLocation);
     // Also likely need to trigger filtering in App.js based on this location
     // This might require a new prop like onLocationSearchSubmit

      // Let's call onLocationSelect directly which is a prop from App.js
      if(filterLocation && filterLocation.onLocationSelect) {
         filterLocation.onLocationSelect(simulatedGeocodedLocation);
      }
      // Note: The search query text itself is not used for filtering here anymore
      // App.js's applyFilters uses the filterLocation (geocoded) for filtering

  };
  
  // Determine which products to display - ALWAYS use the products prop from App.js
  const productsToDisplay = products; // Use the filtered products from App.js
  
  // Check if we have products with valid coordinates for map
  // Use products (filtered list) for map markers now
  const validProducts = productsToDisplay.filter(p => p && p.latitude && p.longitude);

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="location-search-container">
          <form onSubmit={handleLocationSearch} className="location-search-form">
            <div className="location-input-group">
              <input
                type="text"
                placeholder="Search by location..."
                value={locationSearchQuery} // Use local state for input display
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="location-search-input"
              />
              <button type="submit" className="location-search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
            
          </form>
          
          
        </div>
        
        {/* Display the filter location label from App.js state */}
        {filterLocation && ( 
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i>
            <span>
              Showing products near: {filterLocation.label}
            </span>
          </div>
        )}
      </div>
      
      {/* Nearby loading/error messages might be less relevant here now if fetching is in App.js */}
      {/* Consider moving these to App.js or adjusting */} 
      {nearbyLoading && ( // Still show loading if App.js is fetching nearby
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      )}
      
      {nearbyError && ( // Still show error if App.js had an error fetching nearby
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{nearbyError}</p>
        </div>
      )}
      
      {/* Only show map if showMap is true AND we have a search location AND valid products with coordinates */}
      {!nearbyLoading && searchLocation && showMap && validProducts.length > 0 && (
        <div className="product-map-container">
          <div className="map-legend">
            <div className="legend-item">
              <div className="legend-icon user-location"></div>
              <span>Search Location</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon product-location"></div>
              <span>Products</span>
            </div>
            <div className="legend-item">
              <div className="legend-icon search-radius"></div>
              <span>Search Radius ({searchRadius} km)</span>
            </div>
          </div>
          
          {/* MapContainer uses searchLocation from local state for center */}
          {/* And validProducts (filtered from App.js) for markers */}
          <MapContainer 
            key={mapKey}
            center={[searchLocation.latitude, searchLocation.longitude]} 
            zoom={mapZoom} 
            style={{ height: '500px', width: '100%', borderRadius: '8px', marginBottom: '20px' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <ZoomControl position="bottomright" />
            
            {/* Search location marker */}
            {searchLocation && (
              <Marker 
                position={[searchLocation.latitude, searchLocation.longitude]}
                icon={SearchLocationIcon}
              >
                <Popup>
                  <div className="map-popup user-popup">
                    <h3>Search Location</h3>
                    <p>{searchLocation.label}</p>
                    <p>Products within {searchRadius} km are shown</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Search radius circle */}
            {searchLocation && searchRadius > 0 && (
              <Circle 
                center={[searchLocation.latitude, searchLocation.longitude]}
                radius={searchRadius * 1000} // Radius in meters
                pathOptions={{
                  fillColor: '#4CAF50',
                  fillOpacity: 0.1,
                  color: '#4CAF50',
                  weight: 1
                }}
              />
            )}
            
            {/* Product markers */}
            {validProducts.length > 0 && (
              <ProductMarkers 
                products={validProducts} // Use validProducts from filtered list
                handleProductClick={handleProductClick}
              />
            )}
            
            {/* Recenter map to search location */}
            {searchLocation && (
              <RecenterMap position={[searchLocation.latitude, searchLocation.longitude]} />
            )}
            
            {/* Fit bounds only if we have valid products to show */}
            {searchLocation && validProducts.length > 0 && (
              <FitBoundsToMarkers 
                searchLocation={searchLocation}
                products={validProducts} // Use validProducts
              />
            )}
          </MapContainer>
          
          <div className="map-stats">
            <div className="stat-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Showing {validProducts.length} products on map</span>
            </div>
            {/* Adjusted message */} 
            {validProducts.length === 0 && (
              <div className="stat-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>No products with location data found matching filters within {searchRadius}km of search location. Try adjusting filters or location.</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Show list view if map is not shown or no search location is set or no valid products with coordinates for map*/}
      {(!showMap || !searchLocation || validProducts.length === 0) && ( // Added validProducts.length === 0 condition
        <div className="product-grid">
          {productsToDisplay.length > 0 ? ( // productsToDisplay is now always the filtered list
            productsToDisplay.map((product) => (
              // Ensure product and product._id exist
              product && product._id ? (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  isSelected={product._id === selectedProduct}
                />
              ) : null
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="no-products-text">
                {searchLocation 
                  ? `No products found matching filters near "${searchLocation.label}"` // Adjusted message
                  : "No products found matching your criteria"}
              </div>
              <div className="no-products-subtext">
                {searchLocation
                  ? "Try adjusting your filters, increasing the search radius or searching for a different location" // Adjusted message
                  : "Try adjusting your filters or searching for a specific location"}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Hand-to-hand payment notice */}
      {/* Removed duplicate payment notice if it exists */} 
       <div className="payment-notice">
        <i className="fas fa-handshake"></i>
        <p>All payments are made hand-to-hand. Bookings must be validated by the renter.</p>
      </div>
    </div>
  )
}

export default ProductList
