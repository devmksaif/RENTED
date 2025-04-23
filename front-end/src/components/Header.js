import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import '../styles/Header.css';

function Header({ cartItemCount = 0 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [localCartCount, setLocalCartCount] = useState(0);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    
    // Initialize cart count from localStorage
    updateCartCountFromLocalStorage();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCountFromLocalStorage();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  
  // Function to update cart count from localStorage
  const updateCartCountFromLocalStorage = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
      setLocalCartCount(cartData.items.length);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      setLocalCartCount(0);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showProfileDropdown) setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
    if (showNotifications) setShowNotifications(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-link">
          <div className="logo">
            <span className="logo-text">RENTED</span>
            <span className="logo-dot"></span>
          </div>
        </Link>
        
        
        
        <div className="header-actions">
          {isLoggedIn && (user?.accountType === 'renter' || user?.accountType === 'both') && (
            <Link to="/listings/create" className="action-button">
              <i className="fas fa-plus"></i>
              <span>List Item</span>
            </Link>
          )}
          
          <div className="header-icons">
            <div className="notification-icon-wrapper">
              <div 
                className="notification-icon" 
                onClick={toggleNotifications}
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </div>
              {showNotifications && (
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              )}
            </div>
            
            <Link to="/cart" className="cart-icon">
              <i className="fas fa-shopping-cart"></i>
              {(cartItemCount || localCartCount) > 0 && (
                <span className="cart-badge">{cartItemCount || localCartCount}</span>
              )}
            </Link>
            
            <div className="profile-icon-wrapper">
              <div 
                className="profile-icon" 
                onClick={toggleProfileDropdown}
              >
                {isLoggedIn && user?.name ? (
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <i className="fas fa-user-circle"></i>
                )}
              </div>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  {isLoggedIn ? (
                    <>
                      <div className="profile-dropdown-header">
                        <div className="user-avatar large">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <div className="profile-dropdown-menu">
                        <Link to="/profile" className="dropdown-item">
                          <i className="fas fa-user"></i>
                          <span>My Profile</span>
                        </Link>
                        <Link to="/bookings" className="dropdown-item">
                          <i className="fas fa-calendar-check"></i>
                          <span>My Bookings</span>
                        </Link>
                        <Link to="/listings" className="dropdown-item">
                          <i className="fas fa-list"></i>
                          <span>My Listings</span>
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" className="dropdown-item">
                            <i className="fas fa-tachometer-alt"></i>
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="fas fa-sign-out-alt"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="profile-dropdown-menu">
                      <Link to="/login" className="dropdown-item">
                        <i className="fas fa-sign-in-alt"></i>
                        <span>Login</span>
                      </Link>
                      <Link to="/register" className="dropdown-item">
                        <i className="fas fa-user-plus"></i>
                        <span>Register</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;