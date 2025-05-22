import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings, getOwnerBookings, updateBookingStatus } from '../services/api';
import '../styles/BookingsList.css';

function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'owner'
  const [userRole, setUserRole] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.accountType || '');
  }, []);

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

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setIsLoading(true);
      await updateBookingStatus(bookingId, newStatus);
      // Update the booking in state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: newStatus } 
            : booking
        )
      );
      setUpdateSuccess(`Booking successfully ${newStatus.toLowerCase()}`);
      setTimeout(() => setUpdateSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(`Failed to update booking status. ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading && bookings.length === 0) {
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
            disabled={userRole !== 'renter' && userRole !== 'both'}
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
      
      {updateSuccess && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          <p>{updateSuccess}</p>
        </div>
      )}
      
      {activeTab === 'owner' && (userRole !== 'renter' && userRole !== 'both') && (
        <div className="no-bookings">
          <div className="no-bookings-icon">
            <i className="fas fa-user-slash"></i>
          </div>
          <h3>Renter Access Only</h3>
          <p>
            Only renters can view bookings for items they've rented out.
          </p>
        </div>
      )}
      
      {!error && bookings.length === 0 && !(activeTab === 'owner' && (userRole !== 'renter' && userRole !== 'both')) ? (
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
                  src={booking.product?.image || 'https://via.placeholder.com/150'} 
                  alt={booking.product?.title || 'Product Image'} 
                />
              </div>
              <div className="booking-details">
                <h3>{booking.product?.title || 'Product'}</h3>
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
                {/* Display categories as a comma-separated list */}
                {booking.product?.category && (
                  <div className="booking-category">
                    <i className="fas fa-tag"></i>
                    <span>{Array.isArray(booking.product.category) ? booking.product.category.join(', ') : booking.product.category}</span>
                  </div>
                )}
                <div className="booking-status-row">
                  <div className={`booking-status ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </div>
                  <div className="booking-payment-status">
                    Payment: {booking.paymentStatus || 'Hand to Hand'}
                  </div>
                </div>
                {activeTab === 'owner' && booking.user && (
                  <div className="booking-user">
                    <i className="fas fa-user"></i>
                    <span>Rented by: {booking.user.name}</span>
                  </div>
                )}
                
                {/* Action buttons for renters to validate bookings */}
                {activeTab === 'owner' && booking.status === 'Pending' && (
                  <div className="validation-controls">
                    <h4>Booking Validation</h4>
                    <p>As the renter, you need to validate this booking before the rentee can collect the item.</p>
                    <div className="validation-buttons">
                      <button 
                        className="confirm-button"
                        onClick={() => handleUpdateStatus(booking._id, 'Confirmed')}
                        disabled={isLoading}
                      >
                        <i className="fas fa-check"></i> Confirm Booking
                      </button>
                      <button 
                        className="cancel-button"
                        onClick={() => handleUpdateStatus(booking._id, 'Cancelled')}
                        disabled={isLoading}
                      >
                        <i className="fas fa-times"></i> Decline Booking
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Payment Instructions for Confirmed Bookings */}
                {activeTab === 'owner' && booking.status === 'Confirmed' && (
                  <div className="payment-instructions">
                    <h4>Payment Instructions</h4>
                    <p>
                      <i className="fas fa-handshake"></i> Payment will be made hand-to-hand when the rentee collects the item.
                    </p>
                    <button 
                      className="complete-button"
                      onClick={() => handleUpdateStatus(booking._id, 'Completed')}
                      disabled={isLoading}
                    >
                      <i className="fas fa-check-circle"></i> Mark as Completed
                    </button>
                  </div>
                )}
                
                {/* Message for Rentee about Pending Validation */}
                {activeTab === 'user' && booking.status === 'Pending' && (
                  <div className="pending-validation">
                    <p>
                      <i className="fas fa-clock"></i> Waiting for the renter to validate your booking.
                    </p>
                  </div>
                )}
                
                {/* Message for Rentee about Payment */}
                {activeTab === 'user' && booking.status === 'Confirmed' && (
                  <div className="payment-instructions">
                    <p>
                      <i className="fas fa-handshake"></i> Payment will be made hand-to-hand when you collect the item.
                    </p>
                  </div>
                )}
                
                <div className="booking-actions">
                <Link to={`/booking/${booking._id}`} className="view-product-btn viewbtbk">
                    View Details
                  </Link>
                  <Link to={`/product/${booking.product?._id || ''}`} className="view-product-btn">
                    View Product
                  </Link>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="payment-policy">
        <h3>Payment & Validation Policy</h3>
        <div className="policy-container">
          <div className="policy-item">
            <i className="fas fa-handshake"></i>
            <div>
              <h4>Hand-to-Hand Payments</h4>
              <p>All payments are made in person when the rentee collects the item.</p>
            </div>
          </div>
          <div className="policy-item">
            <i className="fas fa-check-circle"></i>
            <div>
              <h4>Renter Validation Required</h4>
              <p>Renters must validate all booking requests before they become active.</p>
            </div>
          </div>
          <div className="policy-item">
            <i className="fas fa-shield-alt"></i>
            <div>
              <h4>Secure Process</h4>
              <p>Our platform manages the booking process while allowing direct payment between parties.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingsList;