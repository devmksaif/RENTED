import React from 'react';
import '../styles/Filters.css';

function Filters({ filters, onFilterChange, onResetFilters }) {
  const categories = ['All', 'Electronics', 'Furniture', 'Tools', 'Vehicles', 'Clothing', 'Sports'];
  
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
        <div className="location-input-wrapper">
          <i className="fas fa-map-marker-alt"></i>
          <input 
            type="text" 
            placeholder="Enter location" 
            value={filters.location} 
            onChange={(e) => onFilterChange('location', e.target.value)}
            className="filter-input"
          />
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