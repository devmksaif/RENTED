import React, { useState } from 'react';
import '../styles/Filters.css';

function Filters({ filters, onFilterChange, onResetFilters, onLocationSelect }) {
  const categories = ['All', 'Electronics', 'Furniture', 'Tools', 'Vehicles', 'Clothing', 'Sports'];
  const [locationInput, setLocationInput] = useState(filters.location || '');
  
  // Default coordinates for New York City
  const DEFAULT_COORDS = {
    latitude: 40.7128,
    longitude: -74.0060
  };
  
  // Handle location input change
  const handleLocationInputChange = (e) => {
    setLocationInput(e.target.value);
  };
  
  // Handle location search
  const handleLocationSearch = (e) => {
    e.preventDefault();
    onFilterChange('location', locationInput);
    
    // Clear location coordinates if text field is emptied
    if (!locationInput.trim()) {
      onLocationSelect && onLocationSelect(null);
    } else {
      // This would typically call a geocoding service to get coordinates for the location
      // For demo purposes, we're just passing default coordinates with the entered label
      onLocationSelect && onLocationSelect({
        label: locationInput,
        // In a real app, these would come from geocoding the input address
        latitude: DEFAULT_COORDS.latitude,
        longitude: DEFAULT_COORDS.longitude
      });
    }
  };
  
  return (
    <div className="filters-container">
      <div className="filters-header">
        <h3>Filters</h3>
        <button className="reset-filters-btn" onClick={onResetFilters}>
          <i className="fas fa-redo-alt"></i> Reset
        </button>
      </div>
      
      <div className="filter-section">
        <h4>Category</h4>
        <div className="category-buttons">
          {categories.map(category => (
            <button 
              key={category}
              className={`category-btn ${filters.category === category ? 'active' : ''}`}
              onClick={() => onFilterChange('category', category === 'All' ? '' : category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Price Range: <span className="price-value">${filters.priceRange}</span></h4>
        <input 
          type="range" 
          min="0" 
          max="500" 
          step="10"
          value={filters.priceRange} 
          onChange={(e) => onFilterChange('priceRange', e.target.value)}
          className="filter-range"
        />
        <div className="range-labels">
          <span>$0</span>
          <span>$500</span>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Location</h4>
        <form className="location-search-form" onSubmit={handleLocationSearch}>
          <div className="location-input-wrapper">
            <i className="fas fa-map-marker-alt"></i>
            <input 
              type="text" 
              placeholder="Enter city, address or area" 
              value={locationInput} 
              onChange={handleLocationInputChange}
              className="filter-input"
            />
            <button type="submit" className="location-search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </form>
        
        <div className="radius-filter">
          <h5>Search Radius: <span>{filters.radius || 10} km</span></h5>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={filters.radius || 10} 
            onChange={(e) => onFilterChange('radius', e.target.value)}
            className="filter-range"
            disabled={!filters.location}
          />
          <div className="range-labels">
            <span>1km</span>
            <span>50km</span>
          </div>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Availability</h4>
        <div className="availability-options">
          <label className="availability-option">
            <input 
              type="radio" 
              name="availability" 
              value="Available"
              checked={filters.availability === 'Available'}
              onChange={(e) => onFilterChange('availability', e.target.value)}
            />
            <span>Available</span>
          </label>
          <label className="availability-option">
            <input 
              type="radio" 
              name="availability" 
              value=""
              checked={filters.availability === ''}
              onChange={(e) => onFilterChange('availability', e.target.value)}
            />
            <span>All</span>
          </label>
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Minimum Rating</h4>
        <div className="rating-filter">
          {[1, 2, 3, 4, 5].map(star => (
            <i 
              key={star}
              className={`${parseInt(filters.rating) >= star ? 'fas' : 'far'} fa-star`}
              onClick={() => onFilterChange('rating', star.toString())}
            ></i>
          ))}
          {filters.rating && (
            <button 
              className="clear-rating" 
              onClick={() => onFilterChange('rating', '')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Filters;