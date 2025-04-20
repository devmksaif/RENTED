import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="site-header">
      <div className="container">
        <Link to="/" className="logo">
          <span className="logo-text">RENTED</span>
        </Link>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for items, services, or categories" 
            className="search-input"
          />
        </div>
        <div className="header-actions">
          <Link to="/list-item" className="btn btn-primary">List Item</Link>
          <div className="user-menu">
            <Link to="/profile" className="profile-icon">
              <img src="/profile-placeholder.png" alt="Profile" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;