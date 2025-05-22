import React, { useState, useEffect, useRef } from 'react';
import ProductCard from "./ProductCard"
import "../styles/ProductList.css"
import { getNearbyProducts } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Removed PropTypes import as it's commented out
// import PropTypes from 'prop-types';

// Import the Filters component
import Filters from './Filters';

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

// Added filter related props and isLoading prop, including filterLocation
function ProductList({ products, onAddToCart, filters, onFilterChange, onResetFilters, userLocation, onLocationSelect, maxPrice, categories, isLoading, filterLocation, onApplyFilters }) {
  console.log('ProductList received products:', products);
  // Removed local state for map center/marker - now using filterLocation prop
  // const [searchLocation, setSearchLocation] = useState(null);
  // Removed redundant nearbyProducts, nearbyLoading, nearbyError states
  // const [nearbyProducts, setNearbyProducts] = useState([]);
  // const [nearbyLoading, setNearbyLoading] = useState(false);
  // const [nearbyError, setNearbyError] = useState(null);
  // Local state for search radius (for map circle) - derived from filters prop
  const [searchRadius, setSearchRadius] = useState(filters.radius || 10); 
  // Local state for map visibility
  const [showMap, setShowMap] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mapKey, setMapKey] = useState(Date.now()); // Key for forcing re-render of map
  const [mapZoom, setMapZoom] = useState(13);
  // Local state for location search input text - derived from filters.location prop
  const [locationSearchQuery, setLocationSearchQuery] = useState(filters.location || '');
  
  // State for filter modal visibility - moved from App.js
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Handle product click on map
  const handleProductClick = (productId) => {
    setSelectedProduct(productId); // Keep for highlighting maybe
  };
  
  // Handle location search input change (updates local state only)
  const handleLocationInputChange = (e) => {
    setLocationSearchQuery(e.target.value);
  };

  // Handle location search form submit (triggers filter change in App.js via prop)
  const handleLocationSearchSubmit = (e) => {
     e.preventDefault();
     const newLocation = locationSearchQuery.trim();
     // Call onFilterChange prop from App.js to update the main filters state
     // This will include the location query in the filters object
     if (onFilterChange) {
        onFilterChange({ ...filters, location: newLocation });
     }
     // Note: onLocationSelect is still called in App.js's onFilterChange when the location filter changes,
     // which updates the map's center based on the geocoded location.
  };

  // Handle applying filters from the modal
  const handleApplyFilters = (newFilters) => {
    // Call the onFilterChange prop from App.js with the new filters
    // This includes all filters (category, priceRange, location text, availability, rating, radius)
    onFilterChange(newFilters);
    // Close the modal
    setShowFilterModal(false);
  };

  // Handle canceling the modal
  const handleCancelFilters = () => {
    // Simply close the modal without applying changes
    setShowFilterModal(false);
  };
  
  // Determine which products to display - ALWAYS use the products prop from App.js
  const productsToDisplay = products; // Use the filtered products from App.js
  
  // Check if we have products with valid coordinates for map
  // Use products (filtered list) for map markers now
  const validProducts = productsToDisplay.filter(p => p && p.latitude !== undefined && p.longitude !== undefined);

  return (
    <div className="product-list-container">
      {/* Product List Header with Search and Filter Button */}
      <div className="product-list-header">
        {/* New div to group search input and filter button */}
        <div className="search-filter-group">
           {/* Location Search Form */}
           {/* Use local state for input value, trigger filter change in App.js on submit/blur */}
           <form onSubmit={handleLocationSearchSubmit} className="location-search-form">
            <div className="location-input-group">
              <input
                type="text"
                placeholder="Search by location..."
                value={locationSearchQuery} // Use local state for input display
                onChange={handleLocationInputChange}
                onBlur={handleLocationSearchSubmit} // Optional: apply filter on blur
                className="location-search-input"
              />
              {/* Icon inside input group if needed - Add in CSS */}
               <button type="submit" className="location-search-btn">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </form>

          {/* Filter button for modal */}
          <button className="show-filters-btn" onClick={() => setShowFilterModal(true)}>
            <i className="fas fa-filter"></i> Show Filters
          </button>
        </div>

        {/* Display the filter location label from App.js state */}
        {/* Using filterLocation prop which is the selected location object */} 
        {filterLocation && filterLocation.label && ( 
          <div className="location-info">
            <i className="fas fa-map-marker-alt"></i>
            <span>
              Showing products near: {filterLocation.label}
            </span>
          </div>
        )}
      </div>
      
      {/* Filters Modal - moved from App.js */}
      {showFilterModal && (
        <div className="filter-modal-overlay">
          <div className="filter-modal-content">
            <Filters 
              // Pass down filter state and handlers from App.js
              filters={filters}
              onFilterChange={onFilterChange} // Pass App's filter change handler
              onResetFilters={onResetFilters} // Pass App's reset handler
              userLocation={userLocation} // Pass user location prop
              onLocationSelect={onLocationSelect} // Pass App's location select handler
              maxPrice={maxPrice} // Pass max price prop
              categories={categories} // Pass categories prop
              // Modal specific props
              isVisible={showFilterModal}
              onClose={handleCancelFilters} // Use local cancel handler
              onApplyFilters={onApplyFilters} // Use the prop from App.js
            />
          </div>
        </div>
      )}
      
      {/* Nearby loading/error messages might be less relevant here now if fetching is in App.js */}
      {/* Using isLoading prop from App.js */}
      {isLoading && products.length === 0 && !filterLocation && (
        <div className="loading-message">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      )}
      
      {/* Error message (might be redundant if App.js handles it) */}
      {/* {nearbyError && ( 
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{nearbyError}</p>
        </div>
      )} */}
      
      {/* Toggle map view button (optional, depending on desired UI) */}
      {/* If you want a button inside ProductList to toggle the map view */}
      {/* You can add it here and manage showMap state locally */}
      {/* For now, relying on filterLocation and validProducts.length to decide if map is shown */}
      
      {/* Only show map if filterLocation is set and has valid coordinates AND not loading AND there are valid products to show on map */}
      {!isLoading && filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && validProducts.length > 0 && (
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
          
          {/* MapContainer uses filterLocation for center */} 
          <MapContainer 
            key={mapKey}
            center={[filterLocation.latitude, filterLocation.longitude]} 
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
            {filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && ( // Use filterLocation for marker
              <Marker 
                position={[filterLocation.latitude, filterLocation.longitude]}
                icon={SearchLocationIcon}
              >
                <Popup>
                  <div className="map-popup user-popup">
                    <h3>Search Location</h3>
                    <p>{filterLocation.label}</p>
                    <p>Products within {searchRadius} km are shown</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Search radius circle */}
            {filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && searchRadius > 0 && ( // Use filterLocation and searchRadius
              <Circle 
                center={[filterLocation.latitude, filterLocation.longitude]}
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
            {validProducts.length > 0 && ( // Use validProducts
              <ProductMarkers 
                products={validProducts} // Use validProducts from filtered list
                handleProductClick={handleProductClick}
              />
            )}
            
            {/* Recenter map to search location */}
            {filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && ( // Recenter based on filterLocation
              <RecenterMap position={[filterLocation.latitude, filterLocation.longitude]} />
            )}
            
            {/* Fit bounds only if we have valid products to show and filterLocation is set */}
            {!isLoading && filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && validProducts.length > 0 && ( // Fit bounds based on filterLocation and validProducts
              <FitBoundsToMarkers 
                searchLocation={filterLocation} // Use filterLocation prop for bounds calculation
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
            {validProducts.length === 0 && filterLocation && ( // Adjusted condition
              <div className="stat-item warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>No products with location data found matching filters within {searchRadius}km of {filterLocation.label}. Try adjusting filters or location.</span>{/* Adjusted message and label */} 
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Show list view if map is not shown or no search location is set or no valid products with coordinates for map or loading*/}
      {/* Changed condition to rely on isLoading, filterLocation, and validProducts.length */}
      {(!isLoading && productsToDisplay.length > 0 && (!filterLocation || validProducts.length === 0)) && (
        <div className="product-grid">
          {/* productsToDisplay is now always the filtered list */}
          {productsToDisplay.map((product) => (
            // Ensure product and product._id exist
            product && product._id ? (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={onAddToCart} 
                isSelected={product._id === selectedProduct}
              />
            ) : null
          ))}
        </div>
      )}
      
      {/* Show no products message if not loading and no products to display */}
       {!isLoading && productsToDisplay.length === 0 && (
         <div className="no-products">
           <div className="no-products-icon">
             <i className="fas fa-search"></i>
           </div>
           <div className="no-products-text">
             {filterLocation  // Adjusted message
               ? `No products found matching filters near "${filterLocation.label}"` 
               : (products.length > 0 ? "No products match your filters" : "No products found")}
           </div>
           <div className="no-products-subtext">
             {filterLocation // Adjusted message
               ? "Try adjusting your filters, increasing the search radius or searching for a different location"
               : (products.length > 0 ? "Try adjusting your filters" : "Please check your backend connection or try again later")}
           </div>
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

// Add PropTypes if needed
// ProductList.propTypes = {
//   products: PropTypes.array.isRequired,
//   onAddToCart: PropTypes.func.isRequired,
//   filterLocation: PropTypes.object,
//   filterRadius: PropTypes.number,
//   isLoading: PropTypes.bool // Assuming isLoading prop is passed now
// };

export default ProductList
