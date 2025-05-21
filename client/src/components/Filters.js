import React, { useState, useEffect } from 'react';
import '../styles/Filters.css';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Add PropTypes for type checking if needed (optional)
// import PropTypes from 'prop-types';

function Filters({ filters, onFilterChange, onResetFilters, onLocationSelect, maxPrice, categories }) {
  // Updated: Use categories prop instead of hardcoded list. Add 'All' manually for the filter.
  const filterCategories = ['All', ...categories];
  const [locationInput, setLocationInput] = useState(filters.location || '');
  
  // State for price range using MUI Slider format [min, max]
  // Use the passed down maxPrice prop as the initial max if available
  const [priceRange, setPriceRange] = useState(Array.isArray(filters.priceRange) ? filters.priceRange : [0, maxPrice || 500]);

  // Max possible price for the slider (now comes from props or uses a default)
  const MAX_PRICE = maxPrice || 500; // Use the prop or a default

  // Effect to sync internal state if filters prop changes externally, including maxPrice
  // Updated: Also syncs category filter if it changes externally
  useEffect(() => {
    setPriceRange(Array.isArray(filters.priceRange) ? filters.priceRange : [0, maxPrice || 500]);
    // Ensure filters.category is an array for internal state consistency
    // If filters.category is a single string (from initial state or external update), convert it to an array.
    // If it's 'All' or '', use an empty array.
    const initialCategories = Array.isArray(filters.category)
      ? filters.category
      : (filters.category === '' || filters.category === 'All' ? [] : [filters.category]);
      
    // The category state is managed directly by the parent component (App.js) now.
    // The internal state is only for priceRange and locationInput.
    // The category buttons will directly call onFilterChange.

  }, [filters.priceRange, maxPrice, filters.category]); // Add filters.category to dependencies

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

  // Handle price range slider change (removed slider, but keeping handler for consistency if needed)
  const handleSliderChange = (event, newValue) => {
    // setPriceRange(newValue);
  };

  // Handle price range slider change committed (when user stops dragging - removed slider)
  const handleSliderChangeCommitted = (event, newValue) => {
    // onFilterChange('priceRange', newValue);
  };

  // Handle min price input change
  const handleMinInputChange = (event) => {
    const value = Number(event.target.value);
    // Use MAX_PRICE (which is now dynamic) for the upper bound check
    const newMin = Math.max(0, Math.min(value, priceRange[1])); // Ensure min is not less than 0 or greater than max
    setPriceRange([newMin, priceRange[1]]);
  };

  // Handle max price input change
  const handleMaxInputChange = (event) => {
    const value = Number(event.target.value);
    // Use MAX_PRICE (which is now dynamic) for the upper bound check
    const newMax = Math.max(priceRange[0], Math.min(value, MAX_PRICE)); // Ensure max is not less than min or greater than MAX_PRICE
    setPriceRange([priceRange[0], newMax]);
  };

   // Handle blur event on inputs to apply filter when user tabs out
   const handleInputBlur = () => {
    onFilterChange('priceRange', priceRange);
  };

  // New: Handle multiple category selection
  const handleCategoryClick = (category) => {
    if (category === 'All') {
      // If 'All' is clicked, clear all other category selections
      onFilterChange('category', []);
    } else {
      // Ensure filters.category is always treated as an array
      const currentCategories = Array.isArray(filters.category) ? filters.category : [];
      
      // Check if the category is already selected
      const isSelected = currentCategories.includes(category);
      
      let newCategories;
      if (isSelected) {
        // If selected, remove it
        newCategories = currentCategories.filter(cat => cat !== category);
      } else {
        // If not selected, add it. Also remove 'All' if it was selected.
        newCategories = [...currentCategories.filter(cat => cat !== 'All'), category];
      }
      
      onFilterChange('category', newCategories);
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
          {/* Use filterCategories array for mapping */}
          {filterCategories.map(category => (
            <button 
              key={category}
              // Updated class logic: 'active' if category is 'All' and no other categories are selected, OR if the category is in the filters.category array
              className={`category-btn ${
                category === 'All' 
                ? (Array.isArray(filters.category) && filters.category.length === 0 ? 'active' : '')
                : (Array.isArray(filters.category) && filters.category.includes(category) ? 'active' : '')
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="filter-section">
        <h4>Price Range</h4>
        <Box sx={{ width: 'auto', padding: '0 10px' }}>
          
          
           <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                label="Min"
                type="number"
                value={priceRange[0]}
                onChange={handleMinInputChange}
                onBlur={handleInputBlur}
                size="small"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                  inputProps: { min: 0, max: priceRange[1] }, // Use dynamic MAX_PRICE
                }}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item>
              <Typography>-</Typography>
            </Grid>
            <Grid item xs>
               <TextField
                label="Max"
                type="number"
                value={priceRange[1]}
                onChange={handleMaxInputChange}
                onBlur={handleInputBlur}
                size="small"
                 InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                   inputProps: { min: priceRange[0], max: MAX_PRICE }, // Use dynamic MAX_PRICE
                }}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
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
          {filters.rating && (filters.rating !== '' && parseInt(filters.rating) > 0) && (
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

// Add PropTypes for type checking (optional)
// Filters.propTypes = {
//   filters: PropTypes.object.isRequired,
//   onFilterChange: PropTypes.func.isRequired,
//   onResetFilters: PropTypes.func.isRequired,
//   onLocationSelect: PropTypes.func.isRequired,
//   maxPrice: PropTypes.number,
// };

export default Filters;