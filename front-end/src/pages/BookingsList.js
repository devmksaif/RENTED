import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings, getOwnerBookings } from '../services/api';
import '../styles/BookingsList.css';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'owner'

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let data;
      if (activeTab === 'user') {
        data = await getUserBookings();
      } else {
        data = await getOwnerBookings();
      }
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeTab]); // Added activeTab to dependency array

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Completed':
        return 'status-completed';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <div className="bookings-tabs">
          <button 
            className={`tab-button ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            Items I've Rented
          </button>
          <button 
            className={`tab-button ${activeTab === 'owner' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner')}
          >
            My Items Rented Out
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={fetchBookings}>
            Try Again
          </button>
        </div>
      )}
      
      {!error && bookings.length === 0 ? (
        <div className="no-bookings">
          <div className="no-bookings-icon">
            <i className="fas fa-calendar-times"></i>
          </div>
          <h3>No bookings found</h3>
          <p>
            {activeTab === 'user' 
              ? "You haven't rented any items yet." 
              : "None of your items have been rented yet."}
          </p>
          {activeTab === 'user' && (
            <Link to="/" className="browse-button">
              Browse Items to Rent
            </Link>
          )}
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-image">
                <img 
                  src={booking.product.image || 'https://via.placeholder.com/150'} 
                  alt={booking.product.title} 
                />
              </div>
              <div className="booking-details">
                <h3>{booking.product.title}</h3>
                <div className="booking-meta">
                  <div className="booking-dates">
                    <i className="fas fa-calendar"></i>
                    <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                  </div>
                  <div className="booking-price">
                    <i className="fas fa-dollar-sign"></i>
                    <span>${booking.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="booking-status-row">
                  <div className={`booking-status ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </div>
                  <div className="booking-payment-status">
                    Payment: {booking.paymentStatus}
                  </div>
                </div>
                {activeTab === 'owner' && booking.user && (
                  <div className="booking-user">
                    <i className="fas fa-user"></i>
                    <span>Rented by: {booking.user.name}</span>
                  </div>
                )}
                <div className="booking-actions">
                  <Link to={`/product/${booking.product._id}`} className="view-product-btn">
                    View Product
                  </Link>
                  <Link to={`/bookings/${booking._id}`} className="view-details-btn">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsList;