import React, { useState } from 'react';
import '../styles/Hero.css';

function Hero({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    if (!searchQuery) {
      setIsExpanded(false);
    }
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Rent Anything You Need</h1>
        <p className="hero-subtitle">Access thousands of items in your neighborhood</p>
        
        <form className={`hero-search ${isExpanded ? 'expanded' : ''}`} onSubmit={handleSubmit}>
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="hero-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
          <button type="submit" className="hero-search-button">
            <span className="search-button-text">Search</span>
            <i className="fas fa-arrow-right search-button-icon"></i>
          </button>
        </form>
        
        <div className="hero-tags">
          <span className="hero-tag">Popular:</span>
          <button className="tag-button" onClick={() => onSearch('Camera')}>
            <i className="fas fa-camera"></i> Cameras
          </button>
          <button className="tag-button" onClick={() => onSearch('Bike')}>
            <i className="fas fa-bicycle"></i> Bikes
          </button>
          <button className="tag-button" onClick={() => onSearch('Tools')}>
            <i className="fas fa-tools"></i> Tools
          </button>
          <button className="tag-button" onClick={() => onSearch('Furniture')}>
            <i className="fas fa-couch"></i> Furniture
          </button>
        </div>
      </div>
    </div>
  );
}

export default Hero;