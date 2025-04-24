import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import { Link } from 'react-router-dom';
import '../styles/CartPage.css';

function CartPage() {
  const [cartItemCount, setCartItemCount] = useState(0);
  
  useEffect(() => {
    // Get cart data from local storage and update cart item count
    const updateCartCount = () => {
      try {
        const cartData = localStorage.getItem('cart');
        if (cartData) {
          const parsedCart = JSON.parse(cartData);
          if (parsedCart && Array.isArray(parsedCart.items)) {
            const count = parsedCart.items.reduce((total, item) => total + (item.quantity || 1), 0);
            setCartItemCount(count);
          } else if (parsedCart && typeof parsedCart === 'object' && !Array.isArray(parsedCart)) {
            // Handle case where cart might be stored without 'items' property
            setCartItemCount(parsedCart.items ? parsedCart.items.reduce((total, item) => total + (item.quantity || 1), 0) : 0);
          } else {
            setCartItemCount(0);
          }
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCartItemCount(0);
      }
    };
    
    // Initial count
    updateCartCount();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event listener for cart updates
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return (
    <div className="App">
       
      <div className="container">
        <div className="cart-page">
          <div className="cart-page-header">
            <h1>Shopping Cart</h1>
            <p>Review your rental items before proceeding to checkout</p>
          </div>
          <Cart onCartUpdate={() => {
            // Dispatch custom event when cart is updated
            window.dispatchEvent(new Event('cartUpdated'));
          }} />
          <div className="cart-actions">
            <Link to="/" className="continue-shopping">
              <i className="fas fa-arrow-left"></i> Continue Shopping
            </Link>
           
          </div>
        </div>
      </div>
 
    </div>
  );
}

export default CartPage;