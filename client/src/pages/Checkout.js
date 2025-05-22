import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, createBooking, processPayment, clearCart, getProductById } from '../services/api';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'cash-on-delivery',
    savePaymentInfo: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [loadingCart, setLoadingCart] = useState(true);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [cardType, setCardType] = useState('');

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoadingCart(true);
        const cartData = await getCart();
        setCartItems(cartData.items || []);
        
        // Log cart items for debugging
        console.log('Cart items loaded:', cartData.items);
        
        // Redirect if cart is empty
        if (!cartData.items || cartData.items.length === 0) {
          navigate('/cart');
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        setError('Failed to load cart data. Please try again.');
      } finally {
        setLoadingCart(false);
      }
    };
    
    fetchCartData();
    
    // Pre-fill user data if available
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setFormData(prev => ({ 
        ...prev, 
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        zipCode: user.zipCode || ''
      }));
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * item.quantity * (item.duration || 7)), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.08; // 8% tax
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const nextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Add this function to handle step navigation
  const goToStep = (newStep) => {
    if (newStep < 1 || newStep > 3) return;
    
    // Validate before proceeding to next step
    if (newStep > step) {
      if (step === 1 && !validateShippingInfo()) {
        return;
      }
      if (step === 2 && !validatePaymentInfo()) {
        return;
      }
    }
    
    setStep(newStep);
    window.scrollTo(0, 0);
  };
  
  // Update the validateShippingInfo function with more comprehensive validation
  const validateShippingInfo = () => {
    const errors = [];
    const { firstName, lastName, email, address, city, state, zipCode } = formData;
    
    // Check for empty fields
    if (!firstName.trim()) errors.push('First name is required');
    if (!lastName.trim()) errors.push('Last name is required');
    if (!email.trim()) errors.push('Email is required');
    if (!address.trim()) errors.push('Address is required');
    if (!city.trim()) errors.push('City is required');
    if (!state.trim()) errors.push('State is required');
    if (!zipCode.trim()) errors.push('Zip code is required');
    if (!deliveryDate) errors.push('Delivery date is required');
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    // Zip code validation (changed from US format to 4-digit)
    const zipRegex = /^\d{4}$/;
    if (zipCode && !zipRegex.test(zipCode)) {
      errors.push('Please enter a valid 4-digit zip code');
    }
    
    // Validate delivery date
    if (deliveryDate) {
      const selectedDate = new Date(deliveryDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      if (selectedDate < tomorrow) {
        errors.push('Delivery date must be tomorrow or later');
      }
    }
    
    if (errors.length > 0) {
      setError(errors.join('. '));
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const validatePaymentInfo = () => {
    // For cash on delivery, no additional validation needed
    if (formData.paymentMethod === 'cash-on-delivery') {
      return true;
    }
    
    // For credit card, validate card details
    if (formData.paymentMethod === 'credit-card') {
      const errors = [];
      const { cardNumber, expiryDate, cvv, nameOnCard } = formData;
      
      // Check required fields
      if (!cardNumber) errors.push('Card number is required');
      if (!expiryDate) errors.push('Expiry date is required');
      if (!cvv) errors.push('CVV is required');
      if (!nameOnCard) errors.push('Name on card is required');
      
      // Basic format validation
      if (cardNumber && !/^\d{13,19}$/.test(cardNumber.replace(/\s/g, ''))) {
        errors.push('Please enter a valid card number');
      }
      
      if (expiryDate && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        errors.push('Expiry date must be in MM/YY format');
      }
      
      if (cvv && !/^\d{3,4}$/.test(cvv)) {
        errors.push('CVV must be 3 or 4 digits');
      }
      
      if (errors.length > 0) {
        setError(errors.join('. '));
        return false;
      }
    }
    
    setError(null);
    return true;
  };

  const getMinDeliveryDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const detectCardType = (number) => {
    // Card type patterns
    const patterns = {
      visa: /^4/,
      mastercard: /^5[1-5]/,
      amex: /^3[47]/,
      discover: /^6(?:011|5)/,
    };
    
    // Remove spaces and dashes
    const cardNumber = number.replace(/[\s-]/g, '');
    
    // Check each pattern
    if (patterns.visa.test(cardNumber)) return 'visa';
    if (patterns.mastercard.test(cardNumber)) return 'mastercard';
    if (patterns.amex.test(cardNumber)) return 'amex';
    if (patterns.discover.test(cardNumber)) return 'discover';
    
    return '';
  };

  // Update the checkProductAvailability function to log more details
  const checkProductAvailability = async (productId) => {
    try {
      const product = await getProductById(productId);
      console.log(`Checking availability for product ${productId}:`, product.title, product.availability);
      
      if (product.availability !== 'Available') {
        console.warn(`Product ${product.title} is not available: ${product.availability}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking product availability:', error);
      return false;
    }
  };

  // Update handleSubmit to better handle date conversions with time zones
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data before proceeding
      if (!validateShippingInfo() || !validatePaymentInfo()) {
        setIsLoading(false);
        return;
      }

      // Check availability for all products first
      const unavailableProducts = [];
      for (const item of cartItems) {
        const isAvailable = await checkProductAvailability(item.product._id);
        if (!isAvailable) {
          unavailableProducts.push({
            id: item.product._id,
            title: item.product.title
          });
        }
      }

      // If any products are unavailable, show error and stop
      if (unavailableProducts.length > 0) {
        const productTitles = unavailableProducts.map(p => p.title).join(', ');
        throw new Error(`The following items are no longer available: ${productTitles}. Please remove them from your cart and try again.`);
      }

      // Create bookings for each cart item
      const bookingResults = [];
      const failedBookings = [];

      // Create bookings one by one to better handle potential failures
      for (const item of cartItems) {
        try {
          // Parse the delivery date or use tomorrow as default
          let startDate = deliveryDate ? new Date(deliveryDate) : new Date();
          if (!deliveryDate) {
            startDate.setDate(startDate.getDate() + 1);
          }
          
          // Set to beginning of day in local timezone
          startDate = new Date(startDate.setHours(0, 0, 0, 0));
          
          // Calculate end date properly 
          const duration = item.duration || 7;
          let endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + duration);
          endDate = new Date(endDate.setHours(23, 59, 59, 999));
          
          // Format dates as ISO strings for the API
          const startDateISO = startDate.toISOString();
          const endDateISO = endDate.toISOString();
          
          // Create shipping address with proper formatting
          const shippingAddress = `${formData.firstName} ${formData.lastName}, ${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`;
          
          // Calculate total price
          const totalPrice = parseFloat((item.price * item.quantity * duration).toFixed(2));
          
          const bookingData = {
            productId: item.product._id,
            startDate: startDateISO,
            endDate: endDateISO,
            quantity: item.quantity,
            totalPrice,
            paymentMethod: formData.paymentMethod,
            shippingAddress
          };
          
          console.log(`Creating booking for ${item.product.title}:`, bookingData);
          
          const booking = await createBooking(bookingData);
          bookingResults.push(booking);
        } catch (bookingError) {
          console.error('Error creating booking for item:', item.product.title, bookingError);
          
          // Extract detailed error message
          const errorMessage = 
            bookingError.response?.data?.message || 
            bookingError.message || 
            'Failed to create booking';
          
          failedBookings.push({
            item: item,
            error: errorMessage
          });
        }
      }

      // If all bookings failed, show error and stop
      if (bookingResults.length === 0) {
        if (failedBookings.length > 0) {
          const mostCommonError = getMostCommonError(failedBookings);
          throw new Error(`Booking failed: ${mostCommonError}`);
        } else {
          throw new Error('Failed to create any bookings. Please try again.');
        }
      }

      // Process payment for successful bookings
      const paymentData = {
        bookingIds: bookingResults.map(booking => booking._id),
        paymentMethod: formData.paymentMethod,
        amount: calculateTotal()
      };
      
      const paymentResponse = await processPayment(paymentData);
      
      // Clear cart after successful checkout
      await clearCart();
      
      // Dispatch cart updated event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to success page with appropriate data
      navigate('/checkout-success', { 
        state: { 
          bookings: bookingResults,
          totalAmount: calculateTotal(),
          paymentMethod: formData.paymentMethod,
          failedBookings: failedBookings.length > 0 ? failedBookings : null,
          deliveryDate: deliveryDate || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
        } 
      });
    } catch (error) {
      console.error('Checkout error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with an error status
        const errorMessage = error.response.data?.message || 'Server error occurred during checkout';
        setError(errorMessage);
      } else if (error.request) {
        // Request was made but no response received (network issue)
        setError('Network error. Please check your internet connection and try again.');
      } else {
        // Error in setting up the request
        setError(error.message || 'Failed to complete checkout. Please try again later.');
      }
      
      // Scroll to top to make error message visible
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  // Add helper function to get the most common error
  const getMostCommonError = (failedBookings) => {
    const errorCounts = {};
    
    failedBookings.forEach(booking => {
      if (errorCounts[booking.error]) {
        errorCounts[booking.error]++;
      } else {
        errorCounts[booking.error] = 1;
      }
    });
    
    let mostCommonError = 'Unknown error';
    let maxCount = 0;
    
    Object.entries(errorCounts).forEach(([error, count]) => {
      if (count > maxCount) {
        mostCommonError = error;
        maxCount = count;
      }
    });
    
    return mostCommonError;
  };

  if (loadingCart) {
    return <div className="loading">Loading checkout data...</div>;
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-number">{step > 1 ? '✓' : '1'}</div>
            <div className="step-label">Shipping</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-number">{step > 2 ? '✓' : '2'}</div>
            <div className="step-label">Payment</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${(step - 1) * 50}%` }}
          ></div>
        </div>
      </div>

      {error && (
        <div className="checkout-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {loadingCart ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      ) : (
        <div className="checkout-content">
          <div className="checkout-form-container">
            {step === 1 && (
              <div className="shipping-info">
                <h2>Shipping Information</h2>
                <form onSubmit={(e) => { e.preventDefault(); if (validateShippingInfo()) goToStep(2); }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="city">City</label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="state">State</label>
                      <input
                        type="text"
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="zipCode">Zip Code</label>
                      <input
                        type="text"
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="deliveryDate">Preferred Delivery Date</label>
                    <input
                      type="date"
                      id="deliveryDate"
                      min={getMinDeliveryDate()}
                      value={deliveryDate || ''}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      required
                    />
                    <small className="form-text">Delivery is available starting tomorrow</small>
                  </div>
                  <div className="form-buttons">
                    <Link to="/cart" className="back-button">
                      <i className="fas fa-arrow-left"></i> Back to Cart
                    </Link>
                    <button 
                      type="submit" 
                      className="next-button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (validateShippingInfo()) {
                          goToStep(2);
                        }
                      }}
                    >
                      Continue to Payment <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 2 && (
              <div className="payment-info">
                <h2>Payment Method</h2>
                <form onSubmit={(e) => { e.preventDefault(); if (validatePaymentInfo()) goToStep(3); }}>
                  <div className="payment-methods">
                    <div className="payment-method">
                      <input
                        type="radio"
                        id="cash-on-delivery"
                        name="paymentMethod"
                        value="cash-on-delivery"
                        checked={formData.paymentMethod === 'cash-on-delivery'}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      />
                      <label htmlFor="cash-on-delivery">
                        <i className="fas fa-money-bill-wave"></i>
                        Cash on Delivery
                      </label>
                    </div>
                    <div className="payment-method">
                      <input
                        type="radio"
                        id="credit-card"
                        name="paymentMethod"
                        value="credit-card"
                        checked={formData.paymentMethod === 'credit-card'}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      />
                      <label htmlFor="credit-card">
                        <i className="fas fa-credit-card"></i>
                        Credit Card
                      </label>
                    </div>
                    <div className="payment-method">
                      <input
                        type="radio"
                        id="paypal"
                        name="paymentMethod"
                        value="paypal"
                        checked={formData.paymentMethod === 'paypal'}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                      />
                      <label htmlFor="paypal">
                        <i className="fab fa-paypal"></i>
                        PayPal
                      </label>
                    </div>
                  </div>
                  
                  {formData.paymentMethod === 'credit-card' && (
                    <div className="credit-card-details">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Card Number</label>
                        <div className="card-input-container">
                          {cardType ? (
                            <i className={`fab fa-cc-${cardType}`}></i>
                          ) : (
                            <i className="fas fa-credit-card"></i>
                          )}
                          <input 
                            type="text" 
                            id="cardNumber" 
                            name="cardNumber"
                            placeholder="1234 5678 9012 3456" 
                            value={formData.cardNumber || ''}
                            onChange={(e) => {
                              // Format card number with spaces every 4 digits
                              const value = e.target.value.replace(/\D/g, '').substring(0, 16);
                              const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                              setFormData({...formData, cardNumber: formattedValue});
                              
                              // Detect card type
                              const detectedType = detectCardType(value);
                              setCardType(detectedType);
                            }}
                            maxLength={19}
                          />
                        </div>
                        {cardType && (
                          <div className="card-type-indicator">
                            <span>We've detected a {cardType.charAt(0).toUpperCase() + cardType.slice(1)} card</span>
                          </div>
                        )}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input 
                            type="text" 
                            id="expiryDate" 
                            name="expiryDate"
                            placeholder="MM/YY" 
                            value={formData.expiryDate || ''}
                            onChange={(e) => {
                              // Format expiry date as MM/YY
                              const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                              let formattedValue = value;
                              if (value.length > 2) {
                                formattedValue = value.slice(0, 2) + '/' + value.slice(2);
                              }
                              setFormData({...formData, expiryDate: formattedValue});
                            }}
                            maxLength={5}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input 
                            type="text" 
                            id="cvv" 
                            name="cvv"
                            placeholder="123" 
                            value={formData.cvv || ''}
                            onChange={(e) => {
                              // Allow only digits for CVV
                              const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                              setFormData({...formData, cvv: value});
                            }}
                            maxLength={4}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="nameOnCard">Name on Card</label>
                        <input 
                          type="text" 
                          id="nameOnCard" 
                          name="nameOnCard"
                          placeholder="John Doe" 
                          value={formData.nameOnCard || ''}
                          onChange={(e) => setFormData({...formData, nameOnCard: e.target.value})}
                        />
                      </div>
                      <div className="card-security-message">
                        <i className="fas fa-lock"></i>
                        <span>Your payment information is secured with SSL encryption</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="form-buttons">
                    <button type="button" className="back-button" onClick={() => goToStep(1)}>
                      <i className="fas fa-arrow-left"></i> Back to Shipping
                    </button>
                    <button 
                      type="submit" 
                      className="next-button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (validatePaymentInfo()) {
                          goToStep(3);
                        }
                      }}
                    >
                      Review Order <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {step === 3 && (
              <div className="order-review">
                <h2>Review Your Order</h2>
                <div className="review-sections">
                  <div className="review-section">
                    <h3>Shipping Information</h3>
                    <div className="review-details">
                      <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Address:</strong> {formData.address}, {formData.city}, {formData.state} {formData.zipCode}</p>
                      <p><strong>Delivery Date:</strong> {deliveryDate ? new Date(deliveryDate).toLocaleDateString() : new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString()}</p>
                    </div>
                    <button className="edit-button" onClick={() => goToStep(1)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                  </div>
                  
                  <div className="review-section">
                    <h3>Payment Method</h3>
                    <div className="review-details">
                      <p>
                        {formData.paymentMethod === 'cash-on-delivery' && (
                          <><i className="fas fa-money-bill-wave"></i> Cash on Delivery</>
                        )}
                        {formData.paymentMethod === 'credit-card' && (
                          <><i className="fas fa-credit-card"></i> Credit Card</>
                        )}
                        {formData.paymentMethod === 'paypal' && (
                          <><i className="fab fa-paypal"></i> PayPal</>
                        )}
                      </p>
                    </div>
                    <button className="edit-button" onClick={() => goToStep(2)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                  </div>
                </div>
                
                <div className="order-items">
                  <h3>Order Items</h3>
                  {cartItems.map(item => (
                    <div key={item.product._id} className="order-item">
                      <div className="item-image">
                        <img src={item.product.image || 'https://via.placeholder.com/80x80'} alt={item.product.title} />
                      </div>
                      <div className="item-details">
                        <h4>{item.product.title}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Rental Period: {item.duration || 7} days</p>
                      </div>
                      <div className="item-price">
                        ${(item.price * item.quantity * (item.duration || 7)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="order-summary">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button type="button" className="back-button" onClick={() => goToStep(2)}>
                    <i className="fas fa-arrow-left"></i> Back to Payment
                  </button>
                  <button 
                    type="submit" 
                    className="place-order-button" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="button-spinner"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-shopping-cart"></i> Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="order-summary-sidebar">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.product._id} className="summary-item">
                  <div className="summary-item-image">
                    <img src={item.product.image || 'https://via.placeholder.com/50x50'} alt={item.product.title} />
                    <span className="item-quantity">{item.quantity}</span>
                  </div>
                  <div className="summary-item-details">
                    <p className="item-title">{item.product.title}</p>
                    <p className="item-duration">{item.duration || 7} days rental</p>
                  </div>
                  <div className="summary-item-price">
                    ${(item.price * item.quantity * (item.duration || 7)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%):</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loader-overlay">
          <div className="loader-content">
            <div className="loader-spinner"></div>
            <p>Processing your order...</p>
            <p className="loader-subtitle">Please don't refresh or navigate away from this page.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;