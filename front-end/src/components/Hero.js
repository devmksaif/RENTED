import React, { useState } from 'react';
import '../styles/Hero.css';

function Hero({ onSearch }) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Rent Anything You Need</h1>
        <p className="hero-subtitle">Access thousands of items in your neighborhood</p>
        
        <form className="hero-search" onSubmit={handleSubmit}>
          <div className="search-input-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="What are you looking for?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="hero-search-input"
            />
          </div>
          <button type="submit" className="hero-search-button">Search</button>
        </form>
        
        <div className="hero-tags">
          <span className="hero-tag">Popular:</span>
          <button className="tag-button" onClick={() => onSearch('Camera')}>Cameras</button>
          <button className="tag-button" onClick={() => onSearch('Bike')}>Bikes</button>
          <button className="tag-button" onClick={() => onSearch('Tools')}>Tools</button>
          <button className="tag-button" onClick={() => onSearch('Furniture')}>Furniture</button>
        </div>
      </div>
    </div>
  );
}

export default Hero;