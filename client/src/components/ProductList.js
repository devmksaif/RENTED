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
  
  // Update when filter location changes
  useEffect(() => {
    if (filterLocation && filterLocation.latitude && filterLocation.longitude) {
      setSearchLocation({
        latitude: filterLocation.latitude,
        longitude: filterLocation.longitude,
        label: filterLocation.label || 'Search location'
      });
      
      // Clear any previous search query to avoid confusion
      setLocationSearchQuery('');
    }
    
    // Update radius if provided from filter
    if (filterRadius) {
      setSearchRadius(Number(filterRadius));
    }
  }, [filterLocation, filterRadius]);
  
  // Fetch nearby products when location or search radius changes
  useEffect(() => {
    const fetchNearbyProducts = async () => {
      if (!searchLocation) return;
      
      setNearbyLoading(true);
      try {
        const data = await getNearbyProducts(
          searchLocation.latitude,
          searchLocation.longitude,
          searchRadius
        );
        setNearbyProducts(data);
        setNearbyError(null);
      } catch (error) {
        console.error('Error fetching nearby products:', error);
        setNearbyError('Failed to load nearby products.');
      } finally {
        setNearbyLoading(false);
      }
    };
    
    if (searchLocation) {
      fetchNearbyProducts();
    }
  }, [searchLocation, searchRadius]);
  
  // Handle radius change
  const handleRadiusChange = (e) => {
    setSearchRadius(Number(e.target.value));
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
    setSelectedProduct(productId);
  };
  
  // Handle location search
  const handleLocationSearch = (e) => {
    e.preventDefault();
    
    if (!locationSearchQuery.trim()) return;
   
    // In a real app, you would call a geocoding service here
    // For now, simulate a search with default coordinates
    setTimeout(() => {
      // This would be the result from geocoding service
      const searchResult = {
        label: locationSearchQuery,
        latitude: DEFAULT_COORDINATES.latitude,
        longitude: DEFAULT_COORDINATES.longitude
      };
      
      setSearchLocation(searchResult);
      
    }, 1000);
  };
  
  // Determine which products to display
  const productsToDisplay = searchLocation ? nearbyProducts : products;
  
  // Check if we have products with valid coordinates for map
  const validProducts = productsToDisplay.filter(p => p && p.location.includes(locationSearchQuery));

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <div className="location-search-container">
          <form onSubmit={handleLocationSearch} className="location-search-form">
            <div className="location-input-group">
              <input
                type="text"
                placeholder="Search by location..."
                value={locationSearchQuery}
                onChange={(e) => setLocationSearchQuery(e.target.value)}
                className="location-search-input"
              />
              <button type="submit" className="location-search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
            <div className="radius-control">
              <input
                type="range"
                min="1"
                max="50"
                value={searchRadius}
                onChange={handleRadiusChange}
                className="radius-slider"
                
              />
              <span className="radius-value">{searchRadius} km</span>
            </div>
          </form>
          
          <button 
            className={`map-toggle-btn ${showMap ? 'active' : ''}`}
            onClick={toggleMapView}
            disabled={!searchLocation}
          >
            <i className={`fas fa-${showMap ? 'list' : 'map-marker-alt'}`}></i>
            {showMap ? 'List View' : 'Map View'}
          </button>
        </div>
        
        {searchLocation && (
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i>
            <span>
              Showing products near: {searchLocation.label}
            </span>
          </div>
        )}
      </div>
      
      {nearbyLoading && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Finding products near {locationSearchQuery || searchLocation?.label || 'selected location'}...</p>
        </div>
      )}
      
      {nearbyError && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{nearbyError}</p>
        </div>
      )}
      
      {!nearbyLoading && searchLocation && showMap && (
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
            <Marker 
              position={[searchLocation.latitude, searchLocation.longitude]}
              icon={SearchLocationIcon}
            >
              <Popup>
                <div className="map-popup user-popup">
                  <h3>Search Location</h3>
                  <p>{searchLocation.label}</p>
                  <p>Products within {searchRadius} km will show here</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Search radius circle */}
            <Circle 
              center={[searchLocation.latitude, searchLocation.longitude]}
              radius={searchRadius * 1000}
              pathOptions={{
                fillColor: '#4CAF50',
                fillOpacity: 0.1,
                color: '#4CAF50',
                weight: 1
              }}
            />
            
            {/* Product markers */}
            {validProducts.length > 0 && (
              <ProductMarkers 
                products={validProducts} 
                handleProductClick={handleProductClick}
              />
            )}
            
            <RecenterMap position={[searchLocation.latitude, searchLocation.longitude]} />
            
            {validProducts.length > 0 && (
              <FitBoundsToMarkers 
                searchLocation={searchLocation}
                products={validProducts}
              />
            )}
          </MapContainer>
          
          <div className="map-stats">
            <div className="stat-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Showing {validProducts.length} products on map</span>
            </div>
            {validProducts.length === 0 && (
              <div className="stat-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>No products found within {searchRadius}km. Try increasing the radius or searching a different location.</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {(!showMap || !searchLocation) && (
        <div className="product-grid">
          {productsToDisplay.length > 0 ? (
            productsToDisplay.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={onAddToCart} 
                isSelected={product._id === selectedProduct}
              />
            ))
          ) : (
            <div className="no-products">
              <div className="no-products-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="no-products-text">
                {searchLocation 
                  ? `No products found near "${searchLocation.label}"`
                  : "No products found matching your criteria"}
              </div>
              <div className="no-products-subtext">
                {searchLocation
                  ? "Try increasing the search radius or search for a different location" 
                  : "Try adjusting your filters or search for a specific location"}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Hand-to-hand payment notice */}
      <div className="payment-notice">
        <i className="fas fa-handshake"></i>
        <p>All payments are made hand-to-hand. Bookings must be validated by the renter.</p>
      </div>
    </div>
  )
}

export default ProductList
