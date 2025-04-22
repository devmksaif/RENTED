import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Product APIs
export const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
    
    const response = await axios.get(`${API_URL}/products?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await axios.post(`${API_URL}/products`, productData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.patch(`${API_URL}/products/${id}`, productData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/products/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};


// Cart APIs
export const getCart = async () => {
  try {
    const response = await axios.get(`${API_URL}/cart`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Return empty cart on error
    return { items: [] };
  }
};

export const addToCart = async (productId, quantity = 1, duration = 7, startDate = null, endDate = null) => {
  try {
    const response = await axios.post(`${API_URL}/cart/add`, {
      productId,
      quantity,
      duration,
      startDate,
      endDate
    }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (productId, quantity, duration) => {
  try {
    // First get the current cart
    const currentCart = await getCart();
    
    // Find the item and update it
    const updatedItems = currentCart.items.map(item => {
      if (item.product._id === productId) {
        return {
          ...item,
          quantity: quantity,
          duration: duration
        };
      }
      return item;
    });
    
    // Update the entire cart
    return updateCart({ items: updatedItems.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      price: item.price,
      duration: item.duration
    }))});
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  try {
    const response = await axios.delete(`${API_URL}/cart/item/${productId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await axios.delete(`${API_URL}/cart/clear`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

 
// Save cart to local storage
export const saveCart = async (cartData) => {
  try {
    // Always update local storage first with consistent structure
    const localCart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
    
    // If we have a productId, it's a single item update
    if (cartData.productId) {
      const existingItemIndex = localCart.items.findIndex(
        item => item.product && item.product._id === cartData.productId
      );
      
      if (existingItemIndex > -1) {
        // Update existing item
        localCart.items[existingItemIndex].quantity = cartData.quantity || localCart.items[existingItemIndex].quantity;
        if (cartData.duration) {
          localCart.items[existingItemIndex].duration = cartData.duration;
        }
        if (cartData.startDate) {
          localCart.items[existingItemIndex].startDate = cartData.startDate;
        }
        if (cartData.endDate) {
          localCart.items[existingItemIndex].endDate = cartData.endDate;
        }
      } else {
        // Fetch product details if not already in cart
        try {
          const product = await getProductById(cartData.productId);
          localCart.items.push({
            product: {
              _id: product._id,
              title: product.title,
              image: product.image || product.images?.[0],
              price: product.price,
              category: product.category,
              availability: product.availability,
              minRentalDays: product.minRentalDays,
              maxRentalDays: product.maxRentalDays
            },
            quantity: cartData.quantity || 1,
            duration: cartData.duration || 7,
            startDate: cartData.startDate || null,
            endDate: cartData.endDate || null,
            totalPrice: product.price * (cartData.quantity || 1) * (cartData.duration || 7)
          });
        } catch (error) {
          console.error('Error fetching product details:', error);
        }
      }
    }
    
    // Save to local storage
    localStorage.setItem('cart', JSON.stringify(localCart));
    
    // Dispatch custom event for cart update
    window.dispatchEvent(new Event('cartUpdated'));
    
    // If user is logged in, sync with server
    if (localStorage.getItem('token')) {
      try {
        if (cartData.productId) {
          // Single item update
          await addToCart(
            cartData.productId, 
            cartData.quantity || 1, 
            cartData.duration || 7,
            cartData.startDate,
            cartData.endDate
          );
        } else {
          // Full cart update
          // Implementation depends on your backend API
        }
      } catch (error) {
        console.error('Error syncing cart with server:', error);
        // Continue with local cart even if server sync fails
      }
    }
    
    return localCart;
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

// Booking APIs
export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

export const getOwnerBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings/owner`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    throw error;
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/bookings/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/bookings/${id}/status`, { status }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const cancelBooking = async (id, reason) => {
  try {
    const response = await axios.patch(`${API_URL}/bookings/${id}/cancel`, { reason }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

// Payment APIs
export const processPayment = async (paymentData) => {
  try {
    const response = await axios.post(`${API_URL}/payments/process`, paymentData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export const getUserPayments = async () => {
  try {
    const response = await axios.get(`${API_URL}/payments/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user payments:', error);
    throw error;
  }
};

export const getPaymentById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/payments/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching payment:', error);
    throw error;
  }
};

export const requestRefund = async (paymentId, reason) => {
  try {
    const response = await axios.post(`${API_URL}/payments/${paymentId}/refund`, { reason }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error requesting refund:', error);
    throw error;
  }
};

// Review APIs
export const getProductReviews = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    throw error;
  }
};

export const getUserReviews = async () => {
  try {
    const response = await axios.get(`${API_URL}/reviews/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const updateReview = async (id, reviewData) => {
  try {
    const response = await axios.patch(`${API_URL}/reviews/${id}`, reviewData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/reviews/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Notification APIs
export const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/notifications/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// User APIs
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/profile`, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/password`, passwordData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Admin APIs
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

export const getAllBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/bookings`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
};

export const adminUpdateBookingStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/admin/bookings/${id}/status`, { status }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

export const adminGetAllProducts = async (page = 1, limit = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await axios.get(`${API_URL}/admin/products?${queryParams}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw error;
  }
};

export const adminDeleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Add the missing exports that are causing errors

// For Cart.js
export const updateCart = async (cartData) => {
  try {
    const response = await axios.put(`${API_URL}/cart`, cartData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
};

// For NotificationContext.js
export const getNotifications = async () => {
  // This is an alias for getUserNotifications for backward compatibility
  return getUserNotifications();
};

// For AdminDashboard.js
export const getAdminProducts = async () => {
  // This is an alias for adminGetAllProducts for backward compatibility
  return adminGetAllProducts();
};

export const getAdminBookings = async () => {
  // This is an alias for getAllBookings for backward compatibility
  return getAllBookings();
};

export const getAdminUsers = async () => {
  // This is an alias for getAllUsers for backward compatibility
  return getAllUsers();
};

// For CreateListing.js
export const createListing = async (listingData) => {
  // This is an alias for createProduct for backward compatibility
  return createProduct(listingData);
};

// For ListingsList.js
export const getUserListings = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw error;
  }
};