import React, { useState, useEffect } from 'react';
// Update the imports to include saveCart and clearCart
import { getCart, saveCart, clearCart as clearCartFromServer, getProducts } from './services/api';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedCategories from './components/FeaturedCategories';
import ProductList from './components/ProductList';
import Filters from './components/Filters';
import Footer from './components/Footer';
import CartPage from './pages/CartPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './components/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import BookingsList from './pages/BookingsList';
import ListingsList from './pages/ListingsList';
import CreateListing from './pages/CreateListing';
import { NotificationProvider } from './context/NotificationContext';
// Remove this duplicate import
// import { getProducts } from './services/api';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Admin route component
const AdminRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return isAuthenticated && user.role === 'admin' ? children : <Navigate to="/" />;
};


function App() {

  
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: 50,
    location: '',
    availability: '',
    rating: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [cartLength , setCartLength] = useState(0);
  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setCartLength(JSON.parse(cartData).items.length || 0);
    }
  }, []);
  // Add a function to check backend connection
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_API_URL || 'http://localhost:4000');
      if (response.ok) {
        setIsConnected(true);
        console.log('✅ Connected to backend successfully');
      } else {
        setIsConnected(false);
        setError('Backend connection error: ' + response.statusText);
        console.error('❌ Backend connection error:', response.statusText);
      }
    } catch (error) {
      setIsConnected(false);
      setError('Backend connection error: ' + error.message);
      console.error('❌ Backend connection error:', error.message);
    }
  };
  
  useEffect(() => {
    // Check backend connection on mount
    checkBackendConnection();
    
    // Fetch products from backend
    fetchProducts();
  }, []);

 
  
  // Update cart sync logic
  // Add this to the useEffect section where you're syncing the cart
  useEffect(() => {
    const syncCart = async () => {
      try {
        // First load from local storage
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          const parsedCart = JSON.parse(localCart);
          setCartItems(parsedCart.items || []);
          setCartLength(parsedCart.items ? parsedCart.items.length : 0);
        }
  
        // Then fetch from server if user is logged in
        if (localStorage.getItem('token')) {
          const cartData = await getCart();
          setCartItems(cartData.items || []);
          setCartLength(cartData.items ? cartData.items.length : 0);
          // Update local storage with server data
          localStorage.setItem('cart', JSON.stringify(cartData));
        }
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    };
  
    syncCart();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        setCartItems(parsedCart.items || []);
        setCartLength(parsedCart.items ? parsedCart.items.length : 0);
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);
  
  // Update the addToCart function to dispatch the custom event
  // Update the addToCart function to accept duration parameter
  const addToCart = async (product, duration = 7) => {
    try {
      if (product.availability !== 'Available') {
        console.error('Product is not available for rent');
        return;
      }

      const existingItem = cartItems.find(item => item.product?._id === product._id);
      let updatedItems;
      
      if (existingItem) {
        updatedItems = cartItems.map(item => 
          item.product?._id === product._id 
            ? { ...item, quantity: item.quantity + 1, duration: duration } 
            : item
        );
      } else {
        updatedItems = [...cartItems, { 
          product: product,
          quantity: 1,
          price: product.price,
          duration: duration
        }];
      }
      
      setCartItems(updatedItems);
      setCartLength(updatedItems.length);
      
      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
      
      window.dispatchEvent(new Event('cartUpdated'));
      
      if (localStorage.getItem('token')) {
        await saveCart({
          productId: product._id,
          quantity: existingItem ? existingItem.quantity + 1 : 1,
          duration: duration
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const updatedItems = cartItems.filter(item => item._id !== productId);
      setCartItems(updatedItems);
      
      // Update local storage
      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
      
      // Sync with server if user is logged in
      if (localStorage.getItem('token')) {
        await saveCart(updatedItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const updatedItems = cartItems.map(item => 
        item._id === productId 
          ? { ...item, quantity } 
          : item
      );
      setCartItems(updatedItems);
      
      // Update local storage
      localStorage.setItem('cart', JSON.stringify({ items: updatedItems }));
      
      // Sync with server if user is logged in
      if (localStorage.getItem('token')) {
        await saveCart(updatedItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
      
      // Clear local storage cart
      localStorage.setItem('cart', JSON.stringify({ items: [] }));
      
      // Sync with server if user is logged in
      if (localStorage.getItem('token')) {
        await clearCartFromServer();
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };
  // Use useCallback to memoize the applyFilters function
  const applyFilters = React.useCallback(() => {
    let filtered = [...products];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => product.price <= filters.priceRange);
    }
    
    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        product.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Apply availability filter
    if (filters.availability) {
      filtered = filtered.filter(product => product.availability === filters.availability);
    }
    
    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(product => product.rating >= parseInt(filters.rating));
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  }, [filters, products, searchQuery]); // Dependencies for useCallback
  

  useEffect(() => {
    // Apply filters when filter state or search query changes
    applyFilters();
  }, [filters, products, searchQuery, applyFilters]); // Added applyFilters to dependency array
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts(); // Using the API service instead of direct fetch
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.'); // Now using setError
    } finally {
      setIsLoading(false);
    }
  };
  
  
  // Remove the second addToCart declaration and keep only the async version
  const handleFilterChange = (filterName, value) => {
    setFilters({
      ...filters,
      [filterName]: value
    });
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: 50,
      location: '',
      availability: '',
      rating: ''
    });
    setSearchQuery('');
  };
  
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    try {
      setIsLoading(true);
      if (query.trim() === '') {
        // If search is cleared, reset to all products
        setFilteredProducts(products);
      } else {
        // Use the backend search endpoint
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/products/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('Search failed');
        }
        const data = await response.json();
        setFilteredProducts(data);
      }
      setError(null);
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCategorySelect = (category) => {
    setFilters({
      ...filters,
      category
    });
  };
  
  // Remove duplicate cart functions since we already have the async versions above
  
  return (
    <Router>
      <NotificationProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <Checkout cartItems={cartItems} />
                <Footer />
              </>
            } />
            <Route path="/checkout-success" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <CheckoutSuccess />
                <Footer />
              </>
            }
            />
            {/* Product Detail Page */}
            <Route path="/product/:id" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <ProductDetail onAddToCart={addToCart} />
                <Footer />
              </>
            } />
            
            {/* Cart Page */}
            <Route path="/cart" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <CartPage 
                  cartItems={cartItems} 
                  removeFromCart={removeFromCart} 
                  updateQuantity={updateQuantity} 
                  clearCart={clearCart}
                />
                <Footer />
              </>
            } />
            
            {/* Protected Routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <UserProfile />
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/bookings" element={
              <ProtectedRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <BookingsList />
                <Footer />
              </ProtectedRoute>
            } />
            
            <Route path="/listings" element={
              <ProtectedRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <ListingsList />
                <Footer />
              </ProtectedRoute>
            } />
            
            {/* Add route for creating listings */}
            <Route path="/listings/create" element={
              <ProtectedRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <CreateListing />
                <Footer />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            
            {/* Home Page */}
            <Route path="/" element={
              <>
              <div className="App">
      <Header cartItemCount={cartLength} />
      <Hero onSearch={handleSearch} />
      <div className="container">
        <FeaturedCategories onCategorySelect={handleCategorySelect} />
      </div>
      <div className="container">
        <div className="main-content">
          <Filters 
            filters={filters} 
            onFilterChange={handleFilterChange} 
            onResetFilters={resetFilters} 
          />
          {isLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="product-container">
              {searchQuery && (
                <div className="search-results-header">
                  <h2>Search results for "{searchQuery}"</h2>
                  <button className="clear-search" onClick={() => setSearchQuery('')}>
                    Clear search
                  </button>
                </div>
              )}
              <ProductList products={filteredProducts} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
              </>
            } />
          </Routes>
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;
