import React, { useState, useEffect, useRef } from 'react';
// Update the imports to include saveCart and clearCart
import { getCart, saveCart, clearCart as clearCartFromServer, getProducts, getNearbyProducts } from './services/api';
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
import BookingDetail from './pages/BookingDetail';
import ListingsList from './pages/ListingsList';
import CreateListing from './pages/CreateListing';
import { NotificationProvider } from './context/NotificationContext';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';
import IdVerification from './pages/verification/IdVerification';
import SelfieCapture from './pages/verification/SelfieCapture';
import VerificationProcessing from './pages/verification/VerificationProcessing';
import VerificationConfirmation from './pages/verification/VerificationConfirmation';
import EditListing from './components/EditListing';
import { BrowserRouter } from 'react-router-dom';
import Messages from './pages/Messages';
import { initializeSocket, closeSocket } from './services/socket';
import MessageDetail from './pages/MessageDetail';
import CompleteRegistration from './pages/CompleteRegistration';

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

// Renter only route component
const RenterRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return isAuthenticated && (user.accountType === 'renter' || user.accountType === 'both') 
    ? children 
    : <Navigate to="/" />;
};

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 500],
    location: '',
    availability: '',
    rating: '',
    radius: 10
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [cartLength, setCartLength] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [searchRadius, setSearchRadius] = useState(10);
  const [filterLocation, setFilterLocation] = useState(null);
  const [filterRadius, setFilterRadius] = useState(10);
  // Add state for maximum product price
  const [maxPrice, setMaxPrice] = useState(500); // Initial default max price

// Initialize socket if user is logged in
useEffect(() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user._id) {
        initializeSocket(user._id);
      }
    } catch (error) {
      console.error('Error initializing socket:', error);
    }
  }
  
  // Clean up socket on unmount
  return () => {
    closeSocket();
  };
}, []);

// In your login handler function, add:


// In your logout handler function, add:
const handleLogout = () => {
  // Close socket connection
  closeSocket();
};

  // Define authoritative list of available categories
  const availableCategories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Vehicles',
    'Tools & Equipment',
    'Toys & Games',
    'Other',
    'Furniture', // Added from Filters list
    'Tools',     // Added from Filters list
    'Sports'     // Added from Filters list
  ];

  // Handler for location selection from Filters
  const handleLocationSelect = (location) => {
    setFilterLocation(location);
  };

  useEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      setCartLength(JSON.parse(cartData).items.length || 0);
    }
    
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          fetchNearbyProducts(location.latitude, location.longitude, searchRadius);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // Function to fetch nearby products
  const fetchNearbyProducts = async (latitude, longitude, radius) => {
    try {
      setIsLoading(true);
      const data = await getNearbyProducts(latitude, longitude, radius);
      setNearbyProducts(data);
      // Set filtered products to nearby products as default
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error fetching nearby products:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
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
    console.log('Applying filters:', filters); // Log the filters being applied
    console.log('Products state before filtering:', products.length, products); // Log products state
    console.log('NearbyProducts state before filtering:', nearbyProducts.length, nearbyProducts); // Log nearbyProducts state
    // Start with the appropriate base list: nearbyProducts if location filter is active, otherwise the full products list
    let baseProducts = products;
    console.log('Base products before location check (' + baseProducts.length + '):', baseProducts); // Log base products before location check
    if (filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined && filterRadius > 0) {
         // If a location filter is active, start filtering from the nearbyProducts list
         // This assumes fetchNearbyProducts has already populated nearbyProducts based on filterLocation and filterRadius
         baseProducts = nearbyProducts;
         console.log('Using nearbyProducts as base (' + baseProducts.length + '):', baseProducts); // Log when nearbyProducts is used
    }

    let updatedFilteredProducts = [...baseProducts]; // Start with the determined base list

    console.log('Products after base selection (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after selecting base

    // Category Filter
    console.log('Category filter state:', filters.category); // Add this log
    // Check if category filter is active and not 'All' (represented by empty array)
    if (Array.isArray(filters.category) && filters.category.length > 0 && !filters.category.includes('All')) {
      console.log('Applying category filter:', filters.category); // Log category filter
      // Ensure filters.category is an array for includes check
      const categoriesToFilter = Array.isArray(filters.category) ? filters.category : [filters.category];
      updatedFilteredProducts = updatedFilteredProducts.filter(product =>
        categoriesToFilter.includes(product.category) || (Array.isArray(product.category) && product.category.some(cat => categoriesToFilter.includes(cat)))
      );
       console.log('Products after category filter (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after category filter
    }

    // Price Range Filter
    if (Array.isArray(filters.priceRange) && filters.priceRange.length === 2) {
      console.log('Applying price range filter:', filters.priceRange); // Log price range filter
      updatedFilteredProducts = updatedFilteredProducts.filter(product =>
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      );
       console.log('Products after price range filter (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after price filter
    }

    // Availability Filter
    if (filters.availability && filters.availability !== '') {
      console.log('Applying availability filter:', filters.availability); // Log availability filter
      updatedFilteredProducts = updatedFilteredProducts.filter(product =>
        product.availability === filters.availability
      );
       console.log('Products after availability filter (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after availability filter
    }

    // Rating Filter
    if (filters.rating && filters.rating !== '') {
      console.log('Applying rating filter:', filters.rating); // Log rating filter
      updatedFilteredProducts = updatedFilteredProducts.filter(product =>
        product.rating >= parseInt(filters.rating) || (product.rating === null && parseInt(filters.rating) === 0) // Handle products with no rating if filtering by 0 or more stars
      );
       console.log('Products after rating filter (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after rating filter
    }
    
    // Apply search query - Note: This should ideally be done on the backend for large datasets
    if (searchQuery) {
        console.log('Applying search query:', searchQuery); // Log search query
        updatedFilteredProducts = updatedFilteredProducts.filter(product =>
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          // Check if any category in the array includes the search query
          (Array.isArray(product.category) && product.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))) ||
          (typeof product.category === 'string' && product.category.toLowerCase().includes(searchQuery.toLowerCase())) // Fallback for single string category
        );
        console.log('Products after search query filter (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log after search filter
    }

    console.log('Final filtered products (' + updatedFilteredProducts.length + '):', updatedFilteredProducts); // Log the final filtered list and count
    setFilteredProducts(updatedFilteredProducts);
  }, [filters, products, nearbyProducts, filterLocation, filterRadius, searchQuery]); // Dependencies for useCallback

  // Apply filters whenever filters state or relevant data changes, except for the initial render
  const initialRender = useRef(true);
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    // Only apply filters if not currently loading nearby products (which sets filteredProducts directly)
    // and if the filters or relevant data have actually changed.
     applyFilters();

  }, [filters, products, isLoading, filterLocation, filterRadius, nearbyProducts, applyFilters, searchQuery]); // Depend on filters, products, nearbyProducts, isLoading, filterLocation, filterRadius, applyFilters, and searchQuery

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts(); // Using the API service instead of direct fetch
      setProducts(data);
      
      // If we already have nearby products, don't override
      if (!nearbyProducts.length) {
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.'); // Now using setError
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle radius change for nearby products
  const handleRadiusChange = (radius) => {
    setSearchRadius(radius);
    if (userLocation) {
      fetchNearbyProducts(userLocation.latitude, userLocation.longitude, radius);
    }
  };
  
  // Remove the second addToCart declaration and keep only the async version
  const handleFilterChange = (filterName, value) => {
    console.log(`Filter changed: ${filterName}`, value); // Log filter changes
    if (filterName === 'radius') {
      setFilterRadius(value); // Keep separate state for radius if ProductList needs it for map circle
    }
    setFilters(prevFilters => {
      const newFilters = {
        ...prevFilters,
        [filterName]: value
      };
      console.log('New filters state:', newFilters); // Log the new filter state
      return newFilters;
    });
  };
  
  const resetFilters = () => {
    console.log('Resetting filters'); // Log reset
    setFilters({
      category: '',
      priceRange: [0, maxPrice], // Reset max price to the current maxPrice
      location: '',
      availability: '',
      rating: '',
      radius: 10
    });
    setSearchQuery('');
    setFilterLocation(null);
    setFilterRadius(10);
  };
  
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    try {
      setIsLoading(true);
      if (query.trim() === '') {
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
  
  // Effect to calculate max price whenever products change
  useEffect(() => {
    if (products.length > 0) {
      const highestPrice = Math.max(...products.map(product => product.price));
      setMaxPrice(highestPrice);
      
      // Also update the priceRange filter if the current max is higher than the previous max
      // This prevents the slider from being stuck at an old lower max
      setFilters(prevFilters => {
        const currentMin = prevFilters.priceRange[0];
        const currentMax = prevFilters.priceRange[1];
        if (currentMax < highestPrice) {
          return { ...prevFilters, priceRange: [currentMin, highestPrice] };
        } else {
          return prevFilters;
        }
      });

    } else {
      setMaxPrice(500); // Reset to default if no products
       setFilters(prevFilters => ({ ...prevFilters, priceRange: [0, 500] }));
    }
  }, [products]);

  // Handler for applying filters from the modal
  const applyModalFilters = (newFilters) => {
    console.log('Applying modal filters:', newFilters); // Log the filters from modal
    setFilters(newFilters);
    // We might also need to update filterLocation and filterRadius here
    if (newFilters.location) {
      // Assuming there's a function to geocode location and update filterLocation
      // This part might need adjustment based on existing geocoding logic
       handleLocationSelect(newFilters.location); // Use the existing handler if it geocodes
    }
    if (newFilters.radius !== undefined) {
       setFilterRadius(newFilters.radius); // Update the radius state in App.js
       // Trigger fetchNearbyProducts if location is set
       if(filterLocation && filterLocation.latitude !== undefined && filterLocation.longitude !== undefined) {
          fetchNearbyProducts(filterLocation.latitude, filterLocation.longitude, newFilters.radius);
       }
    }
  };

  return (
    <BrowserRouter>
      <NotificationProvider>
        <div>
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

<Route path="/messages/:id/:rec" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <MessageDetail />
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
              <Route path="/messages" element={
              <>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <Messages />
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
            
            <Route path="/booking/:id" element={
              <ProtectedRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <BookingDetail />
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
            
            {/* Add route for creating listings - restrict to renters only */}
            <Route path="/listings/create" element={
              <RenterRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <CreateListing availableCategories={availableCategories} />
                <Footer />
              </RenterRoute>
            } />
            
            {/* Inside your Routes component, add this new route: */}
            <Route path="/edit-listing/:id" element={
              <RenterRoute>
                <Header cartItemCount={cartItems.reduce((total, item) => total + item.quantity, 0)} />
                <EditListing availableCategories={availableCategories} />
                <Footer />
              </RenterRoute>
            } />
            
            {/* Add this new route for OAuth success */}
            <Route 
              path="/auth/success" 
              element={
                <Navigate 
                  to="/" 
                  replace 
                  state={{ 
                    token: new URLSearchParams(window.location.search).get('token') 
                  }} 
                />
              } 
            />
            
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
        <FeaturedCategories onCategorySelect={handleCategorySelect} categories={availableCategories} />
      </div>
      <div className="container">
        <div className="main-content">
        {/* Removed Filter button for modal - now in ProductList */}
        {/* <button className="show-filters-btn" onClick={() => setShowFilterModal(true)}>
          <i className="fas fa-filter"></i> Show Filters
        </button> */}
        
        {/* Removed Filters Modal structure - now in ProductList */}
        {/* {showFilterModal && (
          <div className="filter-modal-overlay">
            <div className="filter-modal-content">
              <Filters 
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                userLocation={userLocation}
                onLocationSelect={handleLocationSelect}
                maxPrice={maxPrice}
                categories={availableCategories}
                isVisible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApplyFilters={applyModalFilters}
              />
            </div>
          </div>
        )} */}
        
        {/* Product List */}
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
              
              <ProductList 
                products={filteredProducts}
                onAddToCart={addToCart}
                // Pass down filter related props
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={resetFilters}
                userLocation={userLocation}
                onLocationSelect={handleLocationSelect}
                maxPrice={maxPrice}
                categories={availableCategories}
                isLoading={isLoading} // Pass isLoading prop
                onApplyFilters={applyModalFilters} // Pass the new handler for modal apply
              />
              
              <div className="payment-notice">
                <i className="fas fa-handshake"></i>
                <p>All payments are made hand-to-hand when you receive the item.</p>
                <p>Bookings must be validated by the renter before you can collect the item.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
              </>
            } />
             <Route path="/verify/id" element={<IdVerification />} />
            <Route path="/verify/selfie" element={<SelfieCapture />} />
            <Route path="/verify/processing" element={<VerificationProcessing />} />
            <Route path="/verify/confirmation" element={<VerificationConfirmation />} />

            {/* New Route for Completing Google Registration */}
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route path="/auth/google" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;

