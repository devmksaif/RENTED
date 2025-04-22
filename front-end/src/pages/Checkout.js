import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCart, createBooking, processPayment, clearCart } from '../services/api';
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

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoadingCart(true);
        const cartData = await getCart();
        setCartItems(cartData.items || []);
        
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
  
  // Add validation functions
  const validateShippingInfo = () => {
    const { firstName, lastName, email, address, city, state, zipCode } = formData;
    if (!firstName || !lastName || !email || !address || !city || !state || !zipCode) {
      setError('Please fill in all shipping information fields');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
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
    
    // Add validation for other payment methods if needed
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
  
    try {
      // Create bookings for each cart item
      const bookingPromises = cartItems.map(item => {
        // Set start date to tomorrow to avoid "Start date cannot be in the past" error
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 1); // Start date is tomorrow
        
        const endDate = new Date(startDate); // Create a new date based on start date
        endDate.setDate(startDate.getDate() + (item.duration || 7)); // Add duration days to start date
        
        return createBooking({
          productId: item.product._id,
          startDate,
          endDate,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity * (item.duration || 7),
          paymentMethod: formData.paymentMethod,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.zipCode}`
        });
      });
      
      const bookings = await Promise.all(bookingPromises);
      
      // Process payment for all bookings
      const paymentData = {
        bookingIds: bookings.map(booking => booking._id),
        paymentMethod: formData.paymentMethod,
        amount: calculateTotal()
      };
      
      const paymentResponse = await processPayment(paymentData);
      
      // Clear cart after successful checkout
      await clearCart();
      
      // Dispatch cart updated event to update cart count in header
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Redirect to success page
      navigate('/checkout/success', { 
        state: { 
          bookings,
          totalAmount: calculateTotal(),
          paymentMethod: formData.paymentMethod
        } 
      });
    } catch (error) {
      console.error('Checkout error:', error);
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to complete checkout. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
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
                  <div className="form-buttons">
                    <Link to="/cart" className="back-button">
                      <i className="fas fa-arrow-left"></i> Back to Cart
                    </Link>
                    <button type="submit" className="next-button">
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
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input type="text" id="expiryDate" placeholder="MM/YY" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV</label>
                          <input type="text" id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="nameOnCard">Name on Card</label>
                        <input type="text" id="nameOnCard" placeholder="John Doe" />
                      </div>
                    </div>
                  )}
                  
                  <div className="form-buttons">
                    <button type="button" className="back-button" onClick={() => goToStep(1)}>
                      <i className="fas fa-arrow-left"></i> Back to Shipping
                    </button>
                    <button type="submit" className="next-button">
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
                    type="button" 
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
                        Place Order <i className="fas fa-check"></i>
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
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;