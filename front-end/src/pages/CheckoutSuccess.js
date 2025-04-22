import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/CheckoutSuccess.css';

function CheckoutSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookings, totalAmount, paymentMethod } = location.state || {};
  
  useEffect(() => {
    // If no booking data is available, redirect to home
    if (!bookings) {
      navigate('/');
    }
    
    // Clear cart from local storage
    localStorage.removeItem('cart');
    
    // Dispatch event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
  }, [bookings, navigate]);
  
  if (!bookings) {
    return null; // Will redirect in useEffect
  }
  
  // Get the first booking to display order details
  const firstBooking = bookings[0];
  const orderDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Generate a random order number
  const orderNumber = `ORD-${Math.floor(Math.random() * 10000)}-${Date.now().toString().slice(-4)}`;
  
  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-header">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order. Your rental has been successfully placed.</p>
        </div>
        
        <div className="order-details">
          <div className="order-info">
            <div className="info-item">
              <span className="info-label">Order Number:</span>
              <span className="info-value">{orderNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Order Date:</span>
              <span className="info-value">{orderDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Payment Method:</span>
              <span className="info-value">
                {paymentMethod === 'cash-on-delivery' && (
                  <><i className="fas fa-money-bill-wave"></i> Cash on Delivery</>
                )}
                {paymentMethod === 'credit-card' && (
                  <><i className="fas fa-credit-card"></i> Credit Card</>
                )}
                {paymentMethod === 'paypal' && (
                  <><i className="fab fa-paypal"></i> PayPal</>
                )}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Amount:</span>
              <span className="info-value">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="shipping-address">
            <h3>Shipping Address</h3>
            <p>{firstBooking.shippingAddress}</p>
          </div>
        </div>
        
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="order-items">
            {bookings.map((booking, index) => (
              <div key={booking._id} className="order-item">
                <div className="item-image">
                  <img 
                    src={booking.product?.image || 'https://via.placeholder.com/80x80'} 
                    alt={booking.product?.title || `Item ${index + 1}`} 
                  />
                </div>
                <div className="item-details">
                  <h4>{booking.product?.title || `Item ${index + 1}`}</h4>
                  <p>Quantity: {booking.quantity}</p>
                  <p>Rental Period: {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}</p>
                  <p>Duration: {Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24))} days</p>
                </div>
                <div className="item-price">
                  ${booking.totalPrice.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="next-steps">
          <h3>What's Next?</h3>
          <div className="steps-list">
            <div className="step-item">
              <div className="step-icon">
                <i className="fas fa-box"></i>
              </div>
              <div className="step-content">
                <h4>Preparing Your Order</h4>
                <p>We're preparing your items for delivery. You'll receive an email when your order ships.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-icon">
                <i className="fas fa-truck"></i>
              </div>
              <div className="step-content">
                <h4>Delivery</h4>
                <p>Your items will be delivered to your address within 2-3 business days.</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-icon">
                <i className="fas fa-undo"></i>
              </div>
              <div className="step-content">
                <h4>Return</h4>
                <p>Return instructions will be included with your order. Make sure to return items by the end of your rental period.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="success-actions">
          <Link to="/bookings" className="view-bookings-btn">
            <i className="fas fa-list"></i> View My Bookings
          </Link>
          <Link to="/" className="continue-shopping-btn">
            <i className="fas fa-home"></i> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CheckoutSuccess;