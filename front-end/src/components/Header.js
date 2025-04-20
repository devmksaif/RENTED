import React, { useState } from 'react';
import '../styles/Header.css';

function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-text">RENTED</span>
          <span className="logo-dot"></span>
        </div>
        
        <div className="search-bar">
          <div className="search-icon">
            <i className="fas fa-search"></i>
          </div>
          <input 
            type="text" 
            placeholder="Search for items, services, or categories" 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="header-actions">
          <button className="action-button">
            <i className="fas fa-plus"></i>
            <span>List Item</span>
          </button>
          
          <div className="header-icons">
            <div className="notification-icon">
              <i className="fas fa-bell"></i>
              <span className="notification-badge">2</span>
            </div>
            <div className="profile-icon">
              <i className="fas fa-user-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;