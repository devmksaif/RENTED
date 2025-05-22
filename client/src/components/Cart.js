import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCart, removeFromCart as removeItem, clearCart as clearCartApi, updateCartItem } from '../services/api';
import '../styles/Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      // Try to get cart from local storage first
      const localCartString = localStorage.getItem('cart');
      
      if (localCartString) {
        try {
          const localCart = JSON.parse(localCartString);
          if (localCart && Array.isArray(localCart.items)) {
            // Ensure date strings are properly formatted for date inputs
            const formattedItems = localCart.items.map(item => ({
              ...item,
              startDate: item.startDate || '',
              endDate: item.endDate || ''
            }));
            setCartItems(formattedItems);
          } else if (localCart && Array.isArray(localCart)) {
            // Handle case where cart might be stored as an array
            const formattedItems = localCart.map(item => ({
              ...item,
              startDate: item.startDate || '',
              endDate: item.endDate || ''
            }));
            setCartItems(formattedItems);
          } else if (localCart && typeof localCart === 'object' && !Array.isArray(localCart)) {
            // Handle case where cart might be stored without 'items' property
            const items = localCart.items || [];
            const formattedItems = items.map(item => ({
              ...item,
              startDate: item.startDate || '',
              endDate: item.endDate || ''
            }));
            setCartItems(formattedItems);
          } else {
            setCartItems([]);
          }
        } catch (parseError) {
          console.error('Error parsing local cart:', parseError);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
      
      // Then fetch from server to ensure we have the latest data
      if (localStorage.getItem('token')) {
        try {
          const cartData = await getCart();
          if (cartData && Array.isArray(cartData.items)) {
            // Ensure date strings are properly formatted for date inputs
            const formattedItems = cartData.items.map(item => ({
              ...item,
              startDate: item.startDate || '',
              endDate: item.endDate || ''
            }));
            setCartItems(formattedItems);
            
            // Save to local storage with consistent structure
            localStorage.setItem('cart', JSON.stringify({ items: formattedItems }));
          } else if (cartData && Array.isArray(cartData)) {
            // Ensure date strings are properly formatted for date inputs
            const formattedItems = cartData.map(item => ({
              ...item,
              startDate: item.startDate || '',
              endDate: item.endDate || ''
            }));
            setCartItems(formattedItems);
            
            // Save to local storage with consistent structure
            localStorage.setItem('cart', JSON.stringify({ items: formattedItems }));
          }
        } catch (serverError) {
          console.error('Error fetching cart from server:', serverError);
          // Continue with local cart if server fetch fails
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error in fetchCart:', error);
      setLoading(false);
      setError('Failed to load cart. Please try again.');
    }
  };

  // Listen for cart updates
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      // If user is logged in, remove from server
      if (localStorage.getItem('token')) {
        await removeItem(productId);
      }
      
      // Update local state
      setCartItems(cartItems.filter(item => item.product._id !== productId));
      
      // Update local storage
      const updatedCart = {
        items: cartItems.filter(item => item.product._id !== productId)
      };
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Dispatch custom event for cart update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      // Update local state first for responsive UI
      const updatedItems = cartItems.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      
      setCartItems(updatedItems);
      
      // Update local storage
      const updatedCart = { items: updatedItems };
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Update on server if user is logged in
      if (localStorage.getItem('token')) {
        const item = updatedItems.find(item => item.product._id === productId);
        if (item) {
          await updateCartItem(productId, newQuantity, item.duration || 7, item.startDate, item.endDate);
        }
      }
      
      // Don't dispatch cartUpdated event here to prevent fetchCart from being called
      // which would reset the UI state
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError('Failed to update quantity. Please try again.');
      // Don't call fetchCart() here as it resets the UI state
    }
  };

  const handleUpdateDuration = async (productId, newDuration) => {
    try {
      // Update local state first for responsive UI
      const updatedItems = cartItems.map(item => {
        if (item.product._id === productId) {
          // Calculate end date based on start date and new duration
          let endDate = null;
          let startDate = item.startDate;
          
          // If no start date exists, set it to today
          if (!startDate) {
            startDate = new Date().toISOString().split('T')[0];
          }
          
          // Calculate end date
          const startDateObj = new Date(startDate);
          endDate = new Date(startDateObj);
          endDate.setDate(startDateObj.getDate() + parseInt(newDuration));
          endDate = endDate.toISOString().split('T')[0];
          
          return { 
            ...item, 
            duration: parseInt(newDuration),
            startDate: startDate,
            endDate: endDate
          };
        }
        return item;
      });
      
      setCartItems(updatedItems);
      
      // Update local storage immediately
      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));

      // Update on server if user is logged in
      if (localStorage.getItem('token')) {
        const item = updatedItems.find(item => item.product._id === productId);
        if (item) {
          await updateCartItem(productId, item.quantity, parseInt(newDuration), item.startDate, item.endDate);
        }
      }
      
      // Don't dispatch cartUpdated event here to prevent fetchCart from being called
      // which would reset the UI state
    } catch (error) {
      console.error('Error updating duration:', error);
      setError('Failed to update rental duration. Please try again.');
      // Don't call fetchCart() here as it resets the UI state
    }
  };

  const handleUpdateDates = async (productId, startDate, endDate) => {
    try {
      // If start date is provided but end date is not, calculate end date based on duration
      if (startDate && !endDate) {
        const item = cartItems.find(item => item.product._id === productId);
        if (item) {
          const duration = item.duration || 7;
          const startDateObj = new Date(startDate);
          const newEndDate = new Date(startDateObj);
          newEndDate.setDate(startDateObj.getDate() + parseInt(duration));
          endDate = newEndDate.toISOString().split('T')[0];
        }
      }
      
      // If end date is provided but start date is not, use today as start date
      if (!startDate && endDate) {
        startDate = new Date().toISOString().split('T')[0];
      }
      
      // Calculate duration from dates
      let diffDays = 7; // Default duration
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Ensure minimum duration of 1 day
        diffDays = Math.max(1, diffDays);
      }
      
      // Don't update local state here since we already did it in the onChange handler
      // This prevents the UI from flickering or resetting
      
      // Update on server if user is logged in
      if (localStorage.getItem('token')) {
        const item = cartItems.find(item => item.product._id === productId);
        if (item) {
          await updateCartItem(productId, item.quantity, diffDays, startDate, endDate);
        }
      }
      
      // Don't dispatch cartUpdated event here to prevent fetchCart from being called
      // which would reset the UI state
    } catch (error) {
      console.error('Error updating dates:', error);
      setError('Failed to update rental dates. Please try again.');
      // Don't call fetchCart() here as it resets the UI state
    }
  };

  const handleClearCart = async () => {
    try {
      // Clear from server if user is logged in
      if (localStorage.getItem('token')) {
        await clearCartApi();
      }
      
      // Update local state
      setCartItems([]);
      
      // Clear from local storage
      localStorage.removeItem('cart');
      
      // Dispatch custom event for cart update
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart. Please try again.');
    }
  };

  const calculateItemTotal = (item) => {
    return item.price * item.quantity * (item.duration || 7);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount;
  };

  const handleApplyPromoCode = () => {
    if (promoCode.toLowerCase() === 'rent10') {
      const discountAmount = calculateSubtotal() * 0.1;
      setDiscount(discountAmount);
      setPromoCode('');
    } else {
      setError('Invalid promo code. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h2 className="cart-title">Your Cart</h2>
        <div className="empty-cart">
          <div className="empty-cart-icon">
            <i className="fas fa-shopping-cart"></i>
          </div>
          <p className="empty-cart-message">Your cart is empty</p>
          <p className="empty-cart-submessage">Add some items to get started</p>
          <Link to="/" className="continue-shopping-link">
            <i className="fas fa-arrow-left"></i> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      {error && <div className="cart-error">{error}</div>}
      
      <div className="cart-header">
        <h2 className="cart-title">Your Cart</h2>
        <button className="clear-cart-btn" onClick={handleClearCart}>
          <i className="fas fa-trash-alt"></i> Clear Cart
        </button>
      </div>

      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item.product._id} className="cart-item">
            <div className="cart-item-image">
              <img src={item.product.image || 'https://via.placeholder.com/100x100'} alt={item.product.title} />
            </div>
            <div className="cart-item-details">
              <h3 className="cart-item-title">{item.product.title}</h3>
              <p className="cart-item-price">${item.price}/day</p>
              <div className="cart-item-category">{item.product.category}</div>
              
              {item.product.availability !== "Available" && (
                <div className="item-warning">
                  <i className="fas fa-exclamation-triangle"></i>
                  This item is currently {item.product.availability.toLowerCase()}
                </div>
              )}
              
              <div className="rental-duration">
                <label htmlFor={`duration-${item.product._id}`}>Rental duration:</label>
                <select 
                  id={`duration-${item.product._id}`}
                  value={item.duration || 7}
                  onChange={(e) => handleUpdateDuration(item.product._id, e.target.value)}
                  className="duration-select"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(days => (
                    <option key={days} value={days}>
                      {days} {days === 1 ? 'day' : 'days'}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="rental-dates">
                <div className="date-input-group">
                  <label>Start Date:</label>
                  <input 
                    type="date" 
                    value={item.startDate || ''}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newStartDate = e.target.value;
                      let newEndDate = item.endDate;
                      
                      // If we have an end date, make sure it's after the new start date
                      if (item.endDate && new Date(newStartDate) > new Date(item.endDate)) {
                        const startDate = new Date(newStartDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + (item.duration || 7));
                        newEndDate = endDate.toISOString().split('T')[0];
                      } else if (!item.endDate) {
                        // If no end date exists, calculate it based on duration
                        const startDate = new Date(newStartDate);
                        const endDate = new Date(startDate);
                        endDate.setDate(startDate.getDate() + (item.duration || 7));
                        newEndDate = endDate.toISOString().split('T')[0];
                      }
                      
                      // Update the cart item immediately in local state
                      const updatedItems = cartItems.map(cartItem => 
                        cartItem.product._id === item.product._id 
                          ? { ...cartItem, startDate: newStartDate, endDate: newEndDate } 
                          : cartItem
                      );
                      setCartItems(updatedItems);
                      
                      // Update local storage immediately
                      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
                      
                      // Then call the API update
                      handleUpdateDates(item.product._id, newStartDate, newEndDate);
                    }}
                  />
                </div>
                <div className="date-input-group">
                  <label>End Date:</label>
                  <input 
                    type="date" 
                    value={item.endDate || ''}
                    min={item.startDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      const newEndDate = e.target.value;
                      // Make sure we have a start date
                      const startDate = item.startDate || new Date().toISOString().split('T')[0];
                      
                      // Update the cart item immediately in local state
                      const updatedItems = cartItems.map(cartItem => 
                        cartItem.product._id === item.product._id 
                          ? { ...cartItem, startDate: startDate, endDate: newEndDate } 
                          : cartItem
                      );
                      setCartItems(updatedItems);
                      
                      // Update local storage immediately
                      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
                      
                      // Then call the API update
                      handleUpdateDates(item.product._id, startDate, newEndDate);
                    }}
                  />
                </div>
              </div>
              
              <p className="item-subtotal">
                Subtotal: ${calculateItemTotal(item).toFixed(2)}
              </p>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-control">
                <button 
                  className="quantity-btn" 
                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="quantity">{item.quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
              <button 
                className="remove-btn"
                onClick={() => handleRemoveItem(item.product._id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="summary-row discount">
            <span>Discount:</span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="summary-row shipping">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        
        <div className="promo-code">
          <input 
            type="text" 
            placeholder="Enter promo code" 
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
          />
          <button onClick={handleApplyPromoCode}>Apply</button>
        </div>
        
        <div className="cart-total">
          <span>Total:</span>
          <span>${calculateTotal().toFixed(2)}</span>
        </div>
        
        <Link to="/checkout" className="checkout-btn">
          <i className="fas fa-lock"></i> Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

export default Cart;