import React, { useState, useEffect } from 'react';
import '../styles/Filters.css';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function Filters({ filters, onFilterChange, onResetFilters, onLocationSelect }) {
  const categories = ['All', 'Electronics', 'Furniture', 'Tools', 'Vehicles', 'Clothing', 'Sports'];
  const [locationInput, setLocationInput] = useState(filters.location || '');
  
  // State for price range using MUI Slider format [min, max]
  const [priceRange, setPriceRange] = useState(Array.isArray(filters.priceRange) ? filters.priceRange : [0, 500]);

  // Max possible price for the slider (can be adjusted)
  const MAX_PRICE = 1000; // Increased max price slightly

  // Effect to sync internal state if filters prop changes externally
  useEffect(() => {
    setPriceRange(Array.isArray(filters.priceRange) ? filters.priceRange : [0, 500]);
  }, [filters.priceRange]);

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

  // Handle price range slider change
  const handleSliderChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Handle price range slider change committed (when user stops dragging)
  const handleSliderChangeCommitted = (event, newValue) => {
    onFilterChange('priceRange', newValue);
  };

  // Handle min price input change
  const handleMinInputChange = (event) => {
    const value = Number(event.target.value);
    const newMin = Math.max(0, Math.min(value, priceRange[1])); // Ensure min is not less than 0 or greater than max
    setPriceRange([newMin, priceRange[1]]);
  };

  // Handle max price input change
  const handleMaxInputChange = (event) => {
    const value = Number(event.target.value);
    const newMax = Math.max(priceRange[0], Math.min(value, MAX_PRICE)); // Ensure max is not less than min or greater than MAX_PRICE
    setPriceRange([priceRange[0], newMax]);
  };

   // Handle blur event on inputs to apply filter when user tabs out
   const handleInputBlur = () => {
    onFilterChange('priceRange', priceRange);
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
        <h4>Price Range</h4>
        <Box sx={{ width: 'auto', padding: '0 10px' }}>
          <Slider
            value={priceRange}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            valueLabelDisplay="auto"
            min={0}
            max={MAX_PRICE}
            step={10}
            disableSwap
          />
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
                  inputProps: { min: 0, max: priceRange[1] },
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
                   inputProps: { min: priceRange[0], max: MAX_PRICE },
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