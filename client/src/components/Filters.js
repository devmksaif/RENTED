import React, { useState, useEffect } from 'react';
import '../styles/Filters.css';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Add PropTypes for type checking if needed (optional)
// import PropTypes from 'prop-types';

// Added isVisible, onClose, and onApplyFilters props
function Filters({ filters, onResetFilters, maxPrice, categories, isVisible, onClose, onApplyFilters }) {
  // Use local state to manage filters within the modal
  const [localFilters, setLocalFilters] = useState(() => {
    // Initialize local state with default values, ensuring location and radius are present
    const initialFilters = filters || {};
    return {
      category: initialFilters.category || [],
      priceRange: Array.isArray(initialFilters.priceRange) ? initialFilters.priceRange : [0, maxPrice || 500],
      location: initialFilters.location || '', // Ensure location is present
      availability: initialFilters.availability || '',
      rating: initialFilters.rating || '',
      radius: initialFilters.radius || 10, // Ensure radius is present with a default
      // Add other filter types here if they exist
    };
  });
  
  // Sync local state with prop filters when modal opens or filters prop changes
  useEffect(() => {
    setLocalFilters(prevLocalFilters => ({
      // Merge existing local state with incoming prop filters
      // This preserves any changes made in the modal before closing/reopening,
      // while also syncing with external filter changes from App.js
      ...prevLocalFilters,
      ...filters,
       // Ensure priceRange is handled correctly if filters prop updates it
      priceRange: Array.isArray(filters.priceRange) ? filters.priceRange : prevLocalFilters.priceRange,
       // Ensure location and radius are not overwritten by undefined if filters prop omits them (shouldn't happen if App.js passes full object)
       location: filters.location !== undefined ? filters.location : prevLocalFilters.location,
       radius: filters.radius !== undefined ? Number(filters.radius) : prevLocalFilters.radius
    }));
  }, [filters, isVisible]); // Sync when filters prop changes or modal visibility changes

  // Updated: Use categories prop instead of hardcoded list. Add 'All' manually for the filter.
  const filterCategories = ['All', ...categories];
  
  // Local state for price range using MUI Slider format [min, max]
  // Use the passed down maxPrice prop as the initial max if available
  // This state is now derived from and synced with localFilters.priceRange
  const [priceRange, setPriceRange] = useState(localFilters.priceRange);

  // Max possible price for the slider (now comes from props or uses a default)
  const MAX_PRICE = maxPrice || 500; // Use the prop or a default

  // Effect to sync internal priceRange state with localFilters.priceRange
  useEffect(() => {
    setPriceRange(Array.isArray(localFilters.priceRange) ? localFilters.priceRange : [0, MAX_PRICE]);
  }, [localFilters.priceRange, MAX_PRICE]);

  // Removed Default coordinates for New York City
  // const DEFAULT_COORDS = { ... };

  // Removed local state for location input text, now using localFilters.location directly if needed for display
  // const [locationInput, setLocationInput] = useState(localFilters.location || '');

  // Removed Effect to sync location input state
  // useEffect(() => { ... }, [localFilters.location]);

  // Removed Handle local location search
  // const handleLocationSearch = (e) => { ... }

  // Handle price range slider change (removed slider, but keeping handler for consistency if needed)
  const handleSliderChange = (event, newValue) => {
    // setPriceRange(newValue); // Update local priceRange state
  };

  // Handle price range slider change committed (when user stops dragging - removed slider)
  const handleSliderChangeCommitted = (event, newValue) => {
    // Update localFilters.priceRange when slider dragging stops
    // setLocalFilters(prevFilters => ({ ...prevFilters, priceRange: newValue }));
  };

  // Handle min price input change (updates local priceRange state and syncs to localFilters)
  const handleMinInputChange = (event) => {
    const value = Number(event.target.value);
    const newMin = Math.max(0, Math.min(value, priceRange[1]));
    setPriceRange([newMin, priceRange[1]]);
     // Sync with localFilters immediately
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      priceRange: [newMin, priceRange[1]]
    }));
  };

  // Handle max price input change (updates local priceRange state and syncs to localFilters)
  const handleMaxInputChange = (event) => {
    const value = Number(event.target.value);
    const newMax = Math.max(priceRange[0], Math.min(value, MAX_PRICE));
    setPriceRange([priceRange[0], newMax]);
     // Sync with localFilters immediately
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      priceRange: [priceRange[0], newMax]
    }));
  };

   // Handle blur event on inputs to update localFilters priceRange when user tabs out - Removed as sync is now immediate
  //  const handleInputBlur = () => { ... };

  // Handle multiple category selection (updates localFilters.category)
  const handleCategoryClick = (category) => {
    if (category === 'All') {
      // If 'All' is clicked, clear all other category selections in local state
      setLocalFilters(prevFilters => ({
        ...prevFilters,
        category: []
      }));
    } else {
      // Ensure localFilters.category is always treated as an array
      const currentCategories = Array.isArray(localFilters.category) ? localFilters.category : [];
      
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
      
      setLocalFilters(prevFilters => ({
        ...prevFilters,
        category: newCategories
      }));
    }
  };
  
  // Handle Availability change (updates localFilters.availability)
  const handleAvailabilityChange = (e) => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      availability: e.target.value
    }));
  };

  // Handle Minimum Rating change (updates localFilters.rating)
  const handleRatingChange = (star) => {
    setLocalFilters(prevFilters => ({
      ...prevFilters,
      rating: star.toString()
    }));
  };

  // Removed Handle Radius change
  // const handleRadiusChange = (e) => { ... };
  
  // Function to handle applying filters
  const handleApplyClick = () => {
    // Pass the local filters state back to the parent (App.js)
    // Ensure we pass the full localFilters object, including location and radius even if UI is removed
    onApplyFilters(localFilters);
  };

  // Function to handle canceling
  const handleCancelClick = () => {
    // Simply close the modal without applying changes
    onClose();
     // Optionally, reset local state to the filters prop on cancel
     // setLocalFilters(filters);
  };

  // Function to handle resetting filters (resets local state and calls parent reset)
  const handleResetClick = () => {
    // Call the parent's reset handler
    onResetFilters();
     // The useEffect will then sync the local state when the filters prop updates
  };

  
  // Render nothing if not visible
  if (!isVisible) {
    return null;
  }

  return (
    // The modal overlay and content container are now in App.js
    // This component is just the content *inside* the modal
    <div className="filters-modal-content-inner">
      <div className="filters-header">
        <h3>Filters</h3>
        {/* Updated reset button handler */}
        
         {/* Close button for modal */}
         <button className="reset-filters-btn" onClick={handleResetClick}>
          <i className="fas fa-redo-alt"></i> Reset
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="filter-section">
      
        <h4>Category</h4>
        <div className="category-buttons">
          {/* Use filterCategories array for mapping */}
          {filterCategories.map(category => (
            <button 
              key={category}
              // Use localFilters for active class logic
              className={`category-btn ${
                category === 'All' 
                ? (Array.isArray(localFilters.category) && localFilters.category.length === 0 ? 'active' : '')
                : (Array.isArray(localFilters.category) && localFilters.category.includes(category) ? 'active' : '')
              }`}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <Box sx={{ width: 'auto', padding: '0 10px' }}>
           <Grid container spacing={2} alignItems="center">
            <Grid item xs>
              <TextField
                label="Min"
                type="number"
                // Use local priceRange state
                value={priceRange[0]}
                onChange={handleMinInputChange}
                size="small"
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                  // Use local priceRange for input constraints
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
                 // Use local priceRange state
                value={priceRange[1]}
                onChange={handleMaxInputChange}
                size="small"
                 InputProps={{
                  startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
                   // Use local priceRange and MAX_PRICE for input constraints
                   inputProps: { min: priceRange[0], max: MAX_PRICE }, 
                }}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      </div>
      
      {/* Location Filter (Text Input) - Removed */}
       {/* <div className="filter-section">
        <h4>Location</h4>
         <form onSubmit={handleLocationSearch} className="location-filter-form">
            <div className="location-input-group">
              <input
                type="text"
                placeholder="Enter location or address..."
                 // Use local locationInput state
                value={localFilters.location || ''} // Use localFilters state
                onChange={handleLocationInputChange}
                onBlur={handleLocationSearch} // Apply filter on blur too
                className="filter-input"
              />
               {/* Optional: Add a search icon here if desired */}
             {/* </div>
          </form>
      </div> */}
      
      {/* Availability Filter */}
      <div className="filter-section">
        <h4>Availability</h4>
        <div className="availability-options">
          <label className="availability-option">
            <input 
              type="radio" 
              name="availability" 
              value="Available"
              // Use localFilters.availability
              checked={localFilters.availability === 'Available'}
              onChange={handleAvailabilityChange}
            />
            <span>Available</span>
          </label>
          <label className="availability-option">
            <input 
              type="radio" 
              name="availability" 
              value=""
              // Use localFilters.availability
              checked={localFilters.availability === ''}
              onChange={handleAvailabilityChange}
            />
            <span>All</span>
          </label>
        </div>
      </div>
      
      {/* Minimum Rating Filter */}
      <div className="filter-section">
        <h4>Minimum Rating</h4>
        <div className="rating-filter">
          {[1, 2, 3, 4, 5].map(star => (
            <i 
              key={star}
              // Use localFilters.rating
              className={`${parseInt(localFilters.rating) >= star ? 'fas' : 'far'} fa-star`}
              onClick={() => handleRatingChange(star)}
            ></i>
          ))}
          {/* Use localFilters.rating */}
          {localFilters.rating && (localFilters.rating !== '' && parseInt(localFilters.rating) > 0) && (
            <button 
              className="clear-rating" 
              onClick={() => handleRatingChange('')}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* Radius Filter - Removed */}
      {/* <div className="filter-section radius-filter">
        <h4>Search Radius</h4>
        <div className="radius-control">
          <input
            type="range"
            min="1"
            max="100"
            // Use localFilters.radius
            value={localFilters.radius || 10} // Use localFilters state
            onChange={handleRadiusChange}
            className="radius-slider"
          />
          {/* Use localFilters.radius */}
          {/* <span className="radius-value">{localFilters.radius || 10} km</span> // Use localFilters state
        </div>
      </div> */}
      
      {/* Action Buttons */}
      <div className="filter-actions">
        <button className="cancel-btn" onClick={handleCancelClick}>Cancel</button>
        <button className="apply-btn" onClick={handleApplyClick}>Apply Filters</button>
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
//   isVisible: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   onApplyFilters: PropTypes.func.isRequired,
// };

export default Filters;